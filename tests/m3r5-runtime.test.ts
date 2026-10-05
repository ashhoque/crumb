import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFileSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {temporaryProject} from './helpers.js';
import {bootstrapProject} from '../src/application/project-bootstrap.js';
import {savePrebuild,readPrebuild} from '../src/application/prebuild.js';
import {ideFixture} from './ide-fixtures.js';

const cli=fileURLToPath(new URL('../src/cli/main.js',import.meta.url));
test('M3-R5 CLI returns one exact presentation and persists matching review via request files',t=>{
  const root=temporaryProject(t),request=join(root,'request.json');savePrebuild(root,ideFixture());
  const run=(input:object)=>{writeFileSync(request,JSON.stringify(input));const result=spawnSync(process.execPath,[cli,'internal','ide',root,'--input-file',request],{encoding:'utf8',windowsHide:true,timeout:15000});assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);};
  const shown=run({operation:'present-thesis',expectedVersion:readPrebuild(root)!.version});
  assert.equal(shown.summary,undefined);
  assert.equal(shown.context.definition,undefined);
  const p=shown.context.presentation;
  const reviewed=run({operation:'confirm-thesis',expectedVersion:shown.version,presentationId:p.id,displayedText:p.text,quote:"Looks good, don't build yet.",turnId:'actual_synthetic_turn_2'});
  assert.equal(reviewed.context.confirmations.length,4);
  assert.equal(reviewed.context.ideState.act_readiness,'ready_for_confirmation');
  const saved=readPrebuild(root)!;
  if(saved.context.contractVersion!==2)throw new Error('Expected current IDE.');
  assert.ok(saved.context.ide.confirmations.every(r=>r.presentedText===p.text));
});
test('M3-R5 request files avoid shell input discovery and retain literal founder data',t=>{
  const root=temporaryProject(t),request=join(root,'request café.json');
  const value="Test $12/month for café editors; don't build yet.";
  writeFileSync(request,JSON.stringify({start:true,synthetic:true,expectedVersion:0,conversationId:'runtime_chat_123',delta:{project:{pricing:{value,status:'inferred',confidence:'medium',source:'Synthetic founder turn'}}}}));
  const run=()=>spawnSync(process.execPath,[cli,'internal','working-context',root,'--input-file',request],{encoding:'utf8',windowsHide:true,timeout:15000});
  const saved=run();assert.equal(saved.status,0,saved.stderr);
  assert.equal(JSON.parse(saved.stdout).workingContext.project.pricing.value,value);
  writeFileSync(request,'not JSON');assert.equal(run().status,1);
  writeFileSync(request,' '.repeat(65537));assert.match(run().stderr,/exceeds/);
});

test('M3-R5 installed locator provides reusable contracts and detects stale runtime paths',t=>{
  const root=temporaryProject(t),script=fileURLToPath(new URL('../../scripts/sync-global-skill.mjs',import.meta.url));
  const run=(...args:string[])=>spawnSync(process.execPath,[script,...args],{env:{...process.env,USERPROFILE:root},encoding:'utf8',windowsHide:true,timeout:15000});
  const installed=run('--install');assert.equal(installed.status,0,installed.stderr);
  const path=join(root,'.agents/skills/crumb/runtime.json'),runtime=JSON.parse(readFileSync(path,'utf8'));
  assert.equal(runtime.node,process.execPath);
  assert.ok(runtime.operations['confirm-thesis'].input.displayedText);
  assert.equal(run().status,0);
  runtime.cli='missing-core.js';writeFileSync(path,JSON.stringify(runtime));
  assert.match(run().stderr,/locator differs/);
});

test('M3-R5 unchanged project snapshot omits repeated content and a changed file refreshes it',t=>{
  const root=temporaryProject(t),path=join(root,'README.md');writeFileSync(path,'# Current beta');
  const first=bootstrapProject(root,{decision:'pricing'});
  const second=bootstrapProject(root,{decision:'pricing',previous:first.files});
  assert.equal(second.metrics.contentReturned,0);assert.equal(second.metrics.reused,1);
  writeFileSync(path,'# Changed beta');
  const changed=bootstrapProject(root,{decision:'pricing',previous:first.files});
  assert.equal(changed.metrics.contentReturned,1);assert.equal(changed.metrics.reused,0);
});
