import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {temporaryProject} from './helpers.js';
import {saveWorkingContext,saveEvaluationUpdate,readPrebuild,transitionIde} from '../src/application/prebuild.js';
import {evaluationRequirements,assertAct,confirmation,type IdeContext} from '../src/domain/ide.js';
import {CompletionError} from '../src/domain/completion.js';
import {learningTopics} from '../src/domain/evaluation-quality.js';
import {competitorFields} from '../src/domain/prebuild.js';
import {agreesWithPresentation} from '../src/domain/reply.js';

function draft(root:string){
 const first=saveWorkingContext(root,{expectedVersion:0,start:true,synthetic:true,conversationId:'completion_fixture_session',delta:{}});
 const changes=JSON.parse(readFileSync(new URL('../../fixtures/m3r6-evaluation/incomplete.json',import.meta.url),'utf8'));
 const saved=saveEvaluationUpdate(root,{expectedVersion:first.version,changes});
 const shown=transitionIde(root,{operation:'present-thesis',expectedVersion:saved.version}),p=(shown.context as IdeContext).ide.presentation!;
 return transitionIde(root,{operation:'confirm-thesis',expectedVersion:shown.version,presentationId:p.id,displayedText:p.text,quote:"Looks good, don't build yet.",turnId:'synthetic_foundation_review'});
}
function completion(c:IdeContext,version:number,hash:string){
 // Explicit fixture attempts. They do not claim real tool retrieval or demand.
 const review={id:'fixture-inspection',question:'Fixture inspection of supplied scope, pain, buyer, frequency, workarounds and access; unanswered facts remain unknown.',capability:'provided_sources',queryBudget:0,pageBudget:1,budgetReason:null,queries:[],inspectedSourceIds:['scenario'],stopReason:'coverage_sufficient',limitation:'Synthetic supplied-context inspection only; no interviews, payment or real demand.'};
 const noResults={id:'fixture-habitat',question:'Fixture search for repair-shop manager loan frequency and user habitats.',capability:'synthetic_fixture',queryBudget:1,pageBudget:0,budgetReason:null,queries:[{text:'synthetic repair manager loan frequency user discussion',materialFinding:false}],inspectedSourceIds:[],stopReason:'budget_reached',limitation:'Synthetic deterministic no-results attempt; not live public research.'};
 const assessments:{scope:string;topic:string;status:string;claimIds:string[];runIds:string[];reason:string;question:string}[]=learningTopics.map(topic=>({scope:'business',topic,status:['frequency','buyer','user_language'].includes(topic)?'unknown_after_search':'findings',claimIds:['c-scenario'],runIds:[topic==='user_language'?'fixture-habitat':'fixture-inspection'],reason:`Synthetic assessment of ${topic}: supplied context examined; real behavior and spending unproven.`,question:`What does the supplied scenario establish or leave unresolved about ${topic}?`}));
 const technical=c.quality!.technical.coverage.map(row=>({scope:'technical',topic:row.topic,status:row.status,claimIds:row.claimIds,runIds:row.status==='not_relevant'?[]:['fixture-inspection'],reason:row.reason,question:`How does the synthetic bounded scope affect ${row.topic}?`}));
 assessments.push(...c.evaluation.coverage.filter(row=>!learningTopics.some(t=>t===row.topic)&&!['unexamined','not_relevant'].includes(row.status)).map(row=>({...row,scope:'business',question:`What did the retained fixture attempt establish or leave unknown about ${row.topic}?`})));
 const habitat={id:'fixture-colleagues',kind:'professional',place:'Founder-reported fitting colleagues',observedClaimIds:['c-scenario'],likelyUsers:'Two colleagues described as fitting in the synthetic scenario.',relevance:'Possible observation participants; no consent or sessions claimed.',participation:{route:null,verified:false,sourceIds:['scenario']},limitation:'Relationship bias; participant consent still needed. No public recruitment permission inferred.'};
 const competitor={id:'fixture-snipe',name:'Snipe-IT fixture substitute',categories:['direct'],fields:Object.fromEntries(competitorFields.map(field=>[field,{text:null,basis:'unknown',claimIds:[]}])),tractionClaimIds:[]};
 return {operation:'review',expectedVersion:version,evidence:{research:[review,noResults]},assessments:[...assessments,...technical],changes:{competitors:[competitor],habitats:[habitat],firstUserAvenues:[habitat.id],investigation:{...c.investigation,alternatives:['direct','manual','do_nothing'].map(kind=>({kind,competitorIds:kind==='direct'?[competitor.id]:[],runIds:['fixture-inspection'],conclusion:`Synthetic ${kind} comparison; prefer the current method if logging adds friction.`})),counterevidence:'Friendly colleagues and existing alternatives do not establish demand.',decision:'Only the bounded fictional-data experiment is justified; unknown frequency, buyer and switching remain.'},redTeam:c.claims.filter(x=>x.important).map(x=>({claimId:x.id,evidence:x.statement,inference:'Fixture claim is insufficient to establish independent demand.',assumption:'The workflow may matter to the proposed user.',contradiction:'Existing methods may be sufficient.',disproof:'Fitting users do not experience the problem.',cheapestLearning:'Observe the bounded task and a concrete past incident.'}))}};
}

test('Recorded incomplete closeout exposes all material omissions together and writes nothing',t=>{
 const root=temporaryProject(t),saved=draft(root),c=saved.context as IdeContext;
 const missing=evaluationRequirements(c,true);
 for(const topic of ['frequency','buyer','workaround','technical_feasibility'])assert.ok(missing.some(x=>x.path===`coverage.${topic}`),topic);
 for(const path of ['evaluation.coverage.habitats.runIds','investigation.alternatives.direct','firstUserAvenues','quality.technical.coverage.data_apis.runIds'])assert.ok(missing.some(x=>x.path===path),path);
 assert.ok(missing.every(x=>x.owner==='crumb'));
 assert.throws(()=>transitionIde(root,{operation:'review',expectedVersion:saved.version}),error=>error instanceof CompletionError&&error.requirements.length>10);
 assert.equal(readPrebuild(root)!.hash,saved.hash);assert.throws(()=>assertAct(c));
});

test('Actual scoped host agreement records review and Act without granting excluded actions; refusal and changed basis still block',t=>{
 const root=temporaryProject(t),saved=draft(root);
 let current=transitionIde(root,{...completion(saved.context as IdeContext,saved.version,saved.hash),contextHash:saved.hash} as Parameters<typeof transitionIde>[1]);
 const quote='Yes, I authorize building exactly the local CSV handover scope and limitations you just displayed. Only synthetic local files; no sending, deployment or extra features.';
 const interpretation={meaning:'agreement' as const,explanation:'Clear assent to the displayed current statement; external actions and extra scope remain excluded.'};
 assert.equal(agreesWithPresentation(quote),false);
 for(const denied of ["Looks good, don't build yet.",'Yes, but change the buyer.','Yes; no building.','Maybe; no sending.','"Yes"; no sending.'])assert.equal(agreesWithPresentation(denied,interpretation),false,denied);
 current=transitionIde(root,{operation:'present',subject:'evaluation',expectedVersion:current.version});
 current=transitionIde(root,{operation:'confirm',expectedVersion:current.version,presentationId:(current.context as IdeContext).ide.presentation!.id,quote,turnId:'synthetic_evaluation_assent',interpretation});
 assert.throws(()=>assertAct(current.context));
 current=transitionIde(root,{operation:'present',subject:'act',expectedVersion:current.version});
 const p=(current.context as IdeContext).ide.presentation!;
 assert.throws(()=>transitionIde(root,{operation:'confirm',expectedVersion:current.version,presentationId:p.id,quote:"Looks good, don't build yet.",turnId:'synthetic_act_denial',interpretation}),/Explicit agreement/);
 current=transitionIde(root,{operation:'confirm',expectedVersion:current.version,presentationId:p.id,quote,turnId:'synthetic_scoped_act_assent',interpretation});
 assert.doesNotThrow(()=>assertAct(current.context));
 const changed=saveEvaluationUpdate(root,{expectedVersion:current.version,changes:{evaluation:{...(current.context as IdeContext).evaluation,conclusion:'Materially changed direction, not the approved evaluation.'}}});
 assert.throws(()=>assertAct(changed.context));
});

test('Supported review atomically links actual fixture attempts, completes, reads and resumes; retries are no-ops',t=>{
 const root=temporaryProject(t),saved=draft(root),request={...completion(saved.context as IdeContext,saved.version,saved.hash),contextHash:saved.hash};
 const cli=fileURLToPath(new URL('../src/cli/main.js',import.meta.url)),file=join(root,'review.json');writeFileSync(file,JSON.stringify(request));
 const result=spawnSync(process.execPath,[cli,'internal','ide',root,'--input-file',file],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 const completed=readPrebuild(root)!,c=completed.context as IdeContext;
 assert.equal(c.evaluation.status,'ready');assert.ok(c.ide.reviewBasis);assert.deepEqual(evaluationRequirements(c),[]);
 assert.equal(c.evaluation.coverage.find(x=>x.topic==='buyer')!.status,'unknown_after_search');
 assert.deepEqual(c.evaluation.coverage.find(x=>x.topic==='habitats')!.runIds,c.investigation.questions.find(x=>x.topic==='habitats')!.runIds);
 assert.equal(c.research.find(x=>x.id==='fixture-habitat')!.inspectedSourceIds.length,0);
 const repeat=transitionIde(root,request as Parameters<typeof transitionIde>[1]);assert.equal(repeat.version,completed.version);assert.equal(repeat.hash,completed.hash);
 assert.equal(c.research.filter(x=>x.id==='fixture-habitat').length,1);
 const resumed=saveWorkingContext(root,{expectedVersion:completed.version,conversationId:'completion_fresh_session',delta:{}},true);
 const dossier=spawnSync(process.execPath,[cli,'internal','dossier',root],{encoding:'utf8'});assert.equal(dossier.status,0,dossier.stderr);
 assert.deepEqual(JSON.parse(dossier.stdout).context.research,c.research);
 assert.equal((resumed.context as IdeContext).ide.reviewBasis,c.ide.reviewBasis);assert.throws(()=>assertAct(resumed.context));
 const changed={...request,changes:{...request.changes,investigation:{...request.changes.investigation,decision:'A materially changed decision.'}}};
 assert.throws(()=>transitionIde(root,changed as Parameters<typeof transitionIde>[1]),/another session/);
 const wrongProject={...request,expectedVersion:resumed.version,contextHash:'0'.repeat(64),changes:{...request.changes,investigation:{...request.changes.investigation,decision:'Another project decision.'}}};
 assert.throws(()=>transitionIde(root,wrongProject as Parameters<typeof transitionIde>[1]),/target\/basis changed/);
 const forged={...request,expectedVersion:resumed.version,contextHash:resumed.hash,assessments:request.assessments.map(x=>({...x,runIds:['fabricated-attempt']}))};
 assert.throws(()=>transitionIde(root,forged as Parameters<typeof transitionIde>[1]),/reference|retained/);
 assert.equal(readPrebuild(root)!.hash,resumed.hash);
});
