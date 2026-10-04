import type { SqliteConnection } from './sqlite.js';
import { migratePrebuild } from './prebuild-store.js';

/** Add an independent stage journal; never rewrite the historical M1 cycle. */
export function migrateAct(db: SqliteConnection): void {
  migratePrebuild(db);
  db.transaction(()=>{
    const version=Number(db.get('PRAGMA user_version')?.['user_version']);
    if(version===3 || version===4) return;
    if(version!==2) throw new Error('Unsupported Act storage; preserve the workspace.');
    db.exec(`
      CREATE TABLE act_revisions (
        version INTEGER PRIMARY KEY CHECK(version > 0),
        project_id TEXT NOT NULL REFERENCES projects(id),
        run_id TEXT NOT NULL,
        body TEXT NOT NULL CHECK(json_valid(body)),
        digest TEXT NOT NULL,
        recorded_at TEXT NOT NULL
      ) STRICT;
      CREATE TRIGGER immutable_act_update BEFORE UPDATE ON act_revisions BEGIN SELECT RAISE(ABORT, 'Act history is immutable'); END;
      CREATE TRIGGER immutable_act_delete BEFORE DELETE ON act_revisions BEGIN SELECT RAISE(ABORT, 'Act history is immutable'); END;
      PRAGMA user_version = 3;
    `);
  });
}
