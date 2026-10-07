import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { temporaryProject } from './helpers.js';
import { ideFixture, prepareIde, confirmSubject } from './ide-fixtures.js';
import { validateIde, assertAct, type IdeContext, presentationText } from '../src/domain/ide.js';
import { validateQuality, learningTopics } from '../src/domain/evaluation-quality.js';
import { planFor } from './act-fixtures.js';
import { validateActPlan } from '../src/domain/act.js';
import { interviewGuide, renderStartupMaster } from '../src/cli/prebuild-render.js';
import { bootstrapProject } from '../src/application/project-bootstrap.js';
import { saveWorkingContext, readPrebuild, transitionIde } from '../src/application/prebuild.js';

test('Alpha interviews and provisional scope are usable before review without authorizing a build',()=>{
  const c=ideFixture();c.evaluation.status='in_progress';
  c.brief.choices=[{action:'interview',label:'Prepare interviews'},{action:'shape_mvp',label:'Draft provisional scope'}];
  const guide=interviewGuide(c).join('\n');
  assert.equal((guide.match(/^\d\./gm)??[]).length,5);
  assert.doesNotThrow(()=>validateIde(c));
  assert.throws(()=>assertAct(c));
});

test('Alpha runtime checkout cannot masquerade as a founder project or note root',()=>{
  const install=fileURLToPath(new URL('../../',import.meta.url));
  assert.throws(()=>bootstrapProject(install,{decision:'product'}),/installation/i);
  assert.throws(()=>saveWorkingContext(install,{expectedVersion:0,conversationId:'alpha-isolated-session',start:true,delta:{}}),/installation/i);
});

test('Alpha unrelated project inspection and explicit fresh-session note resume retain truthful state',t=>{
  const root=temporaryProject(t);
  writeFileSync(join(root,'README.md'),'A job approval tool for independent commercial printers. No customers yet.');
  const found=bootstrapProject(root,{decision:'product'});
  assert.match(found.files[0]!.excerpt!,/commercial printers/);
  const first=saveWorkingContext(root,{expectedVersion:0,conversationId:'alpha-first-session',start:true,synthetic:true,delta:{}});
  assert.equal(readPrebuild(root)!.hash,first.hash);
  assert.throws(()=>saveWorkingContext(root,{expectedVersion:first.version,conversationId:'alpha-second-session',delta:{}}),/conversation/i);
  const resumed=saveWorkingContext(root,{expectedVersion:first.version,conversationId:'alpha-second-session',delta:{}},true);
  assert.equal(readPrebuild(root)!.hash,resumed.hash);
  assert.equal(resumed.context.contractVersion===2&&resumed.context.workingContext?.conversationId,'alpha-second-session');
});

const learningFixture=()=>{
  const c=JSON.parse(readFileSync(new URL('../../fixtures/m3r1-quality/stock.json',import.meta.url),'utf8')) as IdeContext;
  c.quality!.learning={uncertainty:'pain',reason:'Synthetic customer demand remains unknown; observe task completion, not opinions.',recommendation:'build_decision',decision:'go',experiment:{promise:'Let a print shop approve one proof without chasing email.',capabilities:['Record a proof approval'],cuts:['No payments or bulk messaging'],limitations:'Synthetic sandbox; no live customer data or deployment.',success:'Two invited testers finish the approval task unaided.',failure:'Testers still need email to complete the task.',testDate:'2026-10-07'}};
  return c;
};

test('Alpha bounded learning recommendation retains behavioral uncertainty and exact visible scope',t=>{
  const root=temporaryProject(t),c=learningFixture();
  assert.doesNotThrow(()=>validateQuality(c,true));
  prepareIde(root,'evaluation',c);
  const current=readPrebuild(root)!.context as IdeContext;
  const visible=presentationText(current,'act');
  for(const value of ['Record a proof approval','No payments','no live customer data','2026-10-07','demand remains unknown'])assert.ok(visible.includes(value));
  assert.throws(()=>assertAct(current));
  confirmSubject(root,'act');assert.doesNotThrow(()=>assertAct(readPrebuild(root)!.context));
  const unsafe=learningFixture();unsafe.quality!.technical.coverage[0]!.status='unexamined';
  assert.throws(()=>validateQuality(unsafe,true),/technical/);
  const unsourced=learningFixture();unsourced.quality!.technical.coverage[0]!.claimIds=['invented'];
  assert.throws(()=>validateQuality(unsourced,true),/retained/);
});

test('Alpha honest negative evaluation needs no manufactured positive reasons and cannot enter Act',t=>{
  const root=temporaryProject(t),c=learningFixture();
  c.quality!.learning={uncertainty:'buyer',reason:'No credible buyer established in this synthetic case.',recommendation:'research',decision:'pivot_stop'};
  c.evaluation.promising=[];
  assert.doesNotThrow(()=>prepareIde(root,'evaluation',c));
  const current=readPrebuild(root)!.context as IdeContext;
  assert.throws(()=>presentationText(current,'act'),/PIVOT/);
  assert.throws(()=>assertAct(current),/PIVOT/);
});

test('Alpha bounded review leaves unrelated dimensions unexamined without weakening material coverage',t=>{
  const c=learningFixture(),root=temporaryProject(t);
  for(const row of [...c.evaluation.coverage,...c.investigation.coverage])if(!learningTopics.some(topic=>topic===row.topic)){row.status='unexamined';row.claimIds=[];row.runIds=[];row.reason='Not investigated for this bounded learning action.';}
  c.investigation.alternatives=c.investigation.alternatives.filter(x=>['direct','manual','do_nothing'].includes(x.kind));
  assert.doesNotThrow(()=>prepareIde(root,'evaluation',c));
  const unsafe=structuredClone(c);unsafe.evaluation.coverage.find(x=>x.topic==='pain')!.status='unexamined';
  assert.throws(()=>prepareIde(temporaryProject(t),'evaluation',unsafe),/decision-relevant/);
});

test('Alpha approved learning scope cannot silently expand into the default larger build pack',t=>{
  const root=temporaryProject(t),saved=prepareIde(root,'act',learningFixture());
  assert.throws(()=>validateActPlan(planFor(saved),saved.context as IdeContext),/exact approved experiment/);
});

test('Alpha a failed evidence write identifies the actual field without saving or relaxing source guards',t=>{
  const root=temporaryProject(t),c=learningFixture();
  c.definition.pain={basis:'inferred',text:'An unsupported pain',claimIds:[]};
  assert.throws(()=>prepareIde(root,'none',c),/supporting claims \(definition.pain\)/);
  assert.equal(readPrebuild(root),null);
  c.definition.pain={basis:'unknown',text:'An invented unknown finding',claimIds:[]};
  assert.throws(()=>prepareIde(root,'none',c),/Unknown views.*definition.pain/);
  assert.equal(readPrebuild(root),null);
});

test('Alpha existing master renderer exposes honest provisional MVP artifacts before evaluation or Act',t=>{
  const root=temporaryProject(t),c=ideFixture();c.evaluation.status='in_progress';
  c.master={thesis:'Synthetic printing workflow hypothesis.',interviewPlan:'Use the canonical guide.',mvpHypothesis:'Observe a local proof approval.',nonGoals:['No sends'],technicalStrategy:'Local synthetic prototype.',businessModel:'Unproven subscription hypothesis.',economics:'Payment unknown.',validationPlan:'Observe two fitting operators; no demand claimed.',risks:['No customers observed.']};
  const saved=prepareIde(root,'none',c),text=renderStartupMaster(saved);
  assert.match(text,/Provisional MVP plan/);assert.match(text,/Observe a local proof approval/);
  assert.throws(()=>assertAct(saved.context));
  assert.equal(readPrebuild(root)!.hash,saved.hash);
});

test('Complete in-progress dossier joins its exact thesis review without a second Evaluation reply',t=>{
  const root=temporaryProject(t),c=learningFixture();c.evaluation.status='in_progress';
  const saved=prepareIde(root,'none',c),shown=transitionIde(root,{expectedVersion:saved.version,operation:'present-thesis'}),p=(shown.context as IdeContext).ide.presentation!;
  const reviewed=transitionIde(root,{expectedVersion:shown.version,operation:'confirm-thesis',presentationId:p.id,displayedText:p.text,quote:"Looks good, don't build yet.",turnId:'one_complete_thesis_review'}),result=reviewed.context as IdeContext;
  assert.equal(result.evaluation.status,'ready');assert.deepEqual(result.ide.confirmations.map(x=>x.subject),['intention','user','problem','evaluation']);
  assert.ok(result.ide.confirmations.every(x=>x.presentedText===p.text&&x.turnId==='one_complete_thesis_review'));
  assert.throws(()=>assertAct(result));assert.ok(presentationText(result,'act'));
});
