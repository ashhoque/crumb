import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openSqlite } from '../persistence/sqlite.js';
import { ensurePrivateIgnore, inspectGit, inspectPath, PRIVATE_DIRECTORY, refuseTrackedPrivateData, resolveProjectRoot } from '../privacy/storage.js';
import { requireTestedRuntime } from './runtime.js';

export const APPLICATION_ID = 0x43454330;
export const DATABASE_NAME = 'cec.sqlite';

export interface InitializationResult {
  projectRoot: string;
  privateDirectory: string;
  database: string;
  created: boolean;
  gitIgnoreUpdated: boolean;
  inGit: boolean;
  foundationOnly: boolean;
}

/** Initialize metadata or reopen a recognized M0/M1 workspace without replacing it. */
export function initializeProject(input: string): InitializationResult {
  requireTestedRuntime();
  const projectRoot = resolveProjectRoot(input);
  const inGit = inspectGit(projectRoot);
  if (inGit) refuseTrackedPrivateData(projectRoot);
  const privateDirectory = join(projectRoot, PRIVATE_DIRECTORY);
  const database = join(privateDirectory, DATABASE_NAME);
  const directoryInfo = inspectPath(privateDirectory);
  if (directoryInfo && !directoryInfo.isDirectory()) throw new Error('The private workspace path is occupied by a non-directory.');
  const files = directoryInfo ? readdirSync(privateDirectory) : [];
  const allowed = new Set([DATABASE_NAME, `${DATABASE_NAME}-wal`, `${DATABASE_NAME}-shm`]);
  for (const name of files) {
    if (name === 'backups') {
      const backupRoot = join(privateDirectory, name);
      if (!inspectPath(backupRoot)?.isDirectory()) throw new Error('The backup path must be an owned directory.');
      for (const backupName of readdirSync(backupRoot)) {
        if (!/^cec-[0-9a-f-]{36}\.sqlite$/.test(backupName) || !inspectPath(join(backupRoot, backupName))?.isFile()) throw new Error('Unrecognized or linked backup entry; preserve it and review.');
      }
      continue;
    }
    if (!allowed.has(name)) throw new Error('The private workspace contains unrecognized files. Preserve them and review before initialization.');
    if (!inspectPath(join(privateDirectory, name))?.isFile()) throw new Error('Private storage entries must be regular files.');
  }
  const existingDatabase = files.includes(DATABASE_NAME);
  if (!existingDatabase && files.length > 0) throw new Error('Orphaned SQLite sidecars or backups require review before initialization.');
  // Even a read-only SQLite connection may need shared-memory sidecars in WAL
  // mode, so verify ignore protection before opening an existing database too.
  const gitIgnoreUpdated = ensurePrivateIgnore(projectRoot, inGit);
  let version = 0;
  if (existingDatabase) {
    const existing = openSqlite(database, true);
    try {
      version = Number(existing.get('PRAGMA user_version')?.['user_version']);
      if (existing.get('PRAGMA application_id')?.['application_id'] !== APPLICATION_ID || ![0, 1, 2].includes(version)) {
        throw new Error('This is not a supported CEC database. No migration or overwrite was attempted.');
      }
      if (version >= 1 && existing.get("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'cec_meta'") === undefined) throw new Error('CEC schema identity is missing. Preserve the database and review.');
      if (version === 2 && existing.get("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'prebuild_revisions'") === undefined) throw new Error('Pre-build schema identity is missing. Preserve the database and review.');
    } finally { existing.close(); }
  }
  if (!directoryInfo) mkdirSync(privateDirectory, { mode: 0o700 });
  if (!existingDatabase) {
    writeFileSync(database, Buffer.alloc(0), { flag: 'wx', mode: 0o600 });
    const connection = openSqlite(database);
    try {
      connection.transaction(() => connection.exec(`PRAGMA application_id = ${APPLICATION_ID}; PRAGMA user_version = 0;`));
    } finally { connection.close(); }
  }
  return { projectRoot, privateDirectory, database, created: !existingDatabase, gitIgnoreUpdated, inGit, foundationOnly: version === 0 };
}
