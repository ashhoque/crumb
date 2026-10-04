import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { temporaryProject } from './helpers.js';
import { prepareIde, actionFor } from './ide-fixtures.js';
import { planFor, readyPlan, authorized, resultFor, multiStage, existingPlan } from './act-fixtures.js';
import { saveActPlan, approveActPlan, generateBuildPack, recordActStage, reviewActStage, actHandoff, readAct } from '../src/application/act.js';
import { readPrebuild, savePrebuild } from '../src/application/prebuild.js';
import { evaluatedClaimIds, validateActPlan, type ActPlan } from '../src/domain/act.js';
import type { IdeContext, Subject } from '../src/domain/ide.js';
import { initializeProject } from '../src/application/initialize.js';
import { openSqlite } from '../src/persistence/sqlite.js';
import { migrateAct } from '../src/persistence/act-store.js';
import { createBackup } from '../src/application/backup.js';
import { saveDraft, approveDraft, readWorkflow, approvedHandoff } from '../src/application/workflow.js';
import { renderActSummary } from '../src/cli/act-render.js';
import { confirmSubject } from './ide-fixtures.js';
import { transitionIde } from '../src/application/prebuild.js';

for(const through of ['none','intention','user','problem','evaluation'] as const) test(`M2 cannot propose Act after only ${through}`,t=>{
  const root=temporaryProject(t),saved=prepareIde(root,through);
  assert.throws(()=>saveActPlan(root,planFor(saved)),/Act is locked|explicitly choose/i);
  assert.equal(readAct(root),null);assert.equal(existsSync(join(root,'build-context')),false);
});
test('M2 each independent IDE confirmation is mandatory',t=>{
  const root=temporaryProject(t),p=readyPlan(root),c=readPrebuild(root)!.context as IdeContext;
  for(const subject of ['intention','user','problem','evaluation','act'] as Subject[]){
    const changed=structuredClone(c);changed.ide.confirmations=changed.ide.confirmations.filter(x=>x.subject!==subject);
    assert.throws(()=>validateActPlan(p,changed));
  }
});
for(const [label,edit] of [
  ['missing capability',(p:ActPlan)=>{p.capabilities=[];}],
  ['four capabilities',(p:ActPlan)=>{p.capabilities.push({...p.capabilities[0]!,name:'Accounts'},{...p.capabilities[0]!,name:'Analytics'});}],
  ['wrong user',(p:ActPlan)=>{p.capabilities[0]!.userBasis='a'.repeat(64);}],
  ['wrong problem',(p:ActPlan)=>{p.capabilities[0]!.problemBasis='b'.repeat(64);}],
  ['invented evidence',(p:ActPlan)=>{p.capabilities[0]!.evidenceClaimIds=['invented'];}],
  ['missing learning',(p:ActPlan)=>{p.capabilities[0]!.learningObjective='';}],
  ['scope mismatch',(p:ActPlan)=>{p.scope.proposal.capabilities=['Different scope'];}],
  ['unknown environment without groundwork',(p:ActPlan)=>{p.repository.environment='unknown';}],
  ['uncovered capability',(p:ActPlan)=>{p.stages[0]!.capabilities=[];}],
  ['missing stopping stage',(p:ActPlan)=>{p.stopAfterStageId='later';}],
  ['private edit path',(p:ActPlan)=>{p.stages[0]!.writes.push('.env');}],
  ['case aliases',(p:ActPlan)=>{p.stages[0]!.writes.push('Compare.mjs');}],
] as const)test(`M2 rejects ${label}`,t=>{
  const root=temporaryProject(t),p=readyPlan(root);edit(p);
  assert.throws(()=>saveActPlan(root,p));assert.equal(readAct(root),null);
});
test('M2 plan approval is exact, versioned and separate from IDE readiness',t=>{
  const root=temporaryProject(t),s=saveActPlan(root,readyPlan(root));
  assert.throws(()=>generateBuildPack(root,{expectedVersion:s.version}),/approved scope/);
  assert.throws(()=>actHandoff(root),/not authorized/);
  assert.throws(()=>approveActPlan(root,{expectedVersion:s.version,planHash:'wrong',quote:'Approve build'}),/exact displayed/);
  assert.throws(()=>approveActPlan(root,{expectedVersion:s.version-1,planHash:s.record.planHash,quote:'Approve build'}));
  const changed=structuredClone(s.record.plan);changed.expectedVersion=s.version;changed.outcome.failureBehavior='Explain exactly which input is missing.';
  const next=saveActPlan(root,changed);
  assert.throws(()=>approveActPlan(root,{expectedVersion:next.version,planHash:s.record.planHash,quote:'Approve build'}),/exact displayed/);
  assert.equal(next.record.approval,null);
});
test('M2 generates a variable-length persistent pack only after scope approval',t=>{
  const root=temporaryProject(t),s=authorized(root,multiStage(readyPlan(root)));
  assert.equal(s.record.pack!.files.length,6);
  for(const f of s.record.pack!.files)assert.ok(readFileSync(join(root,f.path),'utf8').includes(s.record.planHash));
  assert.match(readFileSync(join(root,s.record.pack!.directory,'STARTUP_MASTER.md'),'utf8'),/Confirmed user and problem|Learning objective/);
  assert.match(readFileSync(join(root,s.record.pack!.directory,'GROUNDWORK.md'),'utf8'),/do not copy Crumb/);
  assert.equal(generateBuildPack(root,{expectedVersion:s.version}).version,s.version);
  assert.equal(actHandoff(root).stage.id,'groundwork');
  assert.equal(actHandoff(root).version,s.version);
});
test('M2 pack collisions preserve foreign documents and support a reviewed destination change',t=>{
  const root=temporaryProject(t);let s=saveActPlan(root,readyPlan(root));
  s=approveActPlan(root,{expectedVersion:s.version,planHash:s.record.planHash,quote:'Approve build'});
  const dir=join(root,s.record.plan.packDirectory,s.record.id);mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'STARTUP_MASTER.md'),'Existing customer content');
  assert.throws(()=>generateBuildPack(root,{expectedVersion:s.version}),/different content/);
  assert.equal(readFileSync(join(dir,'STARTUP_MASTER.md'),'utf8'),'Existing customer content');
  assert.equal(existsSync(join(dir,'BUILD_PLAN.md')),false);assert.equal(readAct(root)!.version,s.version);
});
test('M2 existing repository KEEP / TEST / PARK retains code and blocks parked writes',t=>{
  const root=temporaryProject(t),p=existingPlan(root),before=readFileSync(join(root,'dashboard.mjs'),'utf8');
  const wrong=structuredClone(p);wrong.stages[0]!.writes.push('dashboard.mjs');assert.throws(()=>saveActPlan(root,wrong),/Park means preserve/);
  const uninspected=structuredClone(p);uninspected.repository.inspectedPaths=[];assert.throws(()=>saveActPlan(root,uninspected),/Inspect the existing/);
  const s=authorized(root,p);assert.equal(readFileSync(join(root,'dashboard.mjs'),'utf8'),before);
  writeFileSync(join(root,'dashboard.mjs'),'unapproved change');assert.throws(()=>actHandoff(root),/Selected file changed/);
  assert.equal(readAct(root)!.version,s.version);
});
for(const field of ['intention','user','problem','evidence'] as const)test(`M2 a material ${field} change suspends an approved run`,t=>{
  const root=temporaryProject(t),s=authorized(root);const saved=readPrebuild(root)!,c=structuredClone(saved.context) as IdeContext;c.expectedVersion=saved.version;
  if(field==='intention')c.intention.statement='A different commercial goal.';
  else if(field==='user')c.definition.user.text='A different user.';
  else if(field==='problem')c.definition.problem.text='A different pain.';
  else c.evaluation.contradictions.push('New contradiction changes this decision.');
  savePrebuild(root,c);assert.throws(()=>actHandoff(root));assert.throws(()=>recordActStage(root,resultFor(s)));
  assert.match(renderActSummary(s,readPrebuild(root)!.context),/on hold/);
  assert.equal(readAct(root)!.record.planHash,s.record.planHash);
  assert.equal(reviewActStage(root,{expectedVersion:s.version,decision:'pause',quote:'Pause this changed decision.'}).record.status,'paused');
});
test('M2 presentation changes preserve authorization, but changed pack files block handoff',t=>{
  const root=temporaryProject(t),s=authorized(root),saved=readPrebuild(root)!,c=structuredClone(saved.context) as IdeContext;
  c.expectedVersion=saved.version;c.brief.next='Review when ready.';savePrebuild(root,c);
  assert.equal(actHandoff(root).planHash,s.record.planHash);
  writeFileSync(join(root,s.record.pack!.files[0]!.path),'Unreviewed replacement');
  assert.throws(()=>actHandoff(root),/build pack changed/);
});
test('M2 failed or unexecuted tests never complete a stage; corrected actual files can be retried',t=>{
  const root=temporaryProject(t);let s=authorized(root),r=resultFor(s);
  writeFileSync(join(root,'compare.mjs'),'// incomplete implementation');r.changes=[{path:'compare.mjs',kind:'created'}];r.checks[0]!.result='failed';r.checks[0]!.exitCode=1;
  assert.throws(()=>recordActStage(root,r),/every planned technical check/);
  r.implementation='partial';r.gaps=['Correct the comparison failure.'];s=recordActStage(root,r);
  assert.equal(s.record.status,'authorized');assert.match(renderActSummary(s,readPrebuild(root)!.context),/1 failed/);
  assert.throws(()=>reviewActStage(root,{expectedVersion:s.version,decision:'continue',quote:'Continue'}),/completed stage/);
  r=resultFor(s);r.checks[0]!.executed=false;r.checks[0]!.exitCode=null;
  assert.throws(()=>recordActStage(root,r),/cannot be called successful/);
  r=resultFor(s);writeFileSync(join(root,'compare.mjs'),'// corrected synthetic unit fixture');r.changes=[{path:'compare.mjs',kind:'modified'}];
  s=recordActStage(root,r);assert.equal(s.record.status,'awaiting_review');
  assert.equal(s.record.receipts.at(-1)!.customerValidation,'not_established');assert.equal(s.record.receipts.at(-1)!.release,'not_released');
  assert.throws(()=>actHandoff(root),/not authorized/);
  assert.throws(()=>reviewActStage(root,{expectedVersion:s.version,decision:'continue',quote:'Continue'}),/stopping stage/);
  s=reviewActStage(root,{expectedVersion:s.version,decision:'finish',quote:'I reviewed this stage; stop here.'});assert.equal(s.record.status,'stopped');
  assert.throws(()=>actHandoff(root),/not authorized/);
});
test('M2 cannot claim an unbuilt mock, unreported change, wrong change kind or next-stage edit',t=>{
  const root=temporaryProject(t),s=authorized(root),r=resultFor(s);
  assert.throws(()=>recordActStage(root,r),/actual MVP changes/);
  writeFileSync(join(root,'compare.mjs'),'x');assert.throws(()=>recordActStage(root,r),/Unreported/);
  r.changes=[{path:'compare.mjs',kind:'modified'}];assert.throws(()=>recordActStage(root,r),/before\/after/);
  const other=temporaryProject(t),staged=authorized(other,multiStage(readyPlan(other)));writeFileSync(join(other,'compare.mjs'),'too early');
  assert.throws(()=>recordActStage(other,resultFor(staged)),/out-of-stage/);
});
test('M2 stage review, pause/resume, and an early intended stop do not silently advance',t=>{
  const root=temporaryProject(t),p=multiStage(readyPlan(root));p.stopAfterStageId='risk';let s=authorized(root,p);
  s=reviewActStage(root,{expectedVersion:s.version,decision:'pause',quote:'Pause'});assert.throws(()=>actHandoff(root));
  s=reviewActStage(root,{expectedVersion:s.version,decision:'resume',quote:'Resume the same stage'});assert.equal(actHandoff(root).stage.id,'groundwork');
  s=recordActStage(root,resultFor(s));assert.equal(s.record.currentStage,0);assert.throws(()=>actHandoff(root));
  s=reviewActStage(root,{expectedVersion:s.version,decision:'continue',quote:'Reviewed groundwork. Continue to risk only.'});assert.equal(actHandoff(root).stage.id,'risk');
  s=recordActStage(root,resultFor(s));assert.throws(()=>reviewActStage(root,{expectedVersion:s.version,decision:'continue',quote:'Continue'}),/stopping stage/);
  assert.equal(existsSync(join(root,'compare.mjs')),false);
});
test('M2 new runs retain old M1 cycles and Act history; backups preserve schema 3',t=>{
  const root=temporaryProject(t),saved=prepareIde(root),draft=saveDraft(root,actionFor(saved));
  const old=approveDraft(root,{contractVersion:1,draftHash:draft.hash,founderApproved:true,approvalQuote:'Synthetic old cycle approval.'});
  let s=authorized(root,planFor(saved));const id=s.record.id;
  assert.deepEqual(readWorkflow(root).cycle,old);assert.throws(()=>approvedHandoff(root),/Act|M2/);assert.throws(()=>saveDraft(root,actionFor(saved)),/Act|M2/);
  const db=openSqlite(initializeProject(root).database);
  try {assert.throws(()=>db.exec('DELETE FROM act_revisions'),/immutable/);assert.throws(()=>db.exec("UPDATE act_revisions SET body='{}'"),/immutable/);migrateAct(db);assert.equal(db.get('PRAGMA user_version')!['user_version'],3);}finally{db.close();}
  s=reviewActStage(root,{expectedVersion:s.version,decision:'cancel',quote:'Preserve this run and revise scope.'});
  const p=planFor(readPrebuild(root)!);p.expectedVersion=s.version;s=saveActPlan(root,p);assert.notEqual(s.record.id,id);assert.equal(s.record.approval,null);
  const backup=createBackup(root);assert.equal(backup.schemaVersion,3);const copy=openSqlite(backup.path,true);
  try{assert.equal(Number(copy.get('SELECT count(*) AS n FROM act_revisions')!['n']),s.version);assert.equal(String(copy.get('SELECT body FROM cycles')!['body']),JSON.stringify(old));}finally{copy.close();}
});
test('M2 stored but unevaluated claims cannot justify a capability',t=>{
  const root=temporaryProject(t),saved=prepareIde(root,'problem'),c=structuredClone(saved.context) as IdeContext;
  c.expectedVersion=saved.version;c.claims.push({...c.claims[0]!,id:'unused-claim',important:false});savePrebuild(root,c);
  transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'review'});confirmSubject(root,'evaluation');const confirmed=confirmSubject(root,'act');
  assert.equal(evaluatedClaimIds(confirmed.context as IdeContext).has('unused-claim'),false);
  const p=planFor(confirmed);p.capabilities[0]!.evidenceClaimIds=['unused-claim'];assert.throws(()=>saveActPlan(root,p),/actually considered in Evaluation/);
});
test('M2 migration failure rolls back without touching prebuild history',t=>{
  const root=temporaryProject(t);prepareIde(root);const db=openSqlite(initializeProject(root).database);
  try{
    const before=db.all('SELECT * FROM prebuild_revisions');
    db.exec('CREATE TABLE act_revisions (sentinel TEXT); INSERT INTO act_revisions VALUES (\'preserve\')');
    assert.throws(()=>migrateAct(db),/already exists/);
    assert.equal(db.get('PRAGMA user_version')!['user_version'],2);
    assert.deepEqual(db.all('SELECT * FROM prebuild_revisions'),before);
    assert.equal(db.get('SELECT sentinel FROM act_revisions')!['sentinel'],'preserve');
  }finally{db.close();}
});
