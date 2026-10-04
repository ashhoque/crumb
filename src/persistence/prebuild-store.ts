import type { SqliteConnection } from './sqlite.js';
import { migrateWorkflow } from './workflow-store.js';

/** Add research continuity without altering approved cycles, their hashes or rows. */
export function migratePrebuild(db: SqliteConnection): void {
  migrateWorkflow(db);
  db.transaction(() => {
    const version = Number(db.get('PRAGMA user_version')?.['user_version']);
    if (version === 2 || version === 3 || version === 4) return;
    if (version !== 1) throw new Error('Unsupported pre-build storage version. Preserve the workspace.');
    db.exec(`
      CREATE TABLE prebuild_revisions (
        version INTEGER PRIMARY KEY CHECK(version > 0),
        project_id TEXT NOT NULL REFERENCES projects(id),
        body TEXT NOT NULL CHECK(json_valid(body)),
        digest TEXT NOT NULL,
        recorded_at TEXT NOT NULL
      ) STRICT;
      CREATE TRIGGER immutable_prebuild_update BEFORE UPDATE ON prebuild_revisions BEGIN SELECT RAISE(ABORT, 'Pre-build revisions are immutable'); END;
      CREATE TRIGGER immutable_prebuild_delete BEFORE DELETE ON prebuild_revisions BEGIN SELECT RAISE(ABORT, 'Pre-build revisions are immutable'); END;
      PRAGMA user_version = 2;
    `);
  });
}
