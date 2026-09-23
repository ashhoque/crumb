import assert from 'node:assert/strict';
import test from 'node:test';
import { cpSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { approveDraft, approvedHandoff, compactContext, readWorkflow, saveDraft } from '../src/application/workflow.js';
import { inspectArtifacts } from '../src/privacy/artifacts.js';
import { detailSections, renderDetail, renderHandoff, renderOpening, renderStatus, renderSummary } from '../src/cli/render.js';
import { words } from '../src/domain/conversation.js';
import type { Evaluation, RevisedDraft } from '../src/domain/contracts.js';
import { temporaryProject } from './helpers.js';
import { prepareDemo } from '../src/application/demo.js';

const fixtures = fileURLToPath(new URL('../../fixtures/', import.meta.url));
const cli = fileURLToPath(new URL('../src/cli/main.js', import.meta.url));
const fixture = (name = 'fresh'): RevisedDraft => JSON.parse(readFileSync(join(fixtures, 'm1r', `${name}.json`), 'utf8')) as RevisedDraft;
function attachProject(root: string, draft: RevisedDraft) {
  cpSync(join(fixtures, 'm1/unfinished'), root, { recursive: true });
  draft.artifactPermission = { granted: true, quote: 'Synthetic founder permits these five project files.' };
  draft.artifacts = inspectArtifacts(root, { paths: ['AGENTS.md', 'README.md', 'package.json', 'app.mjs', 'app.test.mjs'], permissionGranted: true, permissionQuote: draft.artifactPermission.quote }).map(({path,sha256})=>({path,sha256}));
}
const approve = (root: string, hash: string) => approveDraft(root, {contractVersion:1, draftHash:hash, founderApproved:true, approvalQuote:'Build now'});
const finding = (): Evaluation['findings'][number] => ({topic:'growth_signals',statement:'Synthetic competitor posted three jobs',kind:'public_proxy',source:{title:'Synthetic careers page',url:'https://example.invalid/careers',accessedOn:'2026-09-23'},limitation:'Hiring is not revenue or verified growth',provenance:'synthetic_fixture'});

test('demo preparation creates unique disposable examples without draft or approval', t => {
  assert.throws(()=>prepareDemo('../existing'),/Choose a synthetic/);
  const targets=new Set<string>();
  for(const scenario of ['fresh','existing','feedback']) {
    const demo=prepareDemo(scenario);targets.add(demo.target);
    t.after(()=>rmSync(demo.target,{recursive:true,force:true}));
    assert.equal(demo.synthetic,true);
    assert.equal(readdirSync(demo.target).length,scenario==='fresh'?0:5);
    assert.equal(readWorkflow(demo.target).initialized,false);
  }
  assert.equal(targets.size,3);
});

test('first interaction is short and offers the two entry paths without writes', t => {
  const root = temporaryProject(t);
  const text = renderStatus(readWorkflow(root));
  assert.equal(text, renderOpening());
  assert.ok(words(text) >= 35 && words(text) <= 60);
  assert.equal(text.match(/\?/g)?.length, 1);
  assert.match(text, /Are you starting fresh, or do you already have a project in progress\?/);
  assert.deepEqual(readdirSync(root), []);
});

for (const name of ['fresh', 'existing', 'feedback']) test(`${name}: concise reviewed scope, optional detail, approval and resume preserve context`, t => {
  const root = temporaryProject(t), draft = fixture(name);
  if (name !== 'fresh') attachProject(root, draft);
  const before = draft.artifacts.map(item => readFileSync(join(root,item.path)));
  const saved = saveDraft(root,draft);
  const summary = renderSummary(saved);
  assert.ok(words(summary) <= 120, `${words(summary)} words`);
  assert.ok(summary.startsWith('Executive Summary\n'));
  assert.match(summary,/Build now/);
  for (const capability of draft.proposal.capabilities) assert.ok(summary.includes(capability));
  assert.ok(!summary.includes(draft.proposal.why));
  assert.throws(()=>approvedHandoff(root),/No approved scope/);
  for (const section of detailSections) {
    const detail = renderDetail(saved,section);
    assert.ok(words(detail) <= 250, `${section}: ${words(detail)}`);
    assert.equal(readWorkflow(root).draft?.hash,saved.hash);
    assert.equal(readWorkflow(root).cycle,null);
  }
  assert.match(renderDetail(saved,'research'),/No research has been performed/);
  assert.match(renderDetail(saved,'sources'),/No research sources/);
  const cycle=approve(root,saved.hash);
  assert.deepEqual(cycle.draft,draft);
  assert.equal(approve(root,saved.hash).id,cycle.id);
  assert.match(renderHandoff(approvedHandoff(root)),/Founder intention/);
  assert.ok(!renderStatus(readWorkflow(root)).includes('Are you starting fresh'));
  assert.ok(JSON.stringify(compactContext(root)).includes(draft.ideal.intention.statement!));
  for (const [index,item] of draft.artifacts.entries()) assert.deepEqual(readFileSync(join(root,item.path)),before[index]);
});

test('unknown intention, buyer and no evidence do not prevent a bounded approved build', t => {
  const root=temporaryProject(t), draft=fixture();
  draft.ideal.intention={goal:'unknown',statement:null};
  const cycle=approve(root,saveDraft(root,draft).hash);
  assert.equal(cycle.draft.foundation.buyer.value,null);
  assert.equal(cycle.basis,'HYPOTHESIS-LED');
});

test('all founder-defined goal categories round-trip without a questionnaire', t => {
  for (const goal of ['solo_profit','high_growth','b2b_enterprise','impact','learning','custom'] as const) {
    const root=temporaryProject(t), draft=fixture();
    draft.ideal.intention={goal,statement:'My own definition of success.'};
    assert.deepEqual((saveDraft(root,draft).draft as RevisedDraft).ideal.intention,draft.ideal.intention);
  }
});

test('invalid intention, consequence or feedback provenance fails before creating storage', t => {
  const root=temporaryProject(t);
  for (const change of [
    (d:RevisedDraft)=>{d.ideal.intention.statement=null;},
    (d:RevisedDraft)=>{d.ideal.consequence={value:null,basis:'assumption',source:null};},
    (d:RevisedDraft)=>{d.ideal.feedback=[{summary:'Invented feedback',source:'No message',provenance:'founder_reported'}];},
    (d:RevisedDraft)=>{Object.assign(d.ideal.feedback,{0:{summary:'Customer validation',source:'No message',provenance:'verified'}});},
  ]) {
    const draft=fixture();change(draft);assert.throws(()=>saveDraft(root,draft));
    assert.deepEqual(readdirSync(root),[]);
  }
});

test('evaluation states never gate build and distinguish proxy from disclosed metric', t => {
  for (const state of ['not_run','requested','available','unavailable'] as const) {
    const root=temporaryProject(t),draft=fixture();
    draft.ideal.evaluation={state,question:state==='requested'?'Which manual substitutes exist?':null,unavailableReason:state==='unavailable'?'Research is not available in this prototype.':null,findings:state==='available'?[finding()]:[]};
    const saved=saveDraft(root,draft);
    const detail=renderDetail(saved,'research');
    assert.match(detail,/Build now/);
    if(state==='available') assert.match(detail,/public proxy; synthetic fixture/);
    assert.equal(approve(root,saved.hash).basis,'HYPOTHESIS-LED');
  }
});

test('evaluation rejects fabricated availability, private metrics, missing sources and invalid dates', t => {
  const root=temporaryProject(t);
  for(const change of [
    (e:Evaluation)=>{e.findings=[];},
    (e:Evaluation)=>{e.state='not_run';},
    (e:Evaluation)=>{Object.assign(e.findings[0]!,{kind:'private_revenue'});},
    (e:Evaluation)=>{e.findings[0]!.source.url='';},
    (e:Evaluation)=>{e.findings[0]!.source.url='https://secret:password@example.invalid';},
    (e:Evaluation)=>{e.findings[0]!.source.accessedOn='2026-02-30';},
    (e:Evaluation)=>{e.findings[0]!.limitation='';},
  ]) {
    const draft=fixture();draft.ideal.evaluation.state='available';draft.ideal.evaluation.findings=[finding()];change(draft.ideal.evaluation);
    assert.throws(()=>saveDraft(root,draft));assert.deepEqual(readdirSync(root),[]);
  }
});

test('oversized response or one-sentence summary is rejected without silently truncating scope', t => {
  const root=temporaryProject(t), draft=fixture();
  draft.brief.summary='One sentence only.';
  assert.throws(()=>saveDraft(root,draft),/two to five/);
  draft.brief.summary='Known report. Still uncertain.';
  draft.proposal.capabilities=['word '.repeat(70).trim(),'another '.repeat(45).trim()];
  assert.throws(()=>saveDraft(root,draft),/120 words/);
  assert.deepEqual(readdirSync(root),[]);
});

test('optional research pagination exposes every finding within budget and escapes collapsible markup', t => {
  const root=temporaryProject(t),draft=fixture();
  draft.ideal.evaluation.state='available';
  draft.ideal.evaluation.findings=Array.from({length:12},(_,i)=>({...finding(),statement:`Finding ${i}: ${'synthetic '.repeat(25)} </details><script>bad</script>`}));
  const saved=saveDraft(root,draft),first=renderDetail(saved,'research');
  const count=Number(first.match(/Page 1\/(\d+)/)?.[1]);assert.ok(count>1);
  const all=Array.from({length:count},(_,i)=>{
    const text=renderDetail(saved,'research',i+1);assert.ok(words(text)<=250,`${words(text)} words`);return text;
  }).join('\n');
  for(let i=0;i<12;i++)assert.ok(all.includes(`Finding ${i}:`));
  const collapsed=Array.from({length:count},(_,i)=>renderDetail(saved,'research',i+1,true)).join('\n');
  assert.ok(!collapsed.includes('<script>'));assert.ok(collapsed.includes('&lt;script&gt;'));
  assert.throws(()=>renderDetail(saved,'research',count+1),/Choose a detail page/);
});

test('v1 approved cycles remain byte-equivalent and cannot be overwritten with revised branding', t => {
  const root=temporaryProject(t), legacy=JSON.parse(readFileSync(join(fixtures,'m1/idea.json'),'utf8')) as unknown;
  const saved=saveDraft(root,legacy),cycle=approve(root,saved.hash);
  assert.deepEqual(readWorkflow(root).cycle,cycle);
  assert.throws(()=>saveDraft(root,fixture()),/immutable/);
  assert.deepEqual(readWorkflow(root).cycle?.draft,legacy);
});

test('v2 correction invalidates old Build now approval while preserving skipped context', t => {
  const root=temporaryProject(t),draft=fixture();
  const original=saveDraft(root,draft);
  draft.expectedVersion=original.version;draft.ideal.intention={goal:'learning',statement:'I just want to learn.'};
  draft.brief.summary='You want to learn by building a client checklist. Agency demand remains unknown.';
  const revised=saveDraft(root,draft);
  assert.throws(()=>approve(root,original.hash),/does not match/);
  assert.equal(approve(root,revised.hash).draft.foundation.buyer.value,null);
});

test('real CLI optional-detail actions return to the same unapproved scope', t => {
  const root=temporaryProject(t),saved=saveDraft(root,fixture());
  for(const section of ['research','competitors','evidence','sources']) {
    const result=spawnSync(process.execPath,[cli,'internal','detail',root,'--section',section],{encoding:'utf8',windowsHide:true});
    assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/Build now/);
  }
  const invalid=spawnSync(process.execPath,[cli,'internal','detail',root,'--page','NaN'],{encoding:'utf8',windowsHide:true});
  assert.equal(invalid.status,1);
  assert.equal(readWorkflow(root).draft?.hash,saved.hash);assert.equal(readWorkflow(root).cycle,null);
});
