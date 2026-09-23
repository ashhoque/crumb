import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { openSqlite } from '../src/persistence/sqlite.js';
import { temporaryProject } from './helpers.js';

test('file-backed SQLite opens, exposes version, and closes cleanly', t => {
  const root = temporaryProject(t);
  const file = join(root, 'spike.sqlite');
  const database = openSqlite(file);
  assert.match(String(database.get('SELECT sqlite_version() AS version')?.['version']), /^3\./);
  assert.equal(existsSync(file), true);
  database.close();
  assert.deepEqual(readdirSync(root), ['spike.sqlite']);
});

test('foreign keys reject invalid references and accept valid references', t => {
  const database = openSqlite(join(temporaryProject(t), 'spike.sqlite'));
  try {
    database.exec('CREATE TABLE parent (id INTEGER PRIMARY KEY); CREATE TABLE child (parent_id INTEGER REFERENCES parent(id));');
    assert.equal(database.get('PRAGMA foreign_keys')?.['foreign_keys'], 1);
    assert.throws(() => database.run('INSERT INTO child VALUES (?)', 99), /FOREIGN KEY/);
    database.run('INSERT INTO parent VALUES (?)', 1);
    database.run('INSERT INTO child VALUES (?)', 1);
    assert.equal(database.get('SELECT COUNT(*) AS count FROM child')?.['count'], 1);
  } finally { database.close(); }
});

test('STRICT tables enforce types', t => {
  const database = openSqlite(join(temporaryProject(t), 'spike.sqlite'));
  try {
    database.exec('CREATE TABLE strict_values (quantity INTEGER) STRICT;');
    database.run('INSERT INTO strict_values VALUES (?)', 4);
    assert.throws(() => database.run('INSERT INTO strict_values VALUES (?)', 'not a number'), /cannot store TEXT/);
  } finally { database.close(); }
});

test('commits survive reopen and failed transactions roll back completely', t => {
  const file = join(temporaryProject(t), 'spike.sqlite');
  let database = openSqlite(file);
  try {
    database.exec('CREATE TABLE values_table (id INTEGER PRIMARY KEY) STRICT;');
    const value = database.transaction(() => { database.run('INSERT INTO values_table VALUES (?)', 1); return 'committed'; });
    assert.equal(value, 'committed');
    assert.throws(() => database.transaction(() => {
      database.run('INSERT INTO values_table VALUES (?)', 2);
      database.run('INSERT INTO values_table VALUES (?)', 1);
    }), /UNIQUE/);
  } finally { database.close(); }
  database = openSqlite(file);
  try { assert.deepEqual(database.all('SELECT id FROM values_table').map(row => row['id']), [1]); }
  finally { database.close(); }
});

test('WAL works and WAL/SHM disappear after clean close', t => {
  const root = temporaryProject(t);
  const file = join(root, 'spike.sqlite');
  const database = openSqlite(file);
  try {
    database.exec('CREATE TABLE sample (value TEXT); INSERT INTO sample VALUES (\'synthetic\');');
    assert.equal(database.get('PRAGMA journal_mode')?.['journal_mode'], 'wal');
    assert.equal(existsSync(file + '-wal'), true);
    assert.equal(existsSync(file + '-shm'), true);
  } finally { database.close(); }
  assert.equal(existsSync(file + '-wal'), false);
  assert.equal(existsSync(file + '-shm'), false);
});

test('bound parameters preserve Unicode, emoji and SQL-like text as data', t => {
  const database = openSqlite(join(temporaryProject(t), 'spike.sqlite'));
  try {
    database.exec('CREATE TABLE samples (id INTEGER PRIMARY KEY, body TEXT) STRICT;');
    const body = "café 日本語 Україна العربية 😀🚀 O'Reilly'); DROP TABLE samples; --";
    database.run('INSERT INTO samples VALUES (?, ?)', 1, body);
    assert.equal(database.get('SELECT body FROM samples WHERE id = ?', 1)?.['body'], body);
    assert.equal(database.get('SELECT COUNT(*) AS count FROM samples')?.['count'], 1);
  } finally { database.close(); }
});

test('FTS5 creation and parameterized Unicode search work', t => {
  const database = openSqlite(join(temporaryProject(t), 'spike.sqlite'));
  try {
    database.exec('CREATE VIRTUAL TABLE search_text USING fts5(body);');
    database.run('INSERT INTO search_text VALUES (?)', 'customer evidence café 日本語 😀');
    for (const term of ['evidence', 'café']) assert.equal(database.all('SELECT body FROM search_text WHERE search_text MATCH ?', term).length, 1);
  } finally { database.close(); }
});

test('read-only adapter refuses writes and extension loading stays disabled', t => {
  const file = join(temporaryProject(t), 'spike.sqlite');
  let database = openSqlite(file);
  database.exec('CREATE TABLE sample (id INTEGER) STRICT;');
  assert.throws(() => database.get("SELECT load_extension('not-an-extension')"), /not authorized/);
  database.close();
  database = openSqlite(file, true);
  try { assert.throws(() => database.run('INSERT INTO sample VALUES (?)', 1), /readonly/); }
  finally { database.close(); }
});

test('nested or asynchronous callbacks cannot silently commit a transaction', t => {
  const database = openSqlite(join(temporaryProject(t), 'spike.sqlite'));
  try {
    database.exec('CREATE TABLE sample (id INTEGER) STRICT;');
    assert.throws(() => database.transaction(() => { database.run('INSERT INTO sample VALUES (?)', 1); database.transaction(() => undefined); }), /Nested/);
    assert.throws(() => database.transaction(() => { database.run('INSERT INTO sample VALUES (?)', 2); return Promise.resolve(); }), /synchronous/);
    assert.equal(database.get('SELECT COUNT(*) AS count FROM sample')?.['count'], 0);
  } finally { database.close(); }
});
