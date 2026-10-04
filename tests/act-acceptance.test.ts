import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { temporaryProject } from './helpers.js';
import { prepareIde } from './ide-fixtures.js';
import { planFor, readyPlan, authorized, existingPlan, resultFor, multiStage } from './act-fixtures.js';
import { saveActPlan, approveActPlan, generateBuildPack, actHandoff, recordActStage, reviewActStage, readAct } from '../src/application/act.js';
import { readPrebuild } from '../src/application/prebuild.js';
import { basis, type IdeContext } from '../src/domain/ide.js';
import { nextIdeStep } from '../src/domain/guide.js';
import { renderActSummary } from '../src/cli/act-render.js';
import { OPTIONAL_DETAIL } from '../src/domain/conversation.js';

test('M2 acceptance: absent IDE cannot create a plan, pack, authorization or handoff',t=>{
  const target=temporaryProject(t),prepared=temporaryProject(t),p=readyPlan(prepared);
  assert.throws(()=>saveActPlan(target,p),/Return to IDE/);
  assert.throws(()=>approveActPlan(target,{expectedVersion:1,planHash:'a'.repeat(64),quote:'Approve build'}));
  assert.throws(()=>generateBuildPack(target,{expectedVersion:1}));assert.throws(()=>actHandoff(target));
  assert.equal(readAct(target),null);
});
for(const field of ['intention','user','problem','evaluation'] as const)test(`M2 acceptance: Act cannot substitute a different confirmed ${field}`,t=>{
  const root=temporaryProject(t),s=prepareIde(root),p=planFor(s);
  if(field==='intention')p.scope.ideal.intention.statement='A different founder ambition.';
  else if(field==='user')p.scope.foundation.targetUser.value='A new persona.';
  else if(field==='problem')p.scope.foundation.problem.value='A different pain.';
  else p.scope.context.hash='a'.repeat(64);
  assert.throws(()=>saveActPlan(root,p),/saved intention|confirmed user and problem|referenced evaluation changed/);
  assert.deepEqual(readPrebuild(root),s);assert.equal(readAct(root),null);
});
test('M2 acceptance: adding speculative SaaS scope after approval fails without edits',t=>{
  const root=temporaryProject(t),s=authorized(root),p=structuredClone(s.record.plan);
  p.expectedVersion=s.version;p.capabilities[0]!.name='Add account management';p.scope.proposal.capabilities[0]='Add account management';p.stages[0]!.capabilities[0]='Add account management';
  assert.throws(()=>saveActPlan(root,p),/Preserve the approved run/);
  const r=resultFor(s);r.changes=[{path:'accounts.mjs',kind:'created'}];
  assert.throws(()=>recordActStage(root,r),/approved stage/);assert.equal(readAct(root)!.record.planHash,s.record.planHash);
});
test('M2 acceptance: deleted parked code prevents a successful receipt and further handoff',t=>{
  const root=temporaryProject(t),s=authorized(root,existingPlan(root)),path=join(root,'dashboard.mjs'),before=readFileSync(path);
  // A single explicitly named synthetic fixture file, restored immediately.
  unlinkSync(path);
  try{assert.throws(()=>recordActStage(root,resultFor(s)),/out-of-stage change/);assert.throws(()=>actHandoff(root),/Selected file changed/);}
  finally{writeFileSync(path,before);}
  assert.equal(actHandoff(root).version,s.version);
});
test('M2 acceptance: a passing receipt cannot be relabelled customer validation',t=>{
  const root=temporaryProject(t),s=authorized(root),r=resultFor(s);
  writeFileSync(join(root,'compare.mjs'),'// Synthetic receipt boundary fixture; not a customer app.');r.changes=[{path:'compare.mjs',kind:'created'}];
  assert.throws(()=>recordActStage(root,{...r,customerValidation:'validated'}),/Invalid stage result/);
  const result=recordActStage(root,r);
  assert.equal(result.record.receipts[0]!.customerValidation,'not_established');
  assert.match(renderActSummary(result,readPrebuild(root)!.context),/do not establish customer validation/);
});
test('M2 acceptance: completed stages need review, and final stop survives pause/resume',t=>{
  const root=temporaryProject(t);let s=authorized(root,multiStage(readyPlan(root)));
  s=recordActStage(root,resultFor(s));assert.throws(()=>actHandoff(root));
  s=reviewActStage(root,{expectedVersion:s.version,decision:'continue',quote:'Synthetic review: continue to M0.'});
  assert.equal(actHandoff(root).stage.id,'risk');s=recordActStage(root,resultFor(s));
  s=reviewActStage(root,{expectedVersion:s.version,decision:'continue',quote:'Synthetic review: continue to M1.'});
  const r=resultFor(s);writeFileSync(join(root,'compare.mjs'),'// Synthetic state-transition fixture.');r.changes=[{path:'compare.mjs',kind:'created'}];s=recordActStage(root,r);
  s=reviewActStage(root,{expectedVersion:s.version,decision:'pause',quote:'Pause review.'});
  s=reviewActStage(root,{expectedVersion:s.version,decision:'resume',quote:'Resume review.'});
  assert.equal(s.record.status,'awaiting_review');assert.throws(()=>actHandoff(root));
  assert.throws(()=>reviewActStage(root,{expectedVersion:s.version,decision:'continue',quote:'Continue.'}),/stopping stage/);
});
test('M2 acceptance: current saved state leads the next decision without another intake',t=>{
  const root=temporaryProject(t),saved=prepareIde(root),c=saved.context as IdeContext;
  assert.equal(nextIdeStep(c).kind,'scope');const before=JSON.stringify(saved);
  const s=saveActPlan(root,planFor(saved)),text=renderActSummary(s,c);
  assert.ok(text.startsWith('Executive summary'));assert.ok(text.includes(c.definition.user.text!));assert.ok(text.includes(c.definition.problem.text!));
  assert.ok(text.includes(OPTIONAL_DETAIL));assert.match(text,/Approve build \| Adjust scope \| View build plan/);
  assert.doesNotMatch(text,/What would you like to do next|Who is your target user|Great idea|Amazing|brilliant/i);
  assert.equal(s.record.ideBasis,basis(c,'act'));assert.equal(JSON.stringify(readPrebuild(root)),before);
});
