import { DatabaseSync } from 'node:sqlite';

export type SqlValue = null | number | bigint | string | Uint8Array;
export type Row = Record<string, SqlValue>;
export interface SqliteConnection {
  exec(sql: string): void;
  run(sql: string, ...values: SqlValue[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(sql: string, ...values: SqlValue[]): Row | undefined;
  all(sql: string, ...values: SqlValue[]): Row[];
  transaction<T>(operation: () => T): T;
  close(): void;
}

/** Only this module depends on node:sqlite. Callers own path/privacy validation. */
export function openSqlite(file: string, readOnly = false): SqliteConnection {
  const database = new DatabaseSync(file, {
    readOnly,
    enableForeignKeyConstraints: true,
    allowExtension: false,
  });
  try {
    database.exec('PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;');
    if (!readOnly) {
      const mode = database.prepare('PRAGMA journal_mode = WAL').get()?.['journal_mode'];
      if (file !== ':memory:' && mode !== 'wal') throw new Error('SQLite WAL mode is unavailable; initialization stopped.');
      database.exec('PRAGMA synchronous = FULL;');
    }
  } catch (error) {
    database.close();
    throw error;
  }
  let transactionActive = false;
  return {
    exec: sql => database.exec(sql),
    run: (sql, ...values) => database.prepare(sql).run(...values),
    get: (sql, ...values) => database.prepare(sql).get(...values),
    all: (sql, ...values) => database.prepare(sql).all(...values),
    transaction<T>(operation: () => T): T {
      if (transactionActive) throw new Error('Nested transactions are not supported.');
      database.exec('BEGIN IMMEDIATE');
      transactionActive = true;
      try {
        const result = operation();
        if (result !== null && (typeof result === 'object' || typeof result === 'function') && 'then' in result) {
          throw new Error('SQLite transaction callbacks must be synchronous.');
        }
        database.exec('COMMIT');
        return result;
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      } finally {
        transactionActive = false;
      }
    },
    close: () => database.close(),
  };
}

export function sqliteVersion(): string {
  const database = openSqlite(':memory:');
  try {
    return String(database.get('SELECT sqlite_version() AS version')?.['version']);
  } finally {
    database.close();
  }
}
