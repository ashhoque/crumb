import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, linkSync, mkdirSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { initializeProject, APPLICATION_ID, DATABASE_NAME } from '../src/application/initialize.js';
import { openSqlite } from '../src/persistence/sqlite.js';
import { git, temporaryProject } from './helpers.js';

test('empty non-Git folder initializes only ignore protection and metadata-only SQLite', t => {
  const root = temporaryProject(t);
  const result = initializeProject(root);
  assert.equal(result.inGit, false);
  assert.equal(result.created, true);
  assert.equal(result.foundationOnly, true);
  assert.deepEqual(readdirSync(root).sort(), ['.customer-evidence', '.gitignore']);
  assert.equal(existsSync(join(root, '.git')), false);
  assert.ok(readFileSync(join(root, '.gitignore'), 'utf8').includes('/.customer-evidence/'));
  const database = openSqlite(result.database, true);
  try {
    assert.equal(database.get('PRAGMA application_id')?.['application_id'], APPLICATION_ID);
    assert.equal(database.get('PRAGMA user_version')?.['user_version'], 0);
    assert.deepEqual(database.all("SELECT name FROM sqlite_schema WHERE type = 'table'"), []);
  } finally { database.close(); }
});

test('repeated initialization preserves the database and ignore bytes', t => {
  const root = temporaryProject(t);
  const initial = initializeProject(root);
  const databaseBytes = readFileSync(initial.database);
  const ignoreBytes = readFileSync(join(root, '.gitignore'));
  const second = initializeProject(root);
  assert.equal(second.created, false);
  assert.equal(second.gitIgnoreUpdated, false);
  assert.deepEqual(readFileSync(second.database), databaseBytes);
  assert.deepEqual(readFileSync(join(root, '.gitignore')), ignoreBytes);
});

test('existing repository retains source, manifest, instructions, staged index and CRLF ignore prefix', t => {
  const root = temporaryProject(t);
  git(root, 'init', '-q');
  const originals = new Map([
    ['README.md', 'Existing project — café\r\n'],
    ['AGENTS.md', 'Preserve our existing stack.\n'],
    ['package.json', '{"scripts":{"postinstall":"this-must-never-run"}}\n'],
    ['app.js', 'console.log("existing app");\n'],
  ]);
  for (const [name, text] of originals) writeFileSync(join(root, name), text);
  writeFileSync(join(root, '.gitignore'), '\uFEFF# existing rules\r\nbuild/');
  const ignoreBefore = readFileSync(join(root, '.gitignore'));
  git(root, 'add', '--', ...originals.keys(), '.gitignore');
  const indexBefore = git(root, 'ls-files', '--stage');
  const result = initializeProject(root);
  assert.equal(result.inGit, true);
  assert.equal(git(root, 'ls-files', '--stage'), indexBefore);
  for (const [name, text] of originals) assert.equal(readFileSync(join(root, name), 'utf8'), text);
  assert.deepEqual(readFileSync(join(root, '.gitignore')).subarray(0, ignoreBefore.length), ignoreBefore);
  git(root, 'check-ignore', '-q', '--', '.customer-evidence/cec.sqlite');
  assert.equal(git(root, 'status', '--porcelain').includes('cec.sqlite'), false);
});

test('tracked private files stop before any ignore or database write', t => {
  const root = temporaryProject(t);
  git(root, 'init', '-q');
  const privatePath = join(root, '.customer-evidence');
  mkdirSync(privatePath);
  writeFileSync(join(privatePath, 'synthetic-note.txt'), 'SYNTHETIC ONLY');
  git(root, 'add', '-f', '--', '.customer-evidence/synthetic-note.txt');
  assert.throws(() => initializeProject(root), /already tracked.*Initialization stopped/);
  assert.equal(existsSync(join(root, '.gitignore')), false);
  assert.equal(existsSync(join(privatePath, DATABASE_NAME)), false);
  assert.equal(readFileSync(join(privatePath, 'synthetic-note.txt'), 'utf8'), 'SYNTHETIC ONLY');
});

test('force-tracked initialized database remains untouched and blocks reinitialization', t => {
  const root = temporaryProject(t);
  git(root, 'init', '-q');
  const initial = initializeProject(root);
  git(root, 'add', '-f', '--', '.customer-evidence/cec.sqlite');
  const before = readFileSync(initial.database);
  assert.throws(() => initializeProject(root), /already tracked/);
  assert.deepEqual(readFileSync(initial.database), before);
});

test('an existing negation is preserved but a final private rule restores protection', t => {
  const root = temporaryProject(t);
  git(root, 'init', '-q');
  const original = '/.customer-evidence/\n!/.customer-evidence/\n';
  writeFileSync(join(root, '.gitignore'), original);
  initializeProject(root);
  assert.ok(readFileSync(join(root, '.gitignore'), 'utf8').startsWith(original));
  git(root, 'check-ignore', '-q', '--', '.customer-evidence/cec.sqlite');
});

test('nested project initializer protects its directory without altering the parent ignore file', t => {
  const root = temporaryProject(t);
  git(root, 'init', '-q');
  writeFileSync(join(root, '.gitignore'), '# parent conventions\n');
  mkdirSync(join(root, 'subproject'));
  initializeProject(join(root, 'subproject'));
  assert.equal(readFileSync(join(root, '.gitignore'), 'utf8'), '# parent conventions\n');
  git(root, 'check-ignore', '-q', '--', 'subproject/.customer-evidence/cec.sqlite');
});

test('nested project tracked private paths are detected relative to the actual Git index', t => {
  const root = temporaryProject(t);
  git(root, 'init', '-q');
  const nested = join(root, 'subproject');
  mkdirSync(join(nested, '.customer-evidence'), { recursive: true });
  writeFileSync(join(nested, '.customer-evidence', 'synthetic-note'), 'synthetic');
  git(root, 'add', '-f', '--', 'subproject/.customer-evidence/synthetic-note');
  assert.throws(() => initializeProject(nested), /already tracked/);
  assert.equal(existsSync(join(nested, '.gitignore')), false);
});

test('unrecognized private files are not read or overwritten', t => {
  const root = temporaryProject(t);
  const privatePath = join(root, '.customer-evidence');
  mkdirSync(privatePath);
  writeFileSync(join(privatePath, 'unknown.bin'), Buffer.from([255, 0, 1]));
  assert.throws(() => initializeProject(root), /unrecognized files/);
  assert.deepEqual(readFileSync(join(privatePath, 'unknown.bin')), Buffer.from([255, 0, 1]));
  assert.equal(existsSync(join(root, '.gitignore')), false);
});

test('private path occupied by a file is preserved', t => {
  const root = temporaryProject(t);
  writeFileSync(join(root, '.customer-evidence'), 'existing');
  assert.throws(() => initializeProject(root), /non-directory/);
  assert.equal(readFileSync(join(root, '.customer-evidence'), 'utf8'), 'existing');
});

test('ignore path occupied by a directory fails before private storage creation', t => {
  const root = temporaryProject(t);
  mkdirSync(join(root, '.gitignore'));
  assert.throws(() => initializeProject(root), /regular file/);
  assert.equal(existsSync(join(root, '.customer-evidence')), false);
});

test('invalid UTF-8 ignore file is preserved and blocks initialization', t => {
  const root = temporaryProject(t);
  const invalid = Buffer.from([0xff, 0xfe, 0x00]);
  writeFileSync(join(root, '.gitignore'), invalid);
  assert.throws(() => initializeProject(root), /not UTF-8/);
  assert.deepEqual(readFileSync(join(root, '.gitignore')), invalid);
  assert.equal(existsSync(join(root, '.customer-evidence')), false);
});

test('private-directory junction cannot redirect storage into another directory', t => {
  const root = temporaryProject(t);
  const outside = temporaryProject(t);
  symlinkSync(outside, join(root, '.customer-evidence'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => initializeProject(root), /Linked/);
  assert.deepEqual(readdirSync(outside), []);
  assert.equal(existsSync(join(root, '.gitignore')), false);
});

test('linked project roots and linked ancestors are rejected', t => {
  const root = temporaryProject(t);
  const outside = temporaryProject(t);
  mkdirSync(join(outside, 'child'));
  symlinkSync(outside, join(root, 'alias'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => initializeProject(join(root, 'alias')), /Linked/);
  assert.throws(() => initializeProject(join(root, 'alias', 'child')), /Linked/);
  assert.deepEqual(readdirSync(join(outside, 'child')), []);
});

test('hard-linked ignore file cannot alter another file', t => {
  const root = temporaryProject(t);
  writeFileSync(join(root, 'unrelated.txt'), 'preserve');
  linkSync(join(root, 'unrelated.txt'), join(root, '.gitignore'));
  assert.throws(() => initializeProject(root), /Hard-linked/);
  assert.equal(readFileSync(join(root, 'unrelated.txt'), 'utf8'), 'preserve');
});

test('hard-linked database cannot mutate another path', t => {
  const root = temporaryProject(t);
  const initial = initializeProject(root);
  linkSync(initial.database, join(root, 'other-copy.sqlite'));
  assert.throws(() => initializeProject(root), /Hard-linked/);
});

test('foreign and future-version databases are refused without changing their bytes', t => {
  const root = temporaryProject(t);
  const initial = initializeProject(root);
  for (const sql of ['PRAGMA application_id = 99', `PRAGMA application_id = ${APPLICATION_ID}; PRAGMA user_version = 3`]) {
    const database = openSqlite(initial.database);
    database.exec(sql);
    database.close();
    const before = readFileSync(initial.database);
    assert.throws(() => initializeProject(root), /not a supported CEC/);
    assert.deepEqual(readFileSync(initial.database), before);
  }
});

test('orphaned sidecars are preserved and require review', t => {
  const root = temporaryProject(t);
  mkdirSync(join(root, '.customer-evidence'));
  writeFileSync(join(root, '.customer-evidence', 'cec.sqlite-wal'), 'synthetic');
  assert.throws(() => initializeProject(root), /Orphaned SQLite sidecars/);
  assert.equal(existsSync(join(root, '.gitignore')), false);
});

test('missing roots and roots inside private storage are rejected', t => {
  const root = temporaryProject(t);
  assert.throws(() => initializeProject(join(root, 'missing')), /existing project directory/);
  mkdirSync(join(root, '.customer-evidence'));
  assert.throws(() => initializeProject(join(root, '.customer-evidence')), /cannot be inside/);
});

test('bare Git repository is refused without a private workspace', t => {
  const root = temporaryProject(t);
  git(root, 'init', '--bare', '-q');
  assert.throws(() => initializeProject(root), /Git state cannot be verified/);
  assert.equal(existsSync(join(root, '.customer-evidence')), false);
});
