import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { temporaryProject } from './helpers.js';
import { ideFixture, prepareIde, confirmSubject } from './ide-fixtures.js';
import { validateIde, assertAct, type IdeContext, presentationText } from '../src/domain/ide.js';
import { validateQuality } from '../src/domain/evaluation-quality.js';
import { interviewGuide } from '../src/cli/prebuild-render.js';
import { bootstrapProject } from '../src/application/project-bootstrap.js';
import { saveWorkingContext, readPrebuild } from '../src/application/prebuild.js';

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
