import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { exerciseAct } from './act-integration.js';
import { readAct, reviewActStage, actHandoff, saveActPlan } from '../src/application/act.js';
import { readPrebuild, savePrebuild, transitionIde } from '../src/application/prebuild.js';
import { confirmSubject } from './ide-fixtures.js';
import { planFor } from './act-fixtures.js';
import { assertAct, confirmation, type IdeContext } from '../src/domain/ide.js';
import { prepareLaunch, importNotes, summarizeLearning, decideLearning, isLearnCurrent } from '../src/application/learn.js';
import { renderLearnSummary } from '../src/cli/learn-render.js';
import type { ObservationInput, Destination } from '../src/domain/learn.js';

const event=(excerpt:string,extra:Partial<ObservationInput>={}):ObservationInput=>({kind:'observed_behavior',excerpt,userRef:'u1',sessionRef:'s1',theme:'Core comparison',outcome:'positive',signal:'value',...extra});
export const learningScenarios:{id:string;title:string;destination:Destination;events:ObservationInput[]}[]=[
  {id:'A',title:'Positive usage',destination:'act',events:[event('u1 completed the comparison and used the saved note at the next review.'),event('u1 hesitated at the input format before completing the task.',{signal:'friction'}),event('u2 returned without prompting and completed the comparison again.',{kind:'repeated_use',userRef:'u2',sessionRef:'s2'}),event('u2 committed to another pilot session.',{kind:'commitment',userRef:'u2',sessionRef:'s2',signal:'none'})]},
  {id:'B',title:'Mixed result',destination:'act',events:[event('u1 used the comparison to identify missing information.'),event('u2 ignored the saved note and returned to the old spreadsheet.',{userRef:'u2',sessionRef:'s2',signal:'low_priority',outcome:'negative'}),event('u1 hesitated when entering the supplied facts.',{signal:'friction'}),event('u2 asked for a portfolio dashboard.',{kind:'feature_request',signal:'none',outcome:'unknown',userRef:'u2',sessionRef:'s2'})]},
  {id:'C',title:'Technically working, low-priority pain',destination:'evaluate',events:[event('The software test command passed.',{kind:'technical_result',userRef:null,sessionRef:null,signal:'none'}),event('u1 said the tool looked nice.',{kind:'opinion',signal:'none'}),event('u1 completed the task but chose the old workflow because this pain was not important enough to switch.',{outcome:'negative',signal:'low_priority'})]},
  {id:'D',title:'Different pain discovered',destination:'define_problem',events:[event('u1 skipped fresh comparisons and tried to recover the reasoning behind a previous shortlist instead.',{signal:'different_problem',outcome:'mixed'})]},
  {id:'E',title:'No outreach response',destination:'exposure',events:[event('The founder reports sending one relevant invitation.',{kind:'outreach_sent',userRef:null,sessionRef:null,signal:'none',outcome:'unknown'}),event('The founder received no reply within the reported observation window.',{kind:'no_response',userRef:null,sessionRef:null,signal:'none',outcome:'unknown'})]},
  {id:'F',title:'Stock MVP workflow usefulness, not investment performance',destination:'act',events:[event('u1 compared the supplied technical, sector, fundamental and catalyst notes and identified a missing fact.'),event('u1 hesitated at the technical-note input format.',{signal:'friction'}),event('u2 returned without coaching to compare another supplied shortlist.',{kind:'repeated_use',userRef:'u2',sessionRef:'s2'}),event('u2 requested automated discovery and winning-trade predictions.',{kind:'feature_request',signal:'none',outcome:'unknown',userRef:'u2',sessionRef:'s2'})]},
];

/** All usage/approvals are synthetic; the reused M2 builder executes real commands. */
export function exerciseLearning(root:string,id:string){
  const scenario=learningScenarios.find(s=>s.id===id)!;
  const built=exerciseAct(root,id==='F'?'stock':'existing'),a=readAct(root)!;
  const finished=reviewActStage(root,{expectedVersion:a.version,decision:'finish',quote:'Synthetic founder: I reviewed the completed MVP; prepare the first-user exposure.'});
  const confirmed=readPrebuild(root)!,beforeCode=readFileSync(join(root,'compare.mjs')),beforePark=id==='F'?null:readFileSync(join(root,'dashboard.mjs'));
  let s=prepareLaunch(root,{expectedVersion:0});const launchSummary=renderLearnSummary(s);
  assert.equal(s.record.pack.who,confirmed.context.definition.user.text);assert.equal(s.record.pack.problem,confirmed.context.definition.problem.text);
  assert.deepEqual(s.record.foundation.habitats,confirmed.context.habitats);
  assert.equal(s.record.pack.task,built.scope.journey);
  s=importNotes(root,{expectedVersion:s.version,notes:'SYNTHETIC PRODUCT TEST ONLY\n'+scenario.events.map(e=>e.excerpt).join('\n'),synthetic:true,observations:scenario.events});
  s=summarizeLearning(root,{expectedVersion:s.version});const summary=renderLearnSummary(s);
  assert.equal(s.record.learning!.destination,scenario.destination);assert.equal(s.record.learning!.validation,'not_established');assert.equal(s.record.learning!.test.length,1);
  assert.deepEqual(readPrebuild(root),confirmed);assert.deepEqual(readAct(root),finished);
  s=decideLearning(root,{expectedVersion:s.version,choice:'approve',quote:'Synthetic founder: approve this next direction for review; do not build it yet.'});
  assert.equal(s.record.status,'decided');assert.throws(()=>actHandoff(root));
  let returnLoop:object|null=null;
  if(id==='D'){
    // Use normal IDE saves and actual confirmation transitions, not a readiness shortcut.
    const old=readPrebuild(root)!,c=structuredClone(old.context) as IdeContext,oldIntention=confirmation(c,'intention')!.id,oldUser=confirmation(c,'user')!.id;
    c.expectedVersion=old.version;c.definition.problem.text='During a repeat shortlist review, the user cannot recover the prior reasoning needed to continue the decision.';
    c.sources.push({id:'m3-synthetic-session',title:'Synthetic pseudonymous product session',url:null,kind:'founder',provenance:'synthetic_fixture',access:'provided',retrievedOn:'2026-09-26',publishedOn:null,delivery:'provided',retainedText:scenario.events[0]!.excerpt,limitation:'Synthetic product test; not actual customer evidence.',archived:false,independenceKey:'synthetic-u1',affiliation:'unknown'});
    c.claims.push({id:'m3-problem-learning',statement:scenario.events[0]!.excerpt,basis:'founder_reported',sourceIds:['m3-synthetic-session'],supports:[],challenges:[],limitation:'Synthetic behavior report only; no demand claim.',important:true,repetition:'single',metric:null,quote:null});
    c.redTeam.push({claimId:'m3-problem-learning',evidence:scenario.events[0]!.excerpt,inference:'Recovering prior rationale may matter more than making another comparison.',assumption:'This may be a repeated pain rather than one unusual session.',contradiction:'One session does not disprove the original comparison problem.',disproof:'Other qualified participants may complete fresh comparisons and have no recovery difficulty.',cheapestLearning:'Observe another qualified repeat review before expanding scope.'});
    c.definition.problem.claimIds=['m3-problem-learning'];c.evaluation.contradictions.push('Synthetic usage shifted from fresh comparison to recovery of prior rationale.');
    c.investigation.decision='Reassess the existing alternatives for rationale recovery. Synthetic usage suggests this narrower problem; market demand remains unknown.';
    let revised=savePrebuild(root,c);assert.throws(()=>assertAct(revised.context));
    assert.equal(confirmation(revised.context as IdeContext,'intention')!.id,oldIntention);assert.equal(confirmation(revised.context as IdeContext,'user')!.id,oldUser);
    revised=confirmSubject(root,'problem');assert.throws(()=>assertAct(revised.context));
    revised=transitionIde(root,{expectedVersion:revised.version,operation:'review'});revised=confirmSubject(root,'evaluation');assert.throws(()=>assertAct(revised.context));
    revised=confirmSubject(root,'act');assertAct(revised.context);assert.equal(isLearnCurrent(root,s),false);
    const p=planFor(revised);p.expectedVersion=readAct(root)!.version;p.repository.inspectedPaths=['parser.mjs','dashboard.mjs'];p.keep=structuredClone(finished.record.plan.keep);p.park=structuredClone(finished.record.plan.park);p.scope.proposal.keep=p.keep.map(x=>x.label);p.scope.proposal.park=p.park.map(x=>x.label);
    p.scope.proposal.journey='Read one saved review and recover the prior rationale';p.scope.proposal.capabilities=['Read prior rationale'];p.scope.proposal.criticalUnknown='Does recovering a prior note remove repeated synthesis?';
    p.capabilities=[{...p.capabilities[0]!,name:'Read prior rationale',evidenceClaimIds:['m3-problem-learning'],learningObjective:'Test the revised rationale-recovery problem with one repeat review.'}];p.stages[0]!.capabilities=['Read prior rationale'];p.stages[0]!.goal='Test recovery of the saved rationale without adding a dashboard.';
    const proposed=saveActPlan(root,p);assert.equal(proposed.record.status,'proposed');assert.throws(()=>actHandoff(root));
    returnLoop={intentionRetained:true,userRetained:true,revisedProblem:revised.context.definition.problem.text,problemReconfirmed:true,evaluationReassessedAndConfirmed:true,explicitActReconfirmed:true,nextScope:'proposed_only',codeAuthorized:false};
  }
  assert.deepEqual(readFileSync(join(root,'compare.mjs')),beforeCode);if(beforePark)assert.deepEqual(readFileSync(join(root,'dashboard.mjs')),beforePark);
  return {id,title:scenario.title,synthetic:true,build:{kind:built.kind,stages:built.stages,commands:built.commands,capabilities:built.capabilities},confirmed:{intention:s.record.foundation.intention,user:s.record.foundation.user,problem:s.record.foundation.problem},launchPack:s.record.pack,launchSummary,observations:s.record.observations,learning:s.record.learning,summary,decision:s.record.decision,status:s.record.status,returnLoop,codeUnchangedAfterLearning:true,parkPreserved:true,messagesSentByCrumb:0,m4Started:false};
}
