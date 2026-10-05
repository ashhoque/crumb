import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { temporaryProject } from './helpers.js';
import { prepareIde, confirmSubject } from './ide-fixtures.js';
import { planFor } from './act-fixtures.js';
import { validateIde, assertAct, assertEvaluationComplete, ideState, type IdeContext, type Subject } from '../src/domain/ide.js';
import { emptyQuality, researchPlan, researchableQuestion, validateQuality, interviewRecommendation } from '../src/domain/evaluation-quality.js';
import { problemInterview, interviewFollowUp } from '../src/domain/interviews.js';
import { savePrebuild, readPrebuild, transitionIde } from '../src/application/prebuild.js';
import { currentConversation, conversationDetail, readyToBuild, continueBuild } from '../src/application/session.js';
import { prepareWorkPack } from '../src/application/work.js';
import { readAct } from '../src/application/act.js';
import { inspectArtifacts } from '../src/privacy/artifacts.js';
import { renderPrebuildSummary, renderPrebuildDetail, interviewGuide } from '../src/cli/prebuild-render.js';
import { confirmedReply } from '../src/cli/conversation-render.js';
import { nextIdeStep } from '../src/domain/guide.js';
import { CONTINUE_BUILD } from '../src/domain/session.js';

const fixture=():IdeContext=>JSON.parse(readFileSync(new URL('../../fixtures/m3r1-quality/stock.json',import.meta.url),'utf8'));
const current=(root:string):IdeContext=>({...structuredClone(readPrebuild(root)!.context) as IdeContext,expectedVersion:readPrebuild(root)!.version});
const cli=fileURLToPath(new URL('../src/cli/main.js',import.meta.url));
const run=(root:string,op:string,input?:unknown)=>spawnSync(process.execPath,[cli,'internal',op,root],{input:input===undefined?undefined:JSON.stringify(input),encoding:'utf8',windowsHide:true,timeout:20000});

test('Quality native template includes research responsibilities; historical context stays readable',t=>{
  const root=temporaryProject(t),r=run(root,'template');assert.equal(r.status,0,r.stderr);
  assert.equal(JSON.parse(r.stdout).quality.technical.coverage.length,10);
  const old=fixture();delete old.quality;assert.doesNotThrow(()=>validateIde(old));
  const c=fixture();assert.doesNotThrow(()=>validateIde(c));
  savePrebuild(root,c);const p=run(root,'evaluation-plan');assert.equal(p.status,0,p.stderr);
  const plan=JSON.parse(p.stdout);assert.match(plan.owner,/Crumb researches/);assert.match(plan.work.join(' '),/urgency.*frequency.*switching/);
  assert.match(plan.work.join(' '),/founder.*edge/);assert.match(plan.scopeDiscipline,/manual or existing-tool/);
});

test('Quality rejects implementation delegation, preserves founder intent and constraints',()=>{
  for(const q of ['Which database should we use?','What competitors exist?','Which API should provide this data?','What pricing model should this category have?','Which communities should we search?','How should this technical mechanism work?','What are the likely technical risks?']){
    assert.equal(researchableQuestion(q),true,q);const c=fixture();c.brief.next=q;assert.throws(()=>validateIde(c),/research|investigate/i);
  }
  for(const q of ['Are there budget constraints I should know about?','Does this match what you mean?','Have you experienced this yourself?','Do you already know people like this?'])assert.equal(researchableQuestion(q),false,q);
});

test('Quality blocks unexamined technical feasibility and investigated options without provenance',t=>{
  const root=temporaryProject(t),c=fixture();c.quality=emptyQuality();prepareIde(root,'problem',c);
  assert.throws(()=>transitionIde(root,{operation:'review',expectedVersion:readPrebuild(root)!.version}),/technical questions/);
  const missing=fixture();missing.quality!.technical.coverage[0]!.claimIds=['invented'];assert.throws(()=>validateQuality(missing),/retained claims/);
  const noRun=fixture();noRun.quality!.technical.coverage[0]!.runIds=[];assert.throws(()=>validateQuality(noRun,true),/Investigate/);
  const noOption=fixture();noOption.quality!.technical.recommendation={option:'Invented vendor',reason:'No inspected support.'};assert.throws(()=>validateQuality(noOption,true),/investigated technical option/);
});

test('Quality existing project uses permitted actual repository observations',t=>{
  const root=temporaryProject(t),c=fixture();c.project.entry='existing';
  assert.match(researchPlan(c).repository,/Inspect relevant permitted/);assert.throws(()=>validateQuality(c,true),/repository files/);
  writeFileSync(join(root,'parser.mjs'),'export const parse = JSON.parse;\n');
  c.project.permissionQuote='Synthetic permission to inspect only parser.mjs.';
  c.project.artifacts=inspectArtifacts(root,{paths:['parser.mjs'],permissionGranted:true,permissionQuote:c.project.permissionQuote}).map(({path,sha256})=>({path,sha256}));
  assert.doesNotThrow(()=>validateQuality(c,true));savePrebuild(root,c);
  writeFileSync(join(root,'parser.mjs'),'export const parse = () => null;\n');
  assert.throws(()=>savePrebuild(root,current(root)),/files changed/);
});

test('Quality contract cannot be dropped; technical changes retire Evaluation and Act only',t=>{
  const root=temporaryProject(t);prepareIde(root,'act',fixture());
  const stripped=current(root);delete stripped.quality;assert.throws(()=>savePrebuild(root,stripped),/Retain the technical/);
  const revised=current(root);revised.quality!.technical.centralRisk='Commercial access has changed and needs a new review.';savePrebuild(root,revised);
  const state=ideState(current(root));assert.equal(state.intention,'founder_confirmed');assert.equal(state.target_user,'founder_confirmed');assert.equal(state.problem_definition,'founder_confirmed');
  assert.notEqual(state.evaluation,'founder_reviewed');assert.throws(()=>assertAct(current(root)));
});

test('Quality warmth reflects intention, uses safe name once, and leads without a questionnaire',t=>{
  const root=temporaryProject(t),c=fixture();c.preferredName={value:'Sam',source:'Synthetic host explicitly exposes approved display name Sam for conversational address.'};
  let saved=prepareIde(root,'intention',c);const first=confirmedReply(saved);assert.match(first,/Sam/);assert.match(first,/willingness to pay|support/);assert.ok((first.match(/\?/g)??[]).length<=1);
  assert.doesNotMatch(first,/Executive summary|Response saved|Confirmation is required|Amazing|Great idea/);
  saved=confirmSubject(root,'user');const second=confirmedReply(saved);assert.doesNotMatch(second,/Sam/);assert.match(second,/tighter user/);assert.ok((second.match(/\?/g)??[]).length<=1);
  saved=confirmSubject(root,'problem');assert.match(confirmedReply(saved),/saved research is ready for review/);assert.doesNotMatch(confirmedReply(saved),/What would you like to do next|which API/i);
  const researching=current(root);researching.evaluation.status='in_progress';assert.match(nextIdeStep(researching).text,/check the alternatives/);
});

test('Quality default Evaluation surfaces technical risk, love/hate, and a specific habitat before Act',t=>{
  const root=temporaryProject(t);prepareIde(root,'problem',fixture());transitionIde(root,{operation:'review',expectedVersion:readPrebuild(root)!.version});
  const shown=transitionIde(root,{operation:'present',subject:'evaluation',expectedVersion:readPrebuild(root)!.version});
  const text=renderPrebuildSummary(shown);assert.doesNotMatch(text,/^Executive summary/i);assert.match(text,/technical|holdings/i);assert.match(text,/TradingView/);assert.match(text,/r\/swingtrading/);assert.match(text,/optional/);
  assert.equal(text.match(/\?/g)?.length,1);assert.ok(text.split(/\s+/).length<340,`Default synthesis should be concise: ${text.split(/\s+/).length} words`);
  assert.throws(()=>assertAct(shown.context));const detail=renderPrebuildDetail(shown,'technical');assert.match(detail,/Central risk/);assert.equal(readPrebuild(root)!.version,shown.version);
  const q=fixture().quality!;assert.ok(q.technical.options.length<=3);assert.match(q.technical.recommendation!.reason,/scheduled|fresh|input/i);
});

test('Quality cached detail keeps provenance without repeating research or loading giant context',t=>{
  const root=temporaryProject(t);prepareIde(root,'evaluation',fixture());const c=current(root),before=readPrebuild(root)!.version;
  const compact=currentConversation(root);assert.ok(JSON.stringify(compact).length<JSON.stringify(c).length/2);
  const selected=conversationDetail(root,{ids:['q-sec']});assert.equal(selected.items.length,1);assert.match(JSON.stringify(selected),/sec.gov/);
  assert.equal(readPrebuild(root)!.version,before);assert.equal(current(root).research.length,c.research.length);
  assert.match(readFileSync(join(root,'CRUMB_RESEARCH.json'),'utf8'),/freshness_quality/);
});

test('Quality interviews retain all five past-behavior concepts, disregard hypothetical freeform overrides',t=>{
  const root=temporaryProject(t),input=fixture();input.opportunity!.interviewPlan='Would you buy this? What features should we add?';prepareIde(root,'evaluation',input);const c=current(root);
  const text=interviewGuide(c).join('\n');assert.match(text,/most trouble/);assert.match(text,/most recent occasion/);assert.match(text,/particular occasion difficult/);assert.match(text,/already tried/);assert.match(text,/let you down/);
  assert.equal((text.match(/^\d\./gm)??[]).length,5);assert.doesNotMatch(text,/Would you buy|What features|\$20/);assert.match(text,/listen/);assert.match(text,/Compare|compare/);
  assert.match(renderPrebuildDetail(readPrebuild(root)!,'interview'),/1\. Thinking/);
  for(const answer of ['I used a spreadsheet.','The manager needed it.','It cost two hours.','It was confusing.']){const follow=interviewFollowUp(answer);assert.equal(follow.match(/\?/g)?.length,1);assert.doesNotMatch(follow,/would you buy|features/i);}
  const response=run(root,'interview-followup',{answer:'I lost two hours.'});assert.equal(response.status,0,response.stderr);assert.equal(JSON.parse(response.stdout).recorded,false);assert.match(response.stdout,/most recent/);
});

test('Quality recommends conversations for behavioral uncertainty without adding an Act gate',t=>{
  const root=temporaryProject(t);prepareIde(root,'evaluation',fixture());const c=current(root);
  assert.match(interviewRecommendation(c)!,/few people|short guide/);assert.match(nextIdeStep(c).text,/still choose to build/);
  assert.equal(nextIdeStep(c).text.match(/Are you ready to commit a build cycle to this\?/g)?.length,1);assert.doesNotMatch(nextIdeStep(c).text,/Executive summary|Yes — let's build · Change the user · Change the problem · Review evaluation/);
  assert.equal(c.feedbackClaimIds.length,0);confirmSubject(root,'act');assert.doesNotThrow(()=>assertAct(current(root)));
  const skip=fixture();skip.quality!.learning.recommendation='build_decision';assert.throws(()=>validateQuality(skip,true),/user conversations/);
});

test('Quality stock retains substitute breadth, attributed anecdotes, counterevidence and unknown founder advantage',()=>{
  const c=fixture();assert.equal(c.investigation.alternatives.length,9);
  const anecdote=c.claims.find(x=>x.id==='q-lovehate-claim')!;assert.equal(anecdote.repetition,'single');assert.match(anecdote.limitation,/single|anecdote|consensus/i);
  assert.match(c.competitors[0]!.fields.gaps.text!,/inference|hypothesis|not|counter/i);
  assert.ok(c.claims.some(x=>x.metric));assert.ok(c.adjacent.length>0);assert.match(c.quality!.founderFit.limitation,/unknown|not|no /i);
  assert.ok(c.sources.some(x=>x.id==='q-rules'&&x.access==='unavailable'));assert.equal(c.habitats[0]!.participation.verified,false);
});

/** Scripted local-core rehearsal. Public research is inspected; replies and the
 * changed-problem turn are synthetic. No real users, outreach or agent trial. */
export function qualityStockRehearsal(root:string):string {
  const turns:string[]=['# Focused M3-R1 stock rehearsal','SYNTHETIC FOUNDER DIALOGUE. Public-source refresh: 2026-09-27. This is a scripted core/renderer exercise, not an independent host conversation or customer validation.'];
  const say=(who:string,text:string)=>turns.push(`## ${who}\n\n${text}`);
  savePrebuild(root,fixture());say('Synthetic founder','Call me Sam. I want a paid solo business helping swing traders compare their shortlisted stocks; I can code, but cannot support live-market trading.');
  const confirm=(subject:Subject,quote='yup')=>{
    const shown=transitionIde(root,{operation:'present',subject,expectedVersion:readPrebuild(root)!.version});
    // The preceding contextual reply may already contain this exact next question.
    // Bind its presentation before accepting assent; don't display it twice.
    const displayed=renderPrebuildSummary(shown);if(!turns.at(-1)?.endsWith(displayed))say('Crumb',displayed);say('Synthetic founder',quote);
    const saved=transitionIde(root,{operation:'confirm',expectedVersion:shown.version,presentationId:(shown.context as IdeContext).ide.presentation!.id,turnId:randomUUID(),quote});
    if(subject!=='act')say('Crumb',confirmedReply(saved));
  };
  for(const s of ['intention','user','problem'] as const)confirm(s);
  say('Research performed by the host','The saved fixture retains prior landscape research and a focused refresh of eight inspected public pages. No founder was asked to pick a database, API, community or technical definition. Quarterly holdings are delayed context; current charting capabilities also challenge an older complaint. See the source appendix and optional technical evaluation.');
  transitionIde(root,{operation:'review',expectedVersion:readPrebuild(root)!.version});confirm('evaluation','sounds right');
  return turns.join('\n\n');
}

test('Quality stock rehearsal returns to Define/Evaluate for changed intent, then preserves build handoff and pack',t=>{
  const root=temporaryProject(t);let text=qualityStockRehearsal(root);
  text+='\n\n## Optional discovery guide\n\n'+problemInterview(current(root)).join('\n\n');
  const before=current(root);assert.throws(()=>assertAct(before));const revised=current(root);
  revised.definition.problem.text+=' The intended outcome is a repeatable review rationale, not a claim about current institutional buying.';
  savePrebuild(root,revised);assert.notEqual(ideState(current(root)).problem_definition,'founder_confirmed');assert.equal(ideState(current(root)).target_user,'founder_confirmed');
  text+='\n\n## Synthetic clarification and loop\n\nFounder: Exactly — the review rationale is the pain; I do not mean live institutional buying. Crumb revises only the problem, preserves intention/user, and requires renewed problem and Evaluation confirmation. No actual interview finding is claimed.';
  confirmSubject(root,'problem');transitionIde(root,{operation:'review',expectedVersion:readPrebuild(root)!.version});confirmSubject(root,'evaluation');
  const shown=transitionIde(root,{operation:'present',subject:'act',expectedVersion:readPrebuild(root)!.version});text+='\n\n## Crumb\n\n'+renderPrebuildSummary(shown)+'\n\n## Synthetic founder\n\nYes, let’s build.';
  transitionIde(root,{operation:'confirm',expectedVersion:shown.version,presentationId:(shown.context as IdeContext).ide.presentation!.id,quote:'Yes, let’s build.',turnId:randomUUID()});
  const host={host:'codex' as const,sharedProjectFiles:true,canExecute:true};
  const transition=readyToBuild(root,{...host,host:'chatgpt'});assert.match(transition,/same Project/);assert.ok(transition.includes(CONTINUE_BUILD));text+='\n\n## Crumb\n\n'+transition;
  assert.equal(readAct(root),null);const session=continueBuild(root,{phrase:CONTINUE_BUILD,host,paths:[],permissionQuote:'Synthetic authorization for this disposable fixture.'});
  const p=planFor(readPrebuild(root)!);p.execution={mode:'build',handoffHash:session.handoffHash,automaticStages:true,humanCheckpoints:['mvp']};prepareWorkPack(root,p);
  const pack=join(root,readAct(root)!.record.pack!.directory);assert.match(readFileSync(join(pack,'TECHNICAL_MASTER.md'),'utf8'),/holdings|quarter|freshness/i);
  assert.match(readFileSync(join(pack,'BUILD_PLAN.md'),'utf8'),/manual or existing-tool/);
  assert.equal(readAct(root)!.record.status,'proposed');assert.equal(p.capabilities.length,2);assert.equal(p.park.length,2);
  text+='\n\n## Stop\n\nCurrent handoff preserved confirmed intention/user/revised problem. Six Build Pack documents generated for review. One supplied-fact comparison journey, two capabilities; live prices and portfolio dashboard parked. No customer code or stage executed without pack approval. No messages sent, interviews held, payments or customer validation claimed.';
  assert.ok(text.indexOf('r/swingtrading')<text.indexOf('Are you ready to commit'));assert.doesNotMatch(text,/Which API should|Which database should|Would you buy this/);
  if(process.env.CEC_QUALITY_TRANSCRIPT)writeFileSync(process.env.CEC_QUALITY_TRANSCRIPT,text+'\n');
});
