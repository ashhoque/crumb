import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { followUp } from '../handover.mjs';
import { inspectCsv, parseCsv, reportCsv, writeReports, readInput, MAX_BYTES } from '../handover.mjs';

const inspect = text => inspectCsv(Buffer.from(text));
const header = 'task,owner,due_date\n';
async function workspace() {
  const root = path.resolve('test-output'); await fs.mkdir(root, { recursive: true });
  return fs.mkdtemp(path.join(root, 'acceptance-'));
}
test('quoted commas, escaped quotes, embedded newline and preserved text round-trip', () => {
  const r = inspect(header + '"Review, ""footer""\nlinks",,TBD\n');
  assert.equal(r.total, 1);
  assert.equal(r.incomplete[0].task, 'Review, "footer"\nlinks');
  assert.deepEqual(parseCsv(reportCsv(r))[1], ['1','Review, "footer"\nlinks','','TBD','owner']);
});
test('BOM, reordered headers, CRLF, blanks, duplicates, whitespace and TBD semantics', () => {
  const r = inspect('\ufeffdue_date,task,owner\r\nTBD,Ready,Avery\r\n,,\r\n ,Review,Sam\r\n ,Review,Sam\r\n');
  assert.equal(r.total, 3);
  assert.deepEqual(r.incomplete.map(x => [x.source_record, x.missing_fields]), [[3,'due_date'],[4,'due_date']]);
  assert.equal(inspect(header + 'Ready,Avery,N/A\n').incomplete.length, 0);
});
test('bad headers, widths, task and quoting reject', () => {
  for (const text of ['', 'task,owner\n', 'task,owner,owner\n','task,owner,due_date,extra\n',
    header + ',Avery,TBD\n',header + 'Review,Avery\n',header + 'Review,Avery,TBD,extra\n',
    header + '"Review,Avery,TBD\n', header + 'Re"view,Avery,TBD\n', header + '"Review"x,Avery,TBD\n']) {
    assert.throws(() => inspect(text));
  }
});
test('invalid encoding and byte/record bounds reject; 5000 records accepted', () => {
  assert.throws(() => inspectCsv(Buffer.from([0xff])));
  assert.throws(() => inspectCsv(Buffer.alloc(MAX_BYTES + 1)));
  assert.equal(inspect(header + 'Review,Avery,TBD\n'.repeat(5000)).total, 5000);
  assert.throws(() => inspect(header + 'Review,Avery,TBD\n'.repeat(5001)));
});
test('formula/full-width/control prefixes reject in every field before output', () => {
  for (const prefix of ['=', '+', '-', '@', '＝','＋','－','＠','  =','\t','\r','\n']) {
    for (let f = 0; f < 3; f++) {
      const cells = ['Review','Avery','TBD']; cells[f] = prefix + 'unsafe';
      assert.throws(() => inspect(header + cells.map(x => '"' + x + '"').join(',') + '\n'), /record 1, field/);
    }
  }
});
test('exclusive output, input unchanged and deterministic bytes', async () => {
  const root = await workspace(), input = path.join(root, 'input.csv');
  const bytes = Buffer.from(header + 'Review,,TBD\n'); await fs.writeFile(input, bytes);
  const reports = { 'incomplete.csv': reportCsv(inspectCsv(await readInput(input))) };
  await writeReports(path.join(root, 'one'), reports);
  await writeReports(path.join(root, 'two'), reports);
  assert.deepEqual(await fs.readFile(input), bytes);
  assert.deepEqual(await fs.readFile(path.join(root,'one','incomplete.csv')), await fs.readFile(path.join(root,'two','incomplete.csv')));
  await assert.rejects(writeReports(path.join(root,'one'), reports));
  await assert.rejects(writeReports(input, reports));
  await assert.rejects(readInput(path.join(root, 'absent.csv')));
  await assert.rejects(writeReports(path.join(input,'out'), reports));
});
test('handled write failure cleans only run-created files', async () => {
  const root = await workspace(), out = path.join(root, 'failed');
  const io = { ...fs, open: async (...args) => {
    const handle = await fs.open(...args);
    return { close: () => handle.close(), writeFile: async () => {
      await handle.writeFile('partial'); throw new Error('Injected disk failure');
    } };
  } };
  await assert.rejects(writeReports(out, { 'incomplete.csv': 'data' }, io), /Injected disk failure/);
  await assert.rejects(fs.stat(out), { code: 'ENOENT' });
});

const app = fileURLToPath(new URL('../handover.mjs', import.meta.url));
const fixture = fileURLToPath(new URL('../fixtures/handover.csv', import.meta.url));
const run = args => spawnSync(process.execPath, [app, ...args], { encoding: 'utf8' });
test('actual known-fixture CLI: exact rows, draft, no input change, deterministic rerun', async () => {
  const root = await workspace(), before = await fs.readFile(fixture);
  for (const name of ['one','two']) {
    const out = path.join(root,name), r = run(['check',fixture,'--out',out]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /Accepted task records: 6\nIncomplete records: 4/);
    assert.deepEqual(parseCsv(await fs.readFile(path.join(out,'incomplete.csv'),'utf8')), [
      ['source_record','task','owner','due_date','missing_fields'],
      ['2','Check redirects','','2026-10-10','owner'],
      ['3','Transfer documentation','Sam','','due_date'],
      ['4','Confirm monitoring','','','owner;due_date'],
      ['6','Whitespace owner','   ','2026-10-12','owner']]);
    assert.equal(await fs.readFile(path.join(out,'follow-up.txt'),'utf8'),
      'Please confirm the missing handover details below. A blank value may be intentional; please clarify where appropriate.\n\n- Check redirects (record 2): missing owner.\n- Transfer documentation (record 3): missing due_date.\n- Confirm monitoring (record 4): missing owner and due_date.\n- Whitespace owner (record 6): missing owner.\n\nThank you.\n');
  }
  assert.deepEqual(await fs.readFile(fixture), before);
  for (const name of ['incomplete.csv','follow-up.txt']) assert.deepEqual(await fs.readFile(path.join(root,'one',name)),await fs.readFile(path.join(root,'two',name)));
  assert.equal(run(['check',fixture,'--out',path.join(root,'one')]).status, 1);
});
test('CLI help/usage, invalid inputs create no output, blocked destination errors', async () => {
  assert.equal(run(['--help']).status, 0);
  for (const args of [[], ['check'], ['check',fixture,'--wrong','out']]) assert.equal(run(args).status, 2);
  const root = await workspace();
  const cases = [Buffer.from(header + 'Bad,=formula,TBD\n'),Buffer.from(header + 'Bad,Avery\n'),Buffer.from([0xff]),Buffer.alloc(MAX_BYTES+1),Buffer.from(header + 'Bad,Avery,TBD\n'.repeat(5001))];
  for (let i = 0; i < cases.length; i++) {
    const input = path.join(root,`bad-${i}.csv`), out = path.join(root,`out-${i}`);
    await fs.writeFile(input,cases[i]);
    assert.equal(run(['check',input,'--out',out]).status, 1);
    await assert.rejects(fs.stat(out), { code: 'ENOENT' });
  }
  assert.equal(run(['check',path.join(root,'absent'),'--out',path.join(root,'absent-out')]).status,1);
  const blocker = path.join(root,'blocker'); await fs.writeFile(blocker,'keep');
  assert.equal(run(['check',fixture,'--out',path.join(blocker,'out')]).status,1);
  assert.equal(await fs.readFile(blocker,'utf8'),'keep');
});
test('no omissions yields header-only report; prose cannot create newline requests', async () => {
  const root = await workspace(), input = path.join(root,'complete.csv'), out = path.join(root,'out');
  await fs.writeFile(input, header + 'Ready,Avery,TBD\n');
  assert.equal(run(['check',input,'--out',out]).status,0);
  assert.equal(parseCsv(await fs.readFile(path.join(out,'incomplete.csv'),'utf8')).length,1);
  assert.equal(await fs.readFile(path.join(out,'follow-up.txt'),'utf8'),'No missing owner or due_date values were found. No follow-up is needed.\n');
  assert.match(followUp(inspect(header + '"Review\nfooter",,TBD\n')), /- Review footer \(record 1\)/);
});
test('observation fixtures have six tasks and exact four omissions', async () => {
  for (const [name, expected] of [['session-a',[2,3,4,6]],['session-b',[1,3,4,6]]]) {
    const bytes = await fs.readFile(new URL(`../fixtures/${name}.csv`,import.meta.url));
    const r = inspectCsv(bytes); assert.equal(r.total,6);
    assert.deepEqual(r.incomplete.map(x => x.source_record), expected);
  }
});
