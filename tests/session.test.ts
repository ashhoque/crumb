import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, unlinkSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { temporaryProject } from './helpers.js';
import { prepareIde, ideFixture } from './ide-fixtures.js';
import { planFor, existingPlan, resultFor } from './act-fixtures.js';
import { agreesWithPresentation } from '../src/domain/reply.js';
import { CONTINUE_BUILD } from '../src/domain/session.js';
import { confirmedReply } from '../src/cli/conversation-render.js';
import { readPrebuild, savePrebuild, transitionIde } from '../src/application/prebuild.js';
import { currentConversation, syncConversationArtifacts, readyToBuild, continueBuild, conversationDetail } from '../src/application/session.js';
import { prepareWorkPack } from '../src/application/work.js';
import { approveActPlan, actHandoff, recordActStage, readAct } from '../src/application/act.js';
import type { IdeContext } from '../src/domain/ide.js';
const host={host:'codex' as const,sharedProjectFiles:true,canExecute:true};
const resume=(root:string,paths:string[]=[])=>continueBuild(root,{phrase:CONTINUE_BUILD,host,paths,permissionQuote:'Synthetic founder permits these disposable repository files.'});

test('R1 natural assent and semantic host interpretation preserve ambiguity veto',()=>{
  for(const quote of ['yes','yup','yep','yeah','exactly','correct',"that's right",'sounds right','sounds good','that works','agreed','sure',"let’s do it",'go with that','Yes — let’s build']) assert.equal(agreesWithPresentation(quote),true,quote);
  assert.equal(agreesWithPresentation('You captured my intention accurately.',{meaning:'agreement',explanation:'The founder explicitly endorses the currently presented intention.'}),true);
  for(const quote of ['maybe','probably','I guess','sort of','yes but change the user','sure if it is free','no','yes?'])assert.equal(agreesWithPresentation(quote,{meaning:'agreement',explanation:'Cannot override ambiguity.'}),false,quote);
});

for(const through of ['none','intention','user','problem','evaluation'] as const)test(`R1 transition cannot bypass ${through} IDE state`,t=>{
  const root=temporaryProject(t);prepareIde(root,through);
  assert.throws(()=>readyToBuild(root,host));assert.throws(()=>resume(root));
});

test('R1 ordinary and final current presentations accept natural replies without coding',t=>{
  const root=temporaryProject(t);prepareIde(root,'none');
  for(const subject of ['intention','user','problem','evaluation','act'] as const){
    if(subject==='evaluation')transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'review'});
    const shown=transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'present',subject});
    const presentationId=(shown.context as IdeContext).ide.presentation!.id;
    assert.throws(()=>transitionIde(root,{expectedVersion:shown.version,operation:'confirm',presentationId,turnId:randomUUID(),quote:'maybe'}),/clear agreement|Explicit agreement/);
    const saved=transitionIde(root,{expectedVersion:shown.version,operation:'confirm',presentationId,turnId:randomUUID(),quote:'yup'});
    if(['intention','user','problem'].includes(subject)){assert.doesNotMatch(confirmedReply(saved),/Executive summary|Please reply Yes|Great idea|Amazing/);}
    if(subject==='evaluation'){assert.doesNotMatch(confirmedReply(saved),/^Executive summary/i);assert.match(confirmedReply(saved),/first-user|build cycle/i);}
  }
  assert.equal(currentConversation(root).mode,'conversation');assert.equal(readAct(root),null);
  assert.equal(JSON.parse(readFileSync(join(root,'BUILD_HANDOFF.json'),'utf8')).executionApproved,false);
});

test('R1 compact context reuses provenance without transcript, full history or inferred name',t=>{
  const root=temporaryProject(t),saved=prepareIde(root),compact=currentConversation(root);
  assert.equal(compact.intention.text,(saved.context as IdeContext).intention.statement);
  assert.equal(compact.user.confirmed,true);assert.equal(compact.problem.confirmed,true);
  assert.equal(compact.preferredName,null);assert.equal(compact.researchPolicy.default,'reuse_cached');
  assert.ok(JSON.stringify(compact).length<JSON.stringify(saved.context).length/2);
  const research=readFileSync(join(root,'CRUMB_RESEARCH.json'),'utf8');
  for(let i=0;i<3;i++)currentConversation(root);
  syncConversationArtifacts(root);assert.equal(readFileSync(join(root,'CRUMB_RESEARCH.json'),'utf8'),research);
  assert.deepEqual(JSON.parse(research).sources,(saved.context as IdeContext).sources);
  assert.equal('history'in compact,false);assert.equal('claims'in compact,false);
  const id=(saved.context as IdeContext).sources[0]!.id;
  const selected=conversationDetail(root,{ids:[id,'unavailable-reference']});
  assert.equal(selected.items.length,1);assert.deepEqual(selected.unknownIds,['unavailable-reference']);
  assert.throws(()=>conversationDetail(root,{ids:[]}),/one to six/);
});

test('R1 ChatGPT same-Project Work phrase and unsupported host boundaries are honest',t=>{
  const root=temporaryProject(t);prepareIde(root);
  const text=readyToBuild(root,{...host,host:'chatgpt'});
  assert.match(text,/open a Work chat in this same Project/);assert.ok(text.includes(CONTINUE_BUILD));
  assert.match(text,/not opened another session/);assert.match(text,/will not need to explain/);
  const unavailable=readyToBuild(root,{...host,host:'chatgpt',sharedProjectFiles:false});
  assert.match(unavailable,/cannot verify shared files/);assert.doesNotMatch(unavailable,/open a Work chat/);
  assert.throws(()=>continueBuild(root,{phrase:CONTINUE_BUILD,host:{...host,canExecute:false},paths:[],permissionQuote:'Synthetic permission'}),/has not declared/);
  for(const name of ['claude','cursor','portable'] as const)assert.ok(readyToBuild(root,{...host,host:name}).includes(CONTINUE_BUILD));
});

test('R1 explicit preferred name is occasional and no unrelated identity is used',t=>{
  const root=temporaryProject(t),c=ideFixture();c.preferredName={value:'Sam',source:'Founder explicitly said call me Sam.'};
  const s=prepareIde(root,'intention',c);assert.match(confirmedReply(s),/Sam/);
  assert.equal(currentConversation(root).preferredName.value,'Sam');
});

test('R1 edited portable files are preserved and missing files prevent continuation',t=>{
  const root=temporaryProject(t);prepareIde(root);const path=join(root,'BUILD_HANDOFF.md'),original=readFileSync(path,'utf8');
  writeFileSync(path,'Founder edits to preserve.');assert.throws(()=>resume(root),/changed or is missing/);
  assert.throws(()=>syncConversationArtifacts(root),/Preserve edited or unowned/);assert.equal(readFileSync(path,'utf8'),'Founder edits to preserve.');
  writeFileSync(path,original);unlinkSync(path);assert.throws(()=>resume(root),/changed or is missing/);
  syncConversationArtifacts(root);assert.equal(resume(root).mode,'build');
});

test('R1 material IDE change retires handoff and requires only affected agreement',t=>{
  const root=temporaryProject(t);prepareIde(root);resume(root);
  const old=readPrebuild(root)!,c=structuredClone(old.context) as IdeContext;c.expectedVersion=old.version;c.definition.problem.text='A materially different pain that needs confirmation.';
  savePrebuild(root,c);assert.equal(currentConversation(root).mode,'conversation');
  assert.equal(JSON.parse(readFileSync(join(root,'BUILD_HANDOFF.json'),'utf8')).status,'stale_or_unconfirmed');
  assert.throws(()=>resume(root));assert.equal(currentConversation(root).intention.confirmed,true);
});

test('R1 portable bundle cannot grant another repository execution authority',t=>{
  const a=temporaryProject(t),b=temporaryProject(t);prepareIde(a);prepareIde(b);
  copyFileSync(join(a,'COPILOT_SESSION.json'),join(b,'COPILOT_SESSION.json'));
  assert.throws(()=>resume(b),/ownership\/integrity/);
});

test('R1 existing project inspection precedes six coherent review documents and exact pack approval',t=>{
  const root=temporaryProject(t),p=existingPlan(root),before=readPrebuild(root)!;
  assert.throws(()=>resume(root),/Inspect relevant permitted files/);
  const session=resume(root,p.repository.inspectedPaths);p.execution={mode:'build',handoffHash:session.handoffHash,automaticStages:true,humanCheckpoints:['mvp']};
  const s=prepareWorkPack(root,p);assert.equal(s.record.status,'proposed');assert.throws(()=>actHandoff(root),/not authorized/);
  for(const name of ['STARTUP_MASTER.md','RED_TEAM_REVIEW.md','TECHNICAL_MASTER.md','BUSINESS_MASTER.md','GROUNDWORK.md','BUILD_PLAN.md']){
    const text=readFileSync(join(root,s.record.pack!.directory,name),'utf8'),c=before.context as IdeContext;
    for(const value of [c.intention.statement!,c.definition.user.text!,c.definition.problem.text!])assert.ok(text.includes(value),name);
  }
  assert.deepEqual(readPrebuild(root),before);assert.equal(readFileSync(join(root,'parser.mjs'),'utf8'),'export const parse = text => JSON.parse(text);\n');
  const file=join(root,s.record.pack!.directory,'RED_TEAM_REVIEW.md');writeFileSync(file,readFileSync(file,'utf8')+'Unreviewed change.');
  assert.throws(()=>approveActPlan(root,{expectedVersion:s.version,planHash:s.record.planHash,quote:'Synthetic approval of exact pack.'}),/changed|match|modified/);
});

test('R1 native host performs real edits/tests; failed exit cannot advance, passing exit reaches human stop',t=>{
  const root=temporaryProject(t),p=existingPlan(root),session=resume(root,p.repository.inspectedPaths);
  p.execution={mode:'build',handoffHash:session.handoffHash,automaticStages:true,humanCheckpoints:['mvp']};
  p.stages.unshift({id:'risk',title:'Verify the existing parser',kind:'risk',goal:'Reuse the parser after testing its real behavior.',capabilities:[],writes:[],checks:[{id:'input',description:'Parse actual input.',commandHint:'node parser check'}]});
  let saved=prepareWorkPack(root,p);saved=approveActPlan(root,{expectedVersion:saved.version,planHash:saved.record.planHash,quote:'Synthetic founder approves this full pack, automatic passing risk stage, and MVP human stop.'});
  const run=(args:string[])=>{const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true,timeout:20000,env:{...process.env,NODE_TEST_CONTEXT:undefined}});assert.ifError(r.error);assert.notEqual(r.status,null);return {command:[process.execPath,...args].join(' '),exitCode:r.status!,output:r.stdout+r.stderr||'(no output)'};};
  const record=(execution:ReturnType<typeof run>,complete:boolean,changes:ReturnType<typeof resultFor>['changes']=[])=>{const r=resultFor(readAct(root)!);return recordActStage(root,{...r,implementation:complete?'completed':'partial',changes,checks:[{...r.checks[0]!,...execution,result:complete?'passed':'failed'}],gaps:complete?[]:['Actual process failed; stay on this stage.']});};
  assert.equal(actHandoff(root).stage.id,'risk');const failed=run(['-e','process.exit(1)']);assert.equal(failed.exitCode,1);
  saved=record(failed,false);assert.equal(saved.record.currentStage,0);assert.equal(saved.record.automaticAdvances?.length??0,0);
  const passed=run(['--input-type=module','-e',"import {parse} from './parser.mjs'; if(parse('[1]')[0]!==1) process.exit(1); console.log('Existing parser passed');"]);
  assert.equal(passed.exitCode,0);saved=record(passed,true);assert.equal(saved.record.currentStage,1);assert.equal(saved.record.automaticAdvances?.length,1);
  assert.equal(actHandoff(root).stage.id,'mvp');
  for(const file of ['compare.mjs','compare.test.mjs']){let text=readFileSync(new URL('../../fixtures/m2/comparison/'+file,import.meta.url),'utf8');if(file==='compare.mjs')text=text.replace('const parse = JSON.parse;',"import { parse } from './parser.mjs';");writeFileSync(join(root,file),text);}
  const tests=run(['--test','--test-reporter=tap','compare.test.mjs']);assert.equal(tests.exitCode,0,tests.output);assert.match(tests.output,/# pass 4/);
  saved=record(tests,true,['compare.mjs','compare.test.mjs'].map(path=>({path,kind:'created' as const})));
  assert.equal(saved.record.status,'awaiting_review');assert.throws(()=>actHandoff(root),/not authorized/);
  assert.equal(saved.record.receipts.at(-1)!.customerValidation,'not_established');assert.equal(saved.record.receipts.at(-1)!.release,'not_released');
  assert.match(readFileSync(join(root,'dashboard.mjs'),'utf8'),/Working unrelated dashboard retained/);
});

test('R1 CLI continuation and compact context run without a transcript',t=>{
  const root=temporaryProject(t);prepareIde(root);const cli=fileURLToPath(new URL('../src/cli/main.js',import.meta.url));
  const run=(op:string,input?:unknown)=>spawnSync(process.execPath,[cli,'internal',op,root],{input:input?JSON.stringify(input):undefined,encoding:'utf8',windowsHide:true,timeout:15000});
  const compact=run('conversation-context');assert.equal(compact.status,0,compact.stderr);assert.equal(JSON.parse(compact.stdout).mode,'conversation');
  const resumed=run('continue-build',{phrase:CONTINUE_BUILD,host,paths:[],permissionQuote:'Synthetic permission for fresh fixture.'});
  assert.equal(resumed.status,0,resumed.stderr);const s=JSON.parse(resumed.stdout);const p=planFor(readPrebuild(root)!);p.execution={mode:'build',handoffHash:s.handoffHash,automaticStages:false,humanCheckpoints:['mvp']};
  const pack=run('work-pack',p);assert.equal(pack.status,0,pack.stderr);assert.match(pack.stdout,/Approve Build Pack/);
});
