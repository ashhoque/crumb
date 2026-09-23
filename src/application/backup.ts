import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { initializeProject, APPLICATION_ID } from './initialize.js';
import { openSqlite } from '../persistence/sqlite.js';
import { inspectPath } from '../privacy/storage.js';
import { sha256 } from '../privacy/artifacts.js';

export function createBackup(target: string): { path: string; sha256: string; integrity: 'ok'; schemaVersion: number } {
  const location = initializeProject(target);
  const directory = join(location.privateDirectory, 'backups');
  if (!inspectPath(directory)) mkdirSync(directory, { mode: 0o700 });
  if (!inspectPath(directory)?.isDirectory()) throw new Error('Backup path must be an owned directory.');
  const path = join(directory, `cec-${randomUUID()}.sqlite`);
  const db = openSqlite(location.database);
  try { db.run('VACUUM INTO ?', path); }
  finally { db.close(); }
  const copy = openSqlite(path, true);
  let schemaVersion: number;
  try {
    if (copy.get('PRAGMA integrity_check')?.['integrity_check'] !== 'ok' || copy.get('PRAGMA application_id')?.['application_id'] !== APPLICATION_ID) throw new Error('Backup verification failed. The original workspace was not replaced.');
    schemaVersion = Number(copy.get('PRAGMA user_version')?.['user_version']);
  } finally { copy.close(); }
  return { path, sha256: sha256(readFileSync(path)), integrity: 'ok', schemaVersion };
}
