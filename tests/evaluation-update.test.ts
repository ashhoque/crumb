import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {temporaryProject} from './helpers.js';
import {evaluationUpdateSchema} from '../src/domain/evaluation-update.js';
import {type IdeContext,assertAct,confirmation} from '../src/domain/ide.js';
import {readPrebuild,saveEvaluationUpdate,savePrebuild,transitionIde} from '../src/application/prebuild.js';
import {agreesWithPresentation,agreesWithThesis} from '../src/domain/reply.js';
import {ideFixture,prepareIde} from './ide-fixtures.js';

test('Actual host evaluation failures remain rejected; supported update writes, reads and resumes without manufactured receipts',t=>{
 const root=temporaryProject(t),cli=fileURLToPath(new URL('../src/cli/main.js',import.meta.url));
 const run=(action:string,input?:unknown,resume=false)=>{
   const path=join(root,'request.json');if(input)writeFileSync(path,JSON.stringify(input));
   return spawnSync(process.execPath,[cli,'internal',action,root,...(input?['--input-file',path]:[]),...(resume?['--resume']:[])],{encoding:'utf8'});
 };
 const original=JSON.parse(readFileSync(new URL('../../fixtures/m3r6-evaluation/rejected.json',import.meta.url),'utf8')) as IdeContext;
 const start=run('working-context',{expectedVersion:0,conversationId:'evaluation-repro-session',start:true,synthetic:true,delta:{}});
 assert.equal(start.status,0,start.stderr);
 const initial=readPrebuild(root)!;
 const first=run('prebuild',original);
 assert.equal(first.status,1);assert.match(first.stderr,/brief\/kind/);
 original.brief.kind='research';
 const second=run('prebuild',original);
 assert.equal(second.status,1);assert.match(second.stderr,/Reported metrics/);
 assert.equal(readPrebuild(root)!.hash,initial.hash);
 const changes=Object.fromEntries(Object.keys(evaluationUpdateSchema.properties.changes.properties).filter(key=>key in original).map(key=>[key,(original as unknown as Record<string,unknown>)[key]]));
 const malformed=run('evaluation-update',{expectedVersion:1,changes});
 assert.equal(malformed.status,1);assert.match(malformed.stderr,/Claim price.*reported_metric requires/);
 const price=original.claims.find(x=>x.id==='price')!;
 price.metric={name:'Proofavo Starter list price',value:'29.90',unit:'USD/workspace',period:'month',reportedBy:'Proofavo'};
 const valid=run('evaluation-update',{expectedVersion:1,changes});
 assert.equal(valid.status,0,valid.stderr);
 const saved=readPrebuild(root)!;
 assert.equal(saved.version,2);assert.equal(saved.context.stage,'evaluate');
 const dossier=JSON.parse(run('dossier').stdout);
 assert.equal(dossier.hash,saved.hash);assert.equal(dossier.context.claims.find((x:{id:string})=>x.id==='price').metric.value,'29.90');
 assert.equal(dossier.context.ide.confirmations.length,0);assert.throws(()=>assertAct(saved.context));
 const resumed=run('working-context',{expectedVersion:2,conversationId:'evaluation-resume-session',delta:{}},true);
 assert.equal(resumed.status,0,resumed.stderr);
 const template=JSON.parse(run('template',undefined,true).stdout);
 assert.equal(template.expectedVersion,3);assert.equal(template.workingContext.conversationId,'evaluation-resume-session');
 assert.deepEqual(template.claims,saved.context.claims);
 const stale=run('evaluation-update',{expectedVersion:2,changes:{evaluation:original.evaluation}});
 assert.equal(stale.status,1);assert.match(stale.stderr,/another session/);
 const forged=run('evaluation-update',{expectedVersion:3,changes:{ide:original.ide}});
 assert.equal(forged.status,1);assert.match(forged.stderr,/additional properties/);
 assert.equal(readPrebuild(root)!.version,3);
});

test('Actual extended thesis agreement saves exact review while the same reply denies Act',t=>{
 const quote="Looks good, don't build yet. I agree with the working user, problem and evaluation you displayed. Finish the reversible preparation and show the exact local scope and limitations for my build decision.";
 assert.equal(agreesWithPresentation(quote),false);
 assert.equal(agreesWithThesis(quote),true);
 for(const denied of ["Don't build yet.","Looks good, don't build yet, but change the user.","Maybe, don't build yet.","Looks good, don't build yet unless we change the problem."])
   assert.equal(agreesWithThesis(denied),false,denied);
 const root=temporaryProject(t);savePrebuild(root,ideFixture());
 const shown=transitionIde(root,{operation:'present-thesis',expectedVersion:readPrebuild(root)!.version});
 const p=(shown.context as IdeContext).ide.presentation!;
 const request={operation:'confirm-thesis',expectedVersion:shown.version,presentationId:p.id,displayedText:p.text,quote,turnId:'actual_synthetic_extended_review'};
 const file=join(root,'confirm-thesis.json');writeFileSync(file,JSON.stringify(request));
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('../src/cli/main.js',import.meta.url)),'internal','ide',root,'--input-file',file],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const saved=readPrebuild(root)!.context as IdeContext;
 assert.ok(confirmation(saved,'evaluation'));
 assert.ok(saved.ide.confirmations.every(r=>r.quote===quote&&r.presentedText===p.text));
 assert.throws(()=>assertAct(saved));
});

test('Evaluation updates invalidate approved bases instead of carrying permission to a changed thesis',t=>{
 const root=temporaryProject(t);
 prepareIde(root,'act',ideFixture());
 const before=readPrebuild(root)!;assert.doesNotThrow(()=>assertAct(before.context));
 const c=before.context as IdeContext;
 const changed=saveEvaluationUpdate(root,{expectedVersion:before.version,changes:{definition:{...c.definition,problem:{...c.definition.problem,text:'A materially different problem that needs new founder judgment.'}}}});
 assert.throws(()=>assertAct(changed.context));
 assert.equal((changed.context as IdeContext).ide.reviewBasis,null);
 assert.equal(confirmation(changed.context as IdeContext,'act'),undefined);
 assert.equal((changed.context as IdeContext).workingContext?.conversationId,c.workingContext?.conversationId);
});
