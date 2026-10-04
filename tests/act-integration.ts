import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rehearse, scenarios } from './ide-rehearsals.js';
import { planFor, multiStage, existingPlan, resultFor } from './act-fixtures.js';
import { readPrebuild } from '../src/application/prebuild.js';
import { readAct, actHandoff } from '../src/application/act.js';
import { basis, confirmation, ideState, type IdeContext } from '../src/domain/ide.js';
import type { ActPlan, StageResult } from '../src/domain/act.js';

const cli=fileURLToPath(new URL('../src/cli/main.js',import.meta.url));
const assets=fileURLToPath(new URL('../../fixtures/m2/',import.meta.url));
export interface CommandResult {command:string;exitCode:number;output:string}
function displayCommand(exe:string,args:string[]):string {
  const quote=(part:string)=>process.platform==='win32'?"'"+part.replaceAll("'","''")+"'":"'"+part.replaceAll("'","'\\''")+"'";
  return (process.platform==='win32'?'& ':'')+[exe,...args].map(quote).join(' ');
}
function run(root:string,exe:string,args:string[]):CommandResult {
  // A nested node --test must start an independent runner. Retain the offline
  // preload, but do not let Node's private parent-runner context suppress tests.
  const result=spawnSync(exe,args,{cwd:root,encoding:'utf8',windowsHide:true,timeout:20000,env:{...process.env,NODE_TEST_CONTEXT:undefined}});
  if(result.error)throw result.error;
  if(result.status===null)throw new Error(`Command did not finish: ${exe}`);
  return {command:displayCommand(exe,args),exitCode:result.status,output:(result.stdout+result.stderr).trim()||'(no output)'};
}
function tool(root:string,operation:string,input?:unknown):Record<string,unknown> {
  const result=spawnSync(process.execPath,[cli,'internal',operation,root],{cwd:root,input:input===undefined?undefined:JSON.stringify(input),encoding:'utf8',windowsHide:true,timeout:15000});
  assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout) as Record<string,unknown>;
}
const sample=JSON.stringify({candidates:['AAA','BBB'].map(symbol=>({symbol,asOf:'Synthetic observation, not market data',technical:'Supplied trend note',sector:'Unknown',fundamental:'Supplied business note',catalyst:'Unknown'})),note:'Record which facts need checking next.'},null,2)+'\n';

/** Native host adapter rehearsal: real files, processes, CLI contracts and stops.
 * Founder turns and scope decisions are authored synthetic inputs, not a live trial.
 */
export function exerciseAct(root:string,kind:'fresh'|'existing'|'stock',python=process.env['CEC_TEST_PYTHON']??(process.platform==='win32'?'C:/Python311/python.exe':'python3')) {
  let p:ActPlan,ideTranscript='Existing-project fixture uses five explicit synthetic IDE confirmations.';
  if(kind==='existing')p=existingPlan(root);
  else {const rehearsal=rehearse(root,scenarios.find(s=>s.id===(kind==='fresh'?'fresh-b2b':'stock'))!);ideTranscript=rehearsal.transcript;p=planFor(readPrebuild(root)!);}
  if(kind==='fresh'){
    const c=readPrebuild(root)!.context as IdeContext;
    p.scope.proposal.journey='Read the supplied client document lists and see which jobs can proceed';
    p.scope.proposal.capabilities=['Identify ready and waiting jobs'];p.scope.proposal.criticalUnknown='Does this remove repeated readiness checks?';
    p.scope.proposal.park=['Automatic reminders','Accounts'];p.park=p.scope.proposal.park.map(label=>({label,paths:[],reason:'Not needed to identify ready work.'}));
    p.scope.brief={summary:'One readiness check addresses the reported repeat work. Real usefulness still needs founder observation.',nextAction:'Approve the local readiness scope.',questions:[]};
    p.capabilities=[{name:p.scope.proposal.capabilities[0]!,userBasis:basis(c,'user'),problemBasis:basis(c,'problem'),evidenceClaimIds:['scenario-learning'],learningObjective:'See whether a bookkeeping owner can identify work that can proceed.'}];
    p.outcome={input:'A local JSON list of client jobs and required/received documents.',output:'Ready client names and the missing documents blocking other jobs.',failureBehavior:'Reject invalid or empty requirements with a useful error; preserve the source.',persistence:{mode:'none',reason:'Read existing lists and show results; no account or database is necessary.'}};
    p.repository.stack='Python standard library, chosen for this local file workflow; no third-party dependencies.';
    p.repository.constraints=['Use the available Python runtime and no database.'];
    p.scope.foundation.constraints=[...p.repository.constraints];
    p.stages[0]!.capabilities=p.scope.proposal.capabilities;p.stages[0]!.title='M1: complete client readiness';p.stages[0]!.goal='Read a real file, show ready work and explain useful failures.';
    p.stages[0]!.writes=['ready.py','test_ready.py','example.json'];p.stages[0]!.checks=[{id:'journey',description:'Run the complete Python readiness acceptance tests.',commandHint:'python -m unittest -v test_ready.py'}];
    multiStage(p);p.stages[0]!.checks[0]!.commandHint='python --version';p.stages[1]!.checks[0]!.commandHint='python -c "import json; assert json.loads(\'[1]\') == [1]"';
  } else {
    p.stages[0]!.writes.push('example.json');
    if(kind==='stock'){
      // These actual saved claims capture the user's comparison pain, evaluated
      // substitute limits and demand uncertainty. Never invent a new research run.
      const c=readPrebuild(root)!.context as IdeContext;
      const insight=c.redTeam[0]!.claimId;
      p.capabilities.forEach(x=>{x.evidenceClaimIds=[insight];});
      p.stages.unshift({id:'risk',title:'M0: verify supplied shortlist input',kind:'risk',goal:'Verify that the local input works without a live market-data integration.',capabilities:[],writes:['INPUT_NOTES.md'],checks:[{id:'input',description:'Parse supplied candidate notes using the existing runtime.',commandHint:'node --input-type=module -e "JSON.parse(\'[1]\')"'}]});
    }
  }
  const confirmedBefore=readPrebuild(root)!,foundation=confirmedBefore.context as IdeContext;
  assert.equal(ideState(foundation).act_readiness,'founder_confirmed');
  assert.equal(p.scope.ideal.intention.statement,foundation.intention.statement);
  assert.equal(p.scope.foundation.targetUser.value,foundation.definition.user.text);
  assert.equal(p.scope.foundation.problem.value,foundation.definition.problem.text);
  const preserved=Object.fromEntries([...p.keep,...p.park].flatMap(x=>x.paths).map(path=>[path,readFileSync(join(root,path),'utf8')]));
  const summaries:string[]=[];const commands:CommandResult[]=[];
  const reviewStops:{stageId:string;status:string;handoffBlocked:boolean}[]=[];
  const proposed=tool(root,'act-plan',p);summaries.push(String(proposed['summary']));
  const approval=tool(root,'act-approve',{expectedVersion:proposed['version'],planHash:proposed['planHash'],quote:'Synthetic founder: Approve the displayed build and first stage.'});
  tool(root,'act-pack',{expectedVersion:approval['version']});
  let failedAttemptRecorded=false;
  for(let index=0;index<p.stages.length;index++){
    const handoff=tool(root,'act-handoff');const stage=readAct(root)!.record.plan.stages[index]!;
    assert.equal((handoff['stage'] as {id:string}).id,stage.id);
    let files:Record<string,string>,execution:CommandResult;
    if(stage.kind==='groundwork'){
      execution=run(root,python,['--version']);files={'ENVIRONMENT.md':`# Verified environment\n\n${execution.command}\n${execution.output}\nNo required external dependency or existing setup was replaced.\n`};
    }else if(stage.kind==='risk'){
      if(kind==='fresh'){
        execution=run(root,python,['-c',"import json; assert json.loads('[1]') == [1]; print('JSON input works without external packages')"]);
        files={'INPUT_NOTES.md':'# M0 input decision\n\nRead a JSON file using the Python standard library. Invalid or empty requirements must not be reported as ready work. No persistence or integration is required.\n'};
      }else{
        execution=run(root,process.execPath,['--input-type=module','-e',`import assert from 'node:assert/strict'; const data=JSON.parse(${JSON.stringify(sample)}); assert.equal(data.candidates.length,2); assert.ok(data.candidates.every(x=>x.technical && x.sector && x.fundamental && x.catalyst)); console.log('Supplied shortlist notes can be read without live market data.');`]);
        files={'INPUT_NOTES.md':'# M0 input decision\n\nUse supplied dated candidate notes and keep Unknown values explicit. No live feed, distribution agreement, ranking or return prediction is assumed. Check a complete comparison and saved note at M1.\n'};
      }
    }else{
      files=kind==='fresh'?{'ready.py':readFileSync(join(assets,'fresh/ready.py'),'utf8'),'test_ready.py':readFileSync(join(assets,'fresh/test_ready.py'),'utf8'),'example.json':JSON.stringify([{client:'North',required:['Statement','Receipts'],received:['Statement']},{client:'South',required:['Statement'],received:['Statement']}],null,2)+'\n'}:
        {'compare.mjs':readFileSync(join(assets,'comparison/compare.mjs'),'utf8'),'compare.test.mjs':readFileSync(join(assets,'comparison/compare.test.mjs'),'utf8'),'example.json':sample};
      if(kind==='existing')files['compare.mjs']=files['compare.mjs']!.replace('const parse = JSON.parse;',"import { parse } from './parser.mjs';");
      for(const [path,body] of Object.entries(files)){assert.ok(stage.writes.includes(path));writeFileSync(join(root,path),body);}
      if(kind==='existing'){
        writeFileSync(join(root,'compare.mjs'),files['compare.mjs']!.replace('return { candidates, note:', 'return { candidates: [], note:'));
        const failure=run(root,process.execPath,['--test','--test-reporter=tap','compare.test.mjs']);assert.notEqual(failure.exitCode,0);assert.match(failure.output,/# fail [1-9]/);commands.push(failure);
        const receipt:StageResult={...resultFor(readAct(root)!),implementation:'partial',changes:stage.writes.map(path=>({path,kind:'created' as const})),checks:[{criterionId:'journey',label:'Actual comparison acceptance tests',command:failure.command,executed:true,exitCode:failure.exitCode,result:'failed',output:failure.output.slice(0,6000)}],gaps:['The initial implementation lost candidate details; repair it before completion.']};
        tool(root,'act-result',receipt);assert.equal(readAct(root)!.record.status,'authorized');failedAttemptRecorded=true;
        writeFileSync(join(root,'compare.mjs'),files['compare.mjs']!);
      }
      execution=kind==='fresh'?run(root,python,['-m','unittest','-v','test_ready.py']):run(root,process.execPath,['--test','--test-reporter=tap','compare.test.mjs']);
    }
    if(stage.kind!=='mvp')for(const [path,body] of Object.entries(files)){assert.ok(stage.writes.includes(path));writeFileSync(join(root,path),body);}
    commands.push(execution);assert.equal(execution.exitCode,0,execution.output);
    const runInstruction=stage.kind==='mvp'?(kind==='fresh'?displayCommand(python,['ready.py','example.json']):displayCommand(process.execPath,['compare.mjs','example.json','review.json'])):execution.command;
    const saved=readAct(root)!,receipt:StageResult={...resultFor(saved),changes:kind==='existing'?[{path:'compare.mjs',kind:'modified'}]:Object.keys(files).map(path=>({path,kind:'created'})),checks:[{criterionId:stage.checks[0]!.id,label:stage.checks[0]!.description,command:execution.command,executed:true,exitCode:execution.exitCode,result:'passed',output:execution.output.slice(0,6000)}],runInstructions:[runInstruction],gaps:[]};
    if(stage.kind!=='mvp')assert.doesNotMatch(runInstruction,/ready\.py|compare\.mjs/,'Review instructions cannot point at a not-yet-built MVP.');
    const recorded=tool(root,'act-result',receipt);summaries.push(String(recorded['summary']));
    assert.throws(()=>actHandoff(root),/not authorized/);assert.equal(readAct(root)!.record.currentStage,index);
    reviewStops.push({stageId:stage.id,status:readAct(root)!.record.status,handoffBlocked:true});
    if(index<p.stages.length-1)tool(root,'act-review',{expectedVersion:recorded['version'],decision:'continue',quote:`Synthetic founder reviewed ${stage.title}; continue to the next displayed stage only.`});
  }
  for(const [path,body] of Object.entries(preserved))assert.equal(readFileSync(join(root,path),'utf8'),body);
  const final=readAct(root)!;assert.equal(final.record.status,'awaiting_review');assert.equal(final.record.currentStage,p.stages.length-1);
  assert.deepEqual(readPrebuild(root),confirmedBefore,'Act must reuse the exact confirmed IDE dossier, including Evaluation and receipts.');
  assert.equal(final.record.receipts.at(-1)!.customerValidation,'not_established');assert.equal(final.record.receipts.at(-1)!.release,'not_released');
  return {kind,synthetic:true,host:'current Codex native file/command adapter; authored founder replies',root,
    confirmed:{intention:foundation.intention.statement,user:foundation.definition.user.text,problem:foundation.definition.problem.text,evaluation:foundation.evaluation.conclusion,actQuote:confirmation(foundation,'act')!.quote,contextHash:confirmedBefore.hash,contextUnchanged:true},
    scope:{journey:p.scope.proposal.journey,learningQuestion:p.scope.proposal.criticalUnknown,keep:p.keep,test:p.capabilities,park:p.park},reviewStops,reviews:final.record.reviews,
    stages:p.stages.map(x=>x.id),capabilities:p.capabilities.map(x=>x.name),preservedPaths:Object.keys(preserved),commands,failedAttemptRecorded,finalStatus:final.record.status,customerValidation:'not_established',release:'not_released',pack:final.record.pack,receipts:final.record.receipts,summaries,ideTranscript};
}
