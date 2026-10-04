import { Ajv } from 'ajv';
import type { IdeContext } from './ide.js';
import type { ActRecord } from './act.js';

export const evidenceKinds = ['opinion','reported_behavior','observed_behavior','commitment','payment','repeated_use','technical_result','outreach_sent','conversation','no_response','feature_request','unknown'] as const;
export type EvidenceKind = typeof evidenceKinds[number];
export type Destination = 'act'|'define_problem'|'define_user'|'evaluate'|'intention'|'exposure';
export const launchStyles=['one_user','manual_pilot','small_private_pilot','paid_pilot','targeted_outreach','community_post','public_release'] as const;
export interface ObservationInput {
  kind: EvidenceKind; excerpt: string; userRef: string|null; sessionRef: string|null;
  theme: string; outcome: 'positive'|'negative'|'mixed'|'unknown';
  signal: 'value'|'friction'|'low_priority'|'different_problem'|'different_user'|'intention'|'none';
}
export interface Observation extends ObservationInput { id: string; importId: string; provenance: 'synthetic_fixture'|'founder_report'; }
export interface NotesInput { expectedVersion: number; notes: string; synthetic: boolean; observations: ObservationInput[] }
export interface LaunchPack {
  who: string; problem: string; style: typeof launchStyles[number];
  routes: { habitatId:string; where:string; avenue:string|null; sourceIds:string[]; observed:string[]; inference:string; limitation:string; message:string; routeVerified:boolean }[];
  objective:string; task:string; observe:string[]; limitations:string[];
  outreach:'founder_controlled_not_sent';
}
export interface Learning {
  summary:string; destination:Destination; recommendation:string; evidenceIds:string[];
  keep:string[]; test:string[]; park:string[]; contradictions:string[]; unknowns:string[];
  themes:{theme:string;users:number;observations:number}[];
  counts:Record<EvidenceKind,number>; validation:'not_established';
}
export interface LearnRecord {
  id:string; synthetic:boolean; ideBasis:string; actRunId:string; actHash:string;
  foundation:{intention:string;user:string;problem:string;bases:Record<'intention'|'user'|'problem',string>;evaluation:string;habitats:IdeContext['habitats'];avenues:string[];research:IdeContext['research'];claims:IdeContext['claims'];sources:IdeContext['sources']};
  mvp:{journey:string;capabilities:string[];keep:ActRecord['plan']['keep'];park:ActRecord['plan']['park'];limitations:string[]};
  pack:LaunchPack; imports:{id:string;digest:string;notes:string;recordedAt:string}[]; observations:Observation[];
  learning:Learning|null; decision:{choice:'approve'|'challenge'|'pause';quote:string;destination:Destination;recordedAt:string}|null;
  status:'prepared'|'collecting'|'awaiting_decision'|'decided'|'paused';
}
export interface SavedLearn {version:number;hash:string;record:LearnRecord;recordedAt:string}
const text=(maxLength=1000)=>({type:'string',minLength:1,maxLength,pattern:'\\S'});
const obj=(properties:Record<string,object>)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const nullable=(s:object)=>({anyOf:[s,{type:'null'}]});
const pseudonym=nullable({type:'string',pattern:'^[us][0-9]{1,4}$'});
export const notesSchema=obj({expectedVersion:{type:'integer',minimum:1},notes:text(12000),synthetic:{type:'boolean'},observations:{type:'array',maxItems:40,items:obj({kind:{enum:evidenceKinds},excerpt:text(1500),userRef:pseudonym,sessionRef:pseudonym,theme:text(100),outcome:{enum:['positive','negative','mixed','unknown']},signal:{enum:['value','friction','low_priority','different_problem','different_user','intention','none']}})}});
const check=new Ajv({strict:true,allErrors:true}).compile(notesSchema);
export function validateNotes(input:unknown):asserts input is NotesInput {
  if(!check(input))throw new Error('Invalid bounded notes import. The host organizes notes; the founder need not maintain fields or IDs.');
  const data=input as unknown as NotesInput;
  for(const o of data.observations){
    if(!data.notes.includes(o.excerpt))throw new Error('Every observation must quote the supplied notes exactly. Do not invent evidence.');
    if(o.userRef!==null&&!/^u\d+$/.test(o.userRef)||o.sessionRef!==null&&!/^s\d+$/.test(o.sessionRef))throw new Error('Use pseudonymous user/session references.');
    if(['observed_behavior','repeated_use'].includes(o.kind)&&(!o.userRef||!o.sessionRef))throw new Error('Usage needs a known pseudonymous user and session; otherwise retain unknown.');
    if(['outreach_sent','no_response','technical_result','unknown','opinion','feature_request'].includes(o.kind)&&o.signal!=='none')throw new Error('Do not promote technical results, opinions, requests or outreach into observed product learning.');
    if(o.kind==='no_response'&&o.outcome!=='unknown')throw new Error('Silence remains ambiguous, not evidence of demand or no demand.');
  }
}

/** Conservative synthesis of host-classified excerpts, never a claim of independent observation. */
export function synthesize(r:LearnRecord):Learning {
  const obs=r.observations,usage=obs.filter(o=>['observed_behavior','repeated_use'].includes(o.kind));
  const has=(signal:Observation['signal'])=>usage.some(o=>o.signal===signal);
  const counts=Object.fromEntries(evidenceKinds.map(k=>[k,obs.filter(o=>o.kind===k).length])) as Record<EvidenceKind,number>;
  let destination:Destination='exposure',recommendation='Try one relevant user through the saved route and observe the core task before changing the product.',summary='We do not yet have enough observed usage to judge the core workflow.';
  if(has('intention')){destination='intention';summary='The reported experience raises a question about the business intention.';recommendation='Revisit only the affected intention with the founder, then reassess the existing evidence.';}
  else if(has('different_user')){destination='define_user';summary='The observed workflow suggests the initial user may need to change.';recommendation='Draft the narrower user from this evidence, confirm it, and return to Evaluate before Act.';}
  else if(has('different_problem')){destination='define_problem';summary='That is useful, even though it changes the problem more than the product.';recommendation='Draft the revised problem from the observed behavior, confirm it, and reassess Evaluate before Act.';}
  else if(has('low_priority')&&!has('value')){destination='evaluate';summary='The result is weaker than we hoped: the reported usage did not show a reason to change the current workflow.';recommendation='Revisit the priority of this pain and the fit of this user before changing the product.';}
  else if(has('value')||has('friction')){destination='act';summary=has('value')?'There is a useful workflow signal here; it is still early evidence, not validation.':'The strongest signal is friction in the existing workflow, not missing capabilities.';recommendation=has('friction')?'Test one clearer instruction at the observed point of hesitation, using the same core journey.':'Repeat the same core task without coaching before considering a product change.';}
  else if(counts.no_response){summary='No replies is ambiguous. It does not establish that the pain is unimportant.';recommendation='Check the saved channel norms and try one clearer task invitation or a trusted introduction before changing the product.';}
  const themes=[...new Set(obs.map(o=>o.theme))].map(theme=>({theme,users:new Set(obs.filter(o=>o.theme===theme&&o.userRef).map(o=>o.userRef)).size,observations:obs.filter(o=>o.theme===theme).length}));
  const contradictions=themes.filter(t=>obs.some(o=>o.theme===t.theme&&o.outcome==='positive')&&obs.some(o=>o.theme===t.theme&&o.outcome==='negative')).map(t=>`Conflicting reports about ${t.theme}; retain both accounts.`);
  if(has('value')&&has('low_priority'))contradictions.push('Some usage suggests value while other users saw insufficient reason to switch.');
  const unknowns=['Customer validation and market fit are not established.','Evidence is supplied by the founder/host, not independently verified.'];
  if(!usage.length)unknowns.push('Core task completion and useful outcome remain unknown.');
  if(!counts.payment)unknowns.push('No payment evidence was supplied.');
  if(counts.payment)unknowns.push('A reported payment is for that offer only; it does not establish market fit.');
  if(r.imports.some(i=>!obs.some(o=>o.importId===i.id)))unknowns.push('Some notes have not been organized into observations; review the retained notes.');
  return {summary,destination,recommendation,evidenceIds:obs.map(o=>o.id),keep:[r.mvp.journey],test:[recommendation],park:[...r.mvp.park.map(p=>p.label),...obs.filter(o=>o.kind==='feature_request').map(o=>`Request: ${o.excerpt}`)],contradictions,unknowns,themes,counts,validation:'not_established'};
}
