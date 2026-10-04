import test from 'node:test';
import assert from 'node:assert/strict';
import { temporaryProject } from './helpers.js';
import { exerciseAct } from './act-integration.js';
for(const kind of ['fresh','existing','stock'] as const)test(`M2 native host integration: ${kind} project, real edits and real test processes`,t=>{
  const result=exerciseAct(temporaryProject(t),kind);
  assert.equal(result.finalStatus,'awaiting_review');assert.equal(result.release,'not_released');
  assert.equal(result.confirmed.contextUnchanged,true);
  assert.equal(result.reviewStops.length,result.stages.length);
  assert.ok(result.reviewStops.every(x=>x.handoffBlocked&&x.status==='awaiting_review'));
  for(const receipt of result.receipts.filter(x=>x.stageId!=='mvp')) assert.doesNotMatch(receipt.runInstructions.join(' '),/ready\.py|compare\.mjs/);
  if(kind==='fresh'){assert.deepEqual(result.stages,['groundwork','risk','mvp']);assert.ok(result.commands.at(-1)!.output.includes('Ran 4 tests'));}
  else assert.ok(result.commands.at(-1)!.output.includes('pass 4'));
  if(kind==='existing'){assert.equal(result.failedAttemptRecorded,true);assert.deepEqual(result.preservedPaths,['parser.mjs','dashboard.mjs']);}
  if(kind==='stock'){assert.deepEqual(result.stages,['risk','mvp']);assert.match(result.ideTranscript,/requires_redefinition/);assert.match(result.ideTranscript,/Yes.{0,3}move to Act/);}
});
