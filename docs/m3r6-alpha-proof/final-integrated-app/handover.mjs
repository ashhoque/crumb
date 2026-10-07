import * as fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const MAX_BYTES = 1024 * 1024;
export function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', state = 'start', pending = false;
  const field = () => { row.push(cell); cell = ''; state = 'start'; };
  const record = () => { field(); rows.push(row); row = []; pending = false; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i]; pending = true;
    if (state === 'quoted') {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else state = 'closed';
      } else cell += c;
      continue;
    }
    if (c === ',') { field(); continue; }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] !== '\n') throw new Error('Bare CR outside quoted cell');
      if (c === '\r') i++;
      record(); continue;
    }
    if (state === 'closed') throw new Error('Unexpected text after closing quote');
    if (c === '"') {
      if (state !== 'start') throw new Error('Quote inside unquoted cell');
      state = 'quoted';
    } else { cell += c; state = 'plain'; }
  }
  if (state === 'quoted') throw new Error('Unclosed quoted cell');
  if (pending) record();
  return rows;
}

export function inspectCsv(bytes) {
  if (bytes.length > MAX_BYTES) throw new Error('Input exceeds 1 MiB');
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Error('Input is not valid UTF-8'); }
  const rows = parseCsv(text);
  if (!rows.length) throw new Error('Missing header');
  const headers = rows[0].map(s => s.trim());
  if (headers.length !== 3 || new Set(headers).size !== 3 ||
      !['task', 'owner', 'due_date'].every(h => headers.includes(h))) {
    throw new Error('Require exactly three unique headers: task,owner,due_date');
  }
  if (rows.length - 1 > 5000) throw new Error('Input exceeds 5,000 data records');
  for (const [r, cells] of rows.entries()) {
    for (const [f, value] of cells.entries()) {
      if (/^[\t\r\n]/u.test(value) || /^[\s]*[=+\-@＝＋－＠]/u.test(value)) {
        throw new Error(`Unsafe cell prefix at ${r ? `record ${r}` : 'header'}, field ${f + 1}`);
      }
    }
  }
  const incomplete = []; let total = 0;
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.every(s => s.trim() === '')) continue;
    if (cells.length !== 3) throw new Error(`Record ${r}: expected 3 fields`);
    const values = Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
    if (!values.task.trim()) throw new Error(`Record ${r}: task is blank`);
    total++;
    const missing = ['owner', 'due_date'].filter(h => !values[h].trim());
    if (missing.length) incomplete.push({ source_record: r, ...values, missing_fields: missing.join(';') });
  }
  return { total, incomplete };
}

const encode = value => /[",\r\n]/u.test(String(value)) ? `"${String(value).replaceAll('"', '""')}"` : String(value);
export function reportCsv(result) {
  const columns = ['source_record', 'task', 'owner', 'due_date', 'missing_fields'];
  return [columns.join(','), ...result.incomplete.map(r => columns.map(h => encode(r[h])).join(','))].join('\r\n') + '\r\n';
}

export async function readInput(input) {
  const handle = await fs.open(input, 'r');
  try {
    if (!(await handle.stat()).isFile()) throw new Error('Input must be a regular file');
    const buffer = Buffer.alloc(MAX_BYTES + 1); let count = 0;
    while (count < buffer.length) {
      const { bytesRead } = await handle.read(buffer, count, buffer.length - count, null);
      if (!bytesRead) break;
      count += bytesRead;
    }
    return buffer.subarray(0, count);
  } finally { await handle.close(); }
}

export async function writeReports(out, reports, io = fs) {
  // mkdir is exclusive. Never remove a pre-existing directory or foreign file.
  await io.mkdir(out);
  const created = [];
  try {
    for (const [name, text] of Object.entries(reports)) {
      const file = path.join(out, name);
      const handle = await io.open(file, 'wx');
      created.push(file);
      try { await handle.writeFile(text, 'utf8'); } finally { await handle.close(); }
    }
  } catch (error) {
    const cleanup = [];
    for (const file of created) {
      try { await io.unlink(file); } catch (e) { cleanup.push(e.message); }
    }
    try { await io.rmdir(out); } catch (e) { cleanup.push(e.message); }
    if (cleanup.length) throw new Error(`${error.message}; cleanup failed: ${cleanup.join('; ')}`);
    throw error;
  }
}

export function followUp(result) {
  if (!result.incomplete.length) return 'No missing owner or due_date values were found. No follow-up is needed.\n';
  return 'Please confirm the missing handover details below. A blank value may be intentional; please clarify where appropriate.\n\n' +
    result.incomplete.map(r => `- ${r.task.replace(/[\r\n\u2028\u2029]/gu, ' ')} (record ${r.source_record}): missing ${r.missing_fields.replace(';', ' and ')}.`).join('\n') + '\n\nThank you.\n';
}

const usage = 'Usage: node handover.mjs check <input.csv> --out <new-output-directory>\nSynthetic local data only. Drafts require manual review.\n';
export async function main(args) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) { process.stdout.write(usage); return 0; }
  if (args.length !== 4 || args[0] !== 'check' || args[2] !== '--out' || !args[1] || !args[3]) {
    process.stderr.write(usage); return 2;
  }
  try {
    const result = inspectCsv(await readInput(args[1]));
    await writeReports(args[3], { 'incomplete.csv': reportCsv(result), 'follow-up.txt': followUp(result) });
    process.stdout.write(`Accepted task records: ${result.total}\nIncomplete records: ${result.incomplete.length}\nDraft for manual review: ${path.join(args[3], 'follow-up.txt')}\n`);
    return 0;
  } catch (error) { process.stderr.write(`Error: ${error.message}\n`); return 1; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await main(process.argv.slice(2));
}
