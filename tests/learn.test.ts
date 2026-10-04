import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { temporaryProject } from './helpers.js';
import { authorized, resultFor, existingPlan, planFor } from './act-fixtures.js';
import { readAct, recordActStage, reviewActStage, saveActPlan } from '../src/application/act.js';
import { readPrebuild, savePrebuild } from '../src/application/prebuild.js';
import { prepareLaunch, importNotes, organizeNotes, summarizeLearning, decideLearning, readLearn, compactLearn, isLearnCurrent } from '../src/application/learn.js';
import { renderLearnSummary } from '../src/cli/learn-render.js';
import { evidenceKinds, type ObservationInput } from '../src/domain/learn.js';
import { initializeProject } from '../src/application/initialize.js';
import { createBackup } from '../src/application/backup.js';
import { openSqlite } from '../src/persistence/sqlite.js';
import { compactContext } from '../src/application/workflow.js';

export const observed=(excerpt='u1 completed the task but hesitated at the input.',extra:Partial<ObservationInput>={}):ObservationInput=>({kind:'observed_behavior',excerpt,userRef:'u1',sessionRef:'s1',theme:'Core workflow',outcome:'positive',signal:'friction',...extra});
function finished(root:string){let s=authorized(root,existingPlan(root));writeFileSync(join(root,'compare.mjs'),'// Synthetic unit-test implementation; no customer trial implied.');const result=resultFor(s);result.changes=[{path:'compare.mjs',kind:'created'}];s=recordActStage(root,result);return reviewActStage(root,{expectedVersion:s.version,decision:'finish',quote:'Synthetic founder reviewed this unit fixture.'});}
function launched(root:string){finished(root);return prepareLaunch(root,{expectedVersion:0});}
function notes(root:string,s=launched(root),items=[observed()]){return importNotes(root,{expectedVersion:s.version,notes:items.map(o=>o.excerpt).join('\n'),synthetic:true,observations:items});}

test('M3 requires confirmed IDE and founder review of a completed MVP',t=>{
  const root=temporaryProject(t);assert.throws(()=>prepareLaunch(root,{expectedVersion:0}),/confirmed IDE/);
  let a=authorized(root);assert.throws(()=>prepareLaunch(root,{expectedVersion:0}),/Review and finish/);
  const r=resultFor(a);writeFileSync(join(root,'compare.mjs'),'// Synthetic unit fixture');r.changes=[{path:'compare.mjs',kind:'created'}];a=recordActStage(root,r);
  assert.throws(()=>prepareLaunch(root,{expectedVersion:0}),/Review and finish/);
  reviewActStage(root,{expectedVersion:a.version,decision:'finish',quote:'Synthetic review complete.'});
  assert.equal(prepareLaunch(root,{expectedVersion:0}).record.status,'prepared');
});
test('M3 launch reuses exact IDE, habitats, MVP and parked files without rediscovery',t=>{
  const root=temporaryProject(t);finished(root);const before=readPrebuild(root)!,a=readAct(root)!,parser=readFileSync(join(root,'parser.mjs')),park=readFileSync(join(root,'dashboard.mjs'));
  const s=prepareLaunch(root,{expectedVersion:0});
  assert.equal(s.record.pack.who,before.context.definition.user.text);assert.equal(s.record.pack.problem,before.context.definition.problem.text);
  assert.deepEqual(s.record.foundation.habitats,before.context.habitats);assert.equal(s.record.pack.task,a.record.plan.scope.proposal.journey);
  assert.deepEqual(s.record.mvp.park,a.record.plan.park);assert.deepEqual(readPrebuild(root),before);assert.deepEqual(readAct(root),a);
  assert.deepEqual(readFileSync(join(root,'parser.mjs')),parser);assert.deepEqual(readFileSync(join(root,'dashboard.mjs')),park);
  assert.ok(s.record.pack.routes.every(x=>before.context.firstUserAvenues.includes(x.habitatId)&&x.observed.length&&x.inference&&x.limitation&&x.message));
  assert.equal(s.record.pack.observe.length,3);assert.equal(s.record.pack.outreach,'founder_controlled_not_sent');
});
test('M3 refuses exposure preparation after unreviewed file changes',t=>{const root=temporaryProject(t);finished(root);writeFileSync(join(root,'compare.mjs'),'changed');assert.throws(()=>prepareLaunch(root,{expectedVersion:0}),/files changed/);});
test('M3 exposure style and routes can be adjusted before feedback, without inventing avenues',t=>{
  const root=temporaryProject(t);let s=launched(root);s=prepareLaunch(root,{expectedVersion:s.version,style:'manual_pilot',routeIds:[s.record.foundation.avenues[0]!]});assert.equal(s.record.pack.style,'manual_pilot');assert.equal(s.record.pack.routes.length,1);assert.ok('avenue' in s.record.pack.routes[0]!);
  assert.throws(()=>prepareLaunch(root,{expectedVersion:s.version,routeIds:['invented-contact-list']}),/existing first-user/);
  s=notes(root,s);assert.throws(()=>prepareLaunch(root,{expectedVersion:s.version,style:'public_release'}),/do not rewrite/);
});
for(const [signal,destination] of [['different_user','define_user'],['intention','intention']] as const)test(`M3 routes ${signal} evidence to the affected foundation only`,t=>{
  const root=temporaryProject(t);let s=notes(root,undefined,[observed(`Synthetic observed ${signal} discrepancy.`,{signal})]);s=summarizeLearning(root,{expectedVersion:s.version});assert.equal(s.record.learning!.destination,destination);assert.equal(s.record.learning!.test.length,1);
});
test('M3 notes import is idempotent and observations must quote supplied notes',t=>{
  const root=temporaryProject(t),s=launched(root),o=observed(),input={expectedVersion:s.version,notes:o.excerpt,synthetic:true,observations:[o]};
  const n=importNotes(root,input);assert.equal(importNotes(root,{...input,expectedVersion:n.version}).version,n.version);
  assert.ok(!renderLearnSummary(n).includes('Executive summary'));assert.match(renderLearnSummary(n),/^Notes saved/);assert.doesNotMatch(renderLearnSummary(n),/no message has been sent/);
  assert.throws(()=>importNotes(root,{...input,expectedVersion:n.version,notes:'unrelated'}),/quote the supplied notes/);
  assert.throws(()=>importNotes(root,{...input,expectedVersion:n.version,synthetic:false}),/Synthetic/);
  assert.throws(()=>importNotes(root,{...input,expectedVersion:n.version,payment:'invented'}),/Invalid/);
});
test('M3 accepts rough notes once and the host can organize them later',t=>{
  const root=temporaryProject(t),s=launched(root),o=observed();let n=importNotes(root,{expectedVersion:s.version,notes:o.excerpt,synthetic:true,observations:[]});
  n=summarizeLearning(root,{expectedVersion:n.version});assert.match(n.record.learning!.unknowns.join(' '),/not been organized/);
  n=organizeNotes(root,{expectedVersion:n.version,importId:n.record.imports[0]!.id,observations:[o]});assert.equal(n.record.imports.length,1);assert.equal(n.record.observations.length,1);
  assert.throws(()=>organizeNotes(root,{expectedVersion:n.version,importId:n.record.imports[0]!.id,observations:[o]}),/already organized/);
});
for(const kind of evidenceKinds.filter(k=>!['observed_behavior','repeated_use'].includes(k)))test(`M3 separates ${kind} from observed usage`,t=>{
  const root=temporaryProject(t),o=observed(`Synthetic supplied ${kind} record.`,{kind,signal:'none',outcome:'unknown'});let s=notes(root,undefined,[o]);s=summarizeLearning(root,{expectedVersion:s.version});
  assert.equal(s.record.learning!.counts[kind],1);assert.equal(s.record.learning!.counts.observed_behavior,0);assert.equal(s.record.learning!.destination,'exposure');assert.equal(s.record.learning!.validation,'not_established');
});
test('M3 silence cannot be negative demand; praise cannot be reclassified as an observed signal',t=>{
  const root=temporaryProject(t),s=launched(root);
  for(const o of [observed('No replies',{kind:'no_response',outcome:'negative',signal:'none'}),observed('Nice',{kind:'opinion',signal:'value'})])assert.throws(()=>importNotes(root,{expectedVersion:s.version,notes:o.excerpt,synthetic:true,observations:[o]}));
});
test('M3 preserves contradictions, pseudonymous repetition and requests without scope changes',t=>{
  const root=temporaryProject(t),s=launched(root),a=readAct(root);let n=notes(root,s,[observed('u1 completed it',{signal:'value'}),observed('u2 preferred the old workflow',{userRef:'u2',sessionRef:'s2',outcome:'negative',signal:'low_priority'}),observed('u2 requested a dashboard',{kind:'feature_request',userRef:'u2',sessionRef:'s2',signal:'none',outcome:'unknown'})]);
  n=summarizeLearning(root,{expectedVersion:n.version});assert.ok(n.record.learning!.contradictions.length);assert.equal(n.record.learning!.themes[0]!.users,2);assert.ok(n.record.learning!.park.some(p=>p.includes('dashboard')));assert.equal(n.record.learning!.test.length,1);assert.deepEqual(readAct(root),a);
});
test('M3 summaries are concise, proactive and do not infer a name or imply outreach',t=>{
  const root=temporaryProject(t),s=launched(root),text=renderLearnSummary(s);assert.match(text,/^Executive summary/);assert.match(text,/no message has been sent/);assert.match(text,/extra detail below is optional/);assert.doesNotMatch(text,/Who is your target user|Where can we find users|What would you like|Amazing|Alex|Ash/);assert.ok(text.split(/\s+/).length<220);
  const n=summarizeLearning(root,{expectedVersion:notes(root,s).version});assert.match(renderLearnSummary(n),/Approve next direction/);assert.ok(renderLearnSummary(n).split(/\s+/).length<240);
  assert.match(renderLearnSummary(n),/Reported observation: u1 completed/);assert.doesNotMatch(renderLearnSummary(n),/pseudonymous user\(s\)/);
  const long=observed('u2 requested '+('a longer feature description '.repeat(40)),{kind:'feature_request',signal:'none',outcome:'unknown',userRef:'u2',sessionRef:'s2'});
  const more=notes(root,n,[long]),compact=summarizeLearning(root,{expectedVersion:more.version});assert.ok(renderLearnSummary(compact).split(/\s+/).length<350);assert.ok(compact.record.observations.some(o=>o.excerpt===long.excerpt));
});
test('M3 routine context omits raw notes and exact user evidence',t=>{
  const root=temporaryProject(t),s=notes(root,undefined,[observed('Confidential supplied phrase not for build context')]);assert.ok(!JSON.stringify(compactLearn(s)).includes('Confidential supplied phrase'));assert.ok(!JSON.stringify(compactContext(root)).includes('Confidential supplied phrase'));
});
test('M3 stale foundation and concurrency reject new evidence without erasing history',t=>{
  const root=temporaryProject(t),s=notes(root),before=readLearn(root);assert.throws(()=>summarizeLearning(root,{expectedVersion:s.version-1}),/another session/);
  const c=readPrebuild(root)!;c.context.expectedVersion=c.version;c.context.definition.problem.text='A materially different pain.';savePrebuild(root,c.context);
  assert.equal(isLearnCurrent(root,s),false);assert.throws(()=>summarizeLearning(root,{expectedVersion:s.version}),/foundation/);assert.deepEqual(readLearn(root),before);
});
test('M3 decisions pause, resume and challenge; approval stops without editing or outreach',t=>{
  const root=temporaryProject(t);let s=notes(root);s=summarizeLearning(root,{expectedVersion:s.version});s=decideLearning(root,{expectedVersion:s.version,choice:'pause',quote:'Pause.'});assert.match(renderLearnSummary(s),/^Paused/);
  s=decideLearning(root,{expectedVersion:s.version,choice:'resume',quote:'Resume.'});s=decideLearning(root,{expectedVersion:s.version,choice:'challenge',quote:'I disagree.'});assert.equal(s.record.status,'collecting');
  s=summarizeLearning(root,{expectedVersion:s.version});const a=readAct(root);s=decideLearning(root,{expectedVersion:s.version,choice:'approve',quote:'Review that small next direction.'});assert.equal(s.record.status,'decided');assert.deepEqual(readAct(root),a);assert.throws(()=>summarizeLearning(root,{expectedVersion:s.version}),/stopped/);
});
test('M3 revised-foundation recommendation cannot reuse the old IDE to propose Act',t=>{
  const root=temporaryProject(t);let s=notes(root,undefined,[observed('The actual pain was recovering prior rationale',{signal:'different_problem'})]);s=summarizeLearning(root,{expectedVersion:s.version});decideLearning(root,{expectedVersion:s.version,choice:'approve',quote:'Revisit the problem.'});
  const p=structuredClone(readAct(root)!.record.plan);p.expectedVersion=readAct(root)!.version;assert.throws(()=>saveActPlan(root,p),/approved learning decision/);
  const c=readPrebuild(root)!;c.context.expectedVersion=c.version;c.context.definition.problem.text+=' ';const cosmetic=savePrebuild(root,c.context);
  p.scope.context={version:cosmetic.version,hash:cosmetic.hash};p.scope.foundation.problem.value=cosmetic.context.definition.problem.text;
  assert.throws(()=>saveActPlan(root,p),/approved learning decision/,'Formatting cannot bypass the approved material redefinition.');
});
test('M3 additive journal survives backup and rejects mutable history',t=>{
  const root=temporaryProject(t),s=notes(root),location=initializeProject(root),db=openSqlite(location.database);
  try{assert.throws(()=>db.run('UPDATE learn_revisions SET body = body'));assert.throws(()=>db.run('DELETE FROM learn_revisions'));}finally{db.close();}
  const backup=createBackup(root);assert.equal(backup.schemaVersion,4);const copy=openSqlite(backup.path,true);try{assert.equal(copy.get('SELECT digest FROM learn_revisions ORDER BY version DESC LIMIT 1')?.['digest'],s.hash);}finally{copy.close();}
});
