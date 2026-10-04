import { randomUUID } from 'node:crypto';
import type { SqliteConnection } from './sqlite.js';

/** M0 has no business data. Refuse unexpected tables rather than guessing a migration. */
export function migrateWorkflow(db: SqliteConnection): void {
  db.transaction(() => {
    const version = db.get('PRAGMA user_version')?.['user_version'];
    if (version === 1 || version === 2 || version === 3 || version === 4) {
      if (db.get('SELECT format FROM cec_meta WHERE singleton = 1')?.['format'] !== 1) throw new Error('Unsupported CEC workflow schema.');
      return;
    }
    if (version !== 0 || db.all("SELECT name FROM sqlite_schema WHERE type = 'table'").length !== 0) throw new Error('The metadata-only M0 migration found unexpected state; preserve it and review.');
    db.exec(`
      CREATE TABLE cec_meta (singleton INTEGER PRIMARY KEY CHECK(singleton = 1), format INTEGER NOT NULL CHECK(format = 1)) STRICT;
      INSERT INTO cec_meta VALUES (1, 1);
      CREATE TABLE projects (id TEXT PRIMARY KEY, created_at TEXT NOT NULL) STRICT;
      CREATE TABLE drafts (singleton INTEGER PRIMARY KEY CHECK(singleton = 1), version INTEGER NOT NULL, body TEXT NOT NULL CHECK(json_valid(body)), digest TEXT NOT NULL) STRICT;
      CREATE TABLE foundations (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), revision INTEGER NOT NULL CHECK(revision = 1), body TEXT NOT NULL CHECK(json_valid(body)), approved_at TEXT NOT NULL) STRICT;
      CREATE TABLE cycles (id TEXT PRIMARY KEY, foundation_id TEXT NOT NULL REFERENCES foundations(id), draft_hash TEXT NOT NULL UNIQUE, body TEXT NOT NULL CHECK(json_valid(body)), approved_at TEXT NOT NULL) STRICT;
      CREATE UNIQUE INDEX one_m1_cycle ON cycles ((1));
      CREATE TABLE receipts (id TEXT PRIMARY KEY, cycle_id TEXT NOT NULL REFERENCES cycles(id), body TEXT NOT NULL CHECK(json_valid(body)), recorded_at TEXT NOT NULL) STRICT;
      PRAGMA user_version = 1;
    `);
    for (const table of ['foundations', 'cycles', 'receipts']) {
      for (const action of ['UPDATE', 'DELETE']) db.exec(`CREATE TRIGGER immutable_${table}_${action} BEFORE ${action} ON ${table} BEGIN SELECT RAISE(ABORT, 'Approved snapshots and receipts are immutable'); END;`);
    }
    db.run('INSERT INTO projects VALUES (?, ?)', randomUUID(), new Date().toISOString());
  });
}
