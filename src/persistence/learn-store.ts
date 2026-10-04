import type { SqliteConnection } from './sqlite.js';
import { migrateAct } from './act-store.js';
import type { SavedLearn, LearnRecord } from '../domain/learn.js';
import { sha256 } from '../privacy/artifacts.js';

export function migrateLearn(db:SqliteConnection):void {
  migrateAct(db);
  db.transaction(()=>{
    const version=Number(db.get('PRAGMA user_version')?.['user_version']);
    if(version===4)return;
    if(version!==3)throw new Error('Unsupported Launch & Learn storage. Preserve the workspace.');
    db.exec(`CREATE TABLE learn_revisions (version INTEGER PRIMARY KEY CHECK(version>0), project_id TEXT NOT NULL REFERENCES projects(id), run_id TEXT NOT NULL, body TEXT NOT NULL CHECK(json_valid(body)), digest TEXT NOT NULL, recorded_at TEXT NOT NULL) STRICT;
      CREATE TRIGGER immutable_learn_update BEFORE UPDATE ON learn_revisions BEGIN SELECT RAISE(ABORT, 'Learning history is immutable'); END;
      CREATE TRIGGER immutable_learn_delete BEFORE DELETE ON learn_revisions BEGIN SELECT RAISE(ABORT, 'Learning history is immutable'); END;
      PRAGMA user_version = 4;`);
  });
}
export function storedLearn(db:SqliteConnection):SavedLearn|null {
  if(Number(db.get('PRAGMA user_version')?.['user_version'])<4)return null;
  const row=db.get('SELECT version, body, digest, recorded_at FROM learn_revisions ORDER BY version DESC LIMIT 1');
  return row?{version:Number(row['version']),hash:String(row['digest']),recordedAt:String(row['recorded_at']),record:JSON.parse(String(row['body'])) as LearnRecord}:null;
}
export function appendLearn(db:SqliteConnection,record:LearnRecord,version:number):SavedLearn {
  const body=JSON.stringify(record),projectId=String(db.get('SELECT id FROM projects LIMIT 1')?.['id']),recordedAt=new Date().toISOString();
  if(Buffer.byteLength(body)>307200)throw new Error('Learning cycle is full. Preserve it and review before importing more notes.');
  const hash=sha256(JSON.stringify({projectId,version,record}));
  db.run('INSERT INTO learn_revisions VALUES (?, ?, ?, ?, ?, ?)',version,projectId,record.id,body,hash,recordedAt);
  return {version,hash,recordedAt,record};
}
