import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { compare } from './compare.mjs';
const input = () => ({candidates:['AAA','BBB'].map(symbol => ({symbol,asOf:'Synthetic dated observation',technical:'User supplied trend note',sector:'Unknown',fundamental:'User supplied business note',catalyst:'Unknown'})),note:'Compare the missing facts at the next review.'});
const command=(...args)=>spawnSync(process.execPath,['compare.mjs',...args],{encoding:'utf8',windowsHide:true,timeout:10000});
function folder(t){const root=mkdtempSync(join(tmpdir(),'comparison-m2-'));t.after(()=>{const target=resolve(root);assert.equal(dirname(target).toLowerCase(),resolve(tmpdir()).toLowerCase());assert.ok(basename(target).startsWith('comparison-m2-'));rmSync(target,{recursive:true,force:true});});return root;}
test('a supplied shortlist produces an actual persisted comparison and note',t=>{
  const root=folder(t),source=join(root,'input.json'),output=join(root,'review.json');writeFileSync(source,JSON.stringify(input()));
  const result=command(source,output);assert.equal(result.status,0,result.stderr);const stored=JSON.parse(readFileSync(output,'utf8'));
  assert.deepEqual(JSON.parse(result.stdout),stored);assert.equal(stored.candidates.length,2);assert.equal(stored.candidates[1].sector,'Unknown');assert.equal(stored.note,input().note);assert.match(stored.limitation,/no ranking/);
});
test('invalid input produces a useful error and no persisted result',t=>{
  const root=folder(t),source=join(root,'bad.json'),output=join(root,'review.json');writeFileSync(source,'{}');
  const result=command(source,output);assert.equal(result.status,2);assert.match(result.stderr,/two to six/);assert.equal(existsSync(output),false);
});
test('existing reviews and source files are preserved',t=>{
  const root=folder(t),source=join(root,'input.json'),output=join(root,'review.json'),bytes=JSON.stringify(input());writeFileSync(source,bytes);writeFileSync(output,'prior reasoning');
  assert.equal(command(source,output).status,2);assert.equal(readFileSync(output,'utf8'),'prior reasoning');assert.equal(readFileSync(source,'utf8'),bytes);assert.equal(command(source,source).status,2);assert.equal(readFileSync(source,'utf8'),bytes);
});
test('missing dimensions and duplicate symbols are rejected; input stays unchanged',()=>{
  const valid=input(),before=JSON.stringify(valid);compare(valid);assert.equal(JSON.stringify(valid),before);
  const missing=input();delete missing.candidates[0].sector;assert.throws(()=>compare(missing),/sector/);
  const duplicate=input();duplicate.candidates[1].symbol='aaa';assert.throws(()=>compare(duplicate),/once/);
});
