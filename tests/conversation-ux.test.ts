import assert from 'node:assert/strict';
import test from 'node:test';
import { temporaryProject } from './helpers.js';
import { prepareIde, ideFixture } from './ide-fixtures.js';
import { readPrebuild, savePrebuild, compactPrebuild } from '../src/application/prebuild.js';
import { nextIdeStep } from '../src/domain/guide.js';
import { emptyIde, type IdeContext } from '../src/domain/ide.js';
import { renderPrebuildSummary, renderPrebuildDetail } from '../src/cli/prebuild-render.js';
import { OPTIONAL_DETAIL } from '../src/domain/conversation.js';

test('M2 proactive guidance advances known foundations without repeated intake or fabricated assent',t=>{
  for(const [through,kind,next] of [['none','review',null],['intention','review',null],['user','review',null],['problem','review','evaluation'],['evaluation','confirm','act'],['act','scope',null]] as const){
    const root=temporaryProject(t),s=prepareIde(root,through),guide=nextIdeStep(s.context);
    assert.equal(guide.subject,next);assert.equal(guide.kind,kind);
    assert.doesNotMatch(guide.text,/What would you like to do next|Who is your target user|Are you starting fresh/i);
    assert.ok((guide.text.match(/\?/g)??[]).length<=1);
    assert.equal(readPrebuild(root)!.context.contractVersion===2 && (readPrebuild(root)!.context as IdeContext).ide.presentation,null);
    assert.equal(readPrebuild(root)!.version,s.version);
    if(kind==='review')assert.doesNotMatch(guide.text,/ready to commit a build cycle/i);
  }
});
test('M2 tiny human replies have one useful question and no report furniture',t=>{
  const c=emptyIde();c.project.entry='fresh';
  c.brief={kind:'conversation',summary:"That is a useful constraint: it keeps us focused on one weekly decision.",seeing:[],matters:[],next:'What happened the last time that comparison took too long?',questions:[],choices:[]};
  const s=savePrebuild(temporaryProject(t),c),text=renderPrebuildSummary(s);
  assert.doesNotMatch(text,/Executive summary|What I'm seeing|What still matters|optional|Great idea|Amazing/i);
  assert.match(text,/one weekly decision/);assert.equal(text.match(/\?/g)?.length,1);
});
test('M2 ordinary replies do not mechanically prepend praise',t=>{
  const c=emptyIde();c.project.entry='fresh';c.brief={kind:'conversation',summary:'That changes the user we should focus on.',seeing:[],matters:[],next:'I will revise that understanding before we continue.',questions:[],choices:[]};
  const text=renderPrebuildSummary(savePrebuild(temporaryProject(t),c));
  assert.ok(text.startsWith('That changes'));assert.doesNotMatch(text,/Great|Amazing|brilliant|crushing it/i);
});
test('M2 substantive synthesis stays concise with optional detail and no hidden transition',t=>{
  const root=temporaryProject(t),c=ideFixture();c.brief={kind:'research',summary:'The comparison task is specific enough to investigate. Existing spreadsheets may already meet the need.',seeing:['A repeated workflow gives us a concrete focus.'],matters:['Willingness to pay remains unknown.'],next:'Confirm the current intention so we can evaluate this against your goal.',questions:[],choices:[]};
  const saved=savePrebuild(root,c),text=renderPrebuildSummary(saved);
  assert.ok(text.startsWith('Executive summary'));assert.ok(text.includes(OPTIONAL_DETAIL));
  assert.ok(text.split(/\s+/).length<150);renderPrebuildDetail(saved,'sources');
  assert.equal(readPrebuild(root)!.version,saved.version);assert.equal(nextIdeStep(readPrebuild(root)!.context).kind,'review');
});
test('M2 name is optional, has explicit provenance, and is not inserted mechanically',t=>{
  const root=temporaryProject(t),c=emptyIde();c.project.name='Alex repository';c.project.entry='fresh';
  c.brief={kind:'conversation',summary:'That makes sense.',seeing:[],matters:[],next:'What constraint matters most for this project?',questions:[],choices:[]};
  let s=savePrebuild(root,c);assert.equal(s.context.preferredName,null);assert.doesNotMatch(renderPrebuildSummary(s),/Alex/);
  const named=structuredClone(s.context) as IdeContext;named.expectedVersion=s.version;named.preferredName={value:'Alex',source:'Synthetic founder explicitly said: Call me Alex.'};
  named.brief={...named.brief,summary:'Alex, that constraint gives us one clear workflow to investigate.'};s=savePrebuild(root,named);assert.match(renderPrebuildSummary(s),/Alex/);
  const next=structuredClone(s.context) as IdeContext;next.expectedVersion=s.version;next.brief.summary='I will check the alternatives around that workflow.';s=savePrebuild(root,next);assert.doesNotMatch(renderPrebuildSummary(s),/Alex/);
  const forged=structuredClone(next);forged.expectedVersion=s.version;forged.preferredName={value:'Alex',source:''};assert.throws(()=>savePrebuild(root,forged));
  assert.equal((compactPrebuild(s) as {preferredName:{source:string}}).preferredName.source,named.preferredName.source);
});
test('M2 skipped intention is retained without repeated prompting or unlocked Act',()=>{
  const c=emptyIde();c.project.entry='existing';c.intention.status='skipped';
  assert.equal(nextIdeStep(c).kind,'pause');assert.doesNotMatch(nextIdeStep(c).text,/\?/);
});
