import type { IdeContext, AnyPrebuild } from './ide.js';
import { plain } from './conversation.js';
import { completionChecks, CompletionError } from './completion.js';

export const technicalTopics = ['data_apis','freshness_quality','access_licensing','rate_cost','integrations','complexity_latency','ai_deterministic','reliability_failures','security_privacy','vendor_build_buy'] as const;
export interface EvaluationQuality {
  technical: {
    material: boolean; summary: string; centralRisk: string;
    coverage: {topic:typeof technicalTopics[number];status:'unexamined'|'findings'|'unknown_after_search'|'not_relevant';claimIds:string[];runIds:string[];reason:string}[];
    options: {name:string;approach:string;tradeoff:string;claimIds:string[]}[];
    recommendation: {option:string;reason:string}|null;
  };
  founderFit: {edge:string;limitation:string;claimIds:string[]};
  learning: {uncertainty:'pain'|'frequency'|'workaround'|'buyer'|'switching'|'technical'|'none';reason:string;recommendation:'interviews'|'research'|'build_decision';decision?:'go'|'one_gap'|'pivot_stop';experiment?:{promise:string;capabilities:string[];cuts:string[];limitations:string;success:string;failure:string;testDate:string}};
}
const obj=(properties:Record<string,object>)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const str=(maxLength=1200)=>({type:'string',minLength:1,maxLength,pattern:'\\S'});
const refs={type:'array',items:str(80),maxItems:16,uniqueItems:true};
const learningProperties={uncertainty:{enum:['pain','frequency','workaround','buyer','switching','technical','none']},reason:str(),recommendation:{enum:['interviews','research','build_decision']},decision:{enum:['go','one_gap','pivot_stop']},experiment:obj({promise:str(500),capabilities:{type:'array',minItems:1,maxItems:3,uniqueItems:true,items:str(160)},cuts:{type:'array',minItems:1,maxItems:8,uniqueItems:true,items:str(160)},limitations:str(700),success:str(500),failure:str(500),testDate:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'}})};
export const qualitySchema=obj({
  technical:obj({material:{type:'boolean'},summary:str(700),centralRisk:str(700),coverage:{type:'array',maxItems:technicalTopics.length,items:obj({topic:{enum:technicalTopics},status:{enum:['unexamined','findings','unknown_after_search','not_relevant']},claimIds:refs,runIds:refs,reason:str()})},options:{type:'array',maxItems:3,items:obj({name:str(120),approach:str(),tradeoff:str(),claimIds:refs})},recommendation:{anyOf:[obj({option:str(120),reason:str()}),{type:'null'}]}}),
  founderFit:obj({edge:str(),limitation:str(),claimIds:refs}),
  learning:{...obj(learningProperties),required:['uncertainty','reason','recommendation']},
});
export function emptyQuality():EvaluationQuality {return {
  technical:{material:true,summary:'Technical feasibility has not been investigated yet.',centralRisk:'Unknown until the central capability and its dependencies are investigated.',coverage:technicalTopics.map(topic=>({topic,status:'unexamined',claimIds:[],runIds:[],reason:'Investigate if material; explain relevance otherwise.'})),options:[],recommendation:null},
  founderFit:{edge:'No founder advantage established yet.',limitation:'Use only reported experience, permitted repository observations and relevant evidence.',claimIds:[]},
  learning:{uncertainty:'pain',reason:'Determine the cheapest way to resolve the current important uncertainty.',recommendation:'research'},
};}

/** Existing contexts stay readable. New native evaluations use this explicit
 * source-linked contract; the core never invents research or personal facts. */
export function validateQuality(c:IdeContext,complete=false):void {
  const q=c.quality;if(!q)return;
  if(q.learning.experiment&&(q.learning.decision!=='go'||q.learning.recommendation!=='build_decision'))throw new Error('A bounded learning MVP requires an explicit GO decision, retained uncertainty and a build recommendation.');
  if(q.learning.decision&&q.learning.decision!=='go'&&q.learning.recommendation==='build_decision')throw new Error('ONE GAP or PIVOT/STOP cannot authorize a build decision.');
  const claims=new Set(c.claims.map(x=>x.id)),runs=new Set(c.research.map(x=>x.id));
  const check=(ids:string[],set:Set<string>)=>{if(ids.some(id=>!set.has(id)))throw new Error('Quality findings must reference retained claims/research.');};
  check(q.founderFit.claimIds,claims);
  for(const row of q.technical.coverage){check(row.claimIds,claims);check(row.runIds,runs);if(row.status==='findings'&&!row.claimIds.length)throw new Error('Technical findings need evidence claims.');}
  if(new Set(q.technical.coverage.map(x=>x.topic)).size!==q.technical.coverage.length)throw new Error('Technical questions must be distinct.');
  for(const option of q.technical.options)check(option.claimIds,claims);
  if(new Set(q.technical.options.map(x=>x.name)).size!==q.technical.options.length)throw new Error('Technical options need distinct names.');
  if(q.technical.recommendation&&!q.technical.options.some(x=>x.name===q.technical.recommendation!.option))throw new Error('Recommend an investigated technical option with a rationale.');
  if(!complete)return;
  const missing=qualityCompletionRequirements(c);if(missing.length)throw new CompletionError(missing);
}

export function qualityCompletionRequirements(c:IdeContext) {
  const {items,check}=completionChecks(),q=c.quality;if(!q)return items;
  check(q.technical.coverage.length===technicalTopics.length&&!q.technical.coverage.some(x=>x.status==='unexamined'),'technical_coverage','quality.technical.coverage','Investigate the material technical questions before completing Evaluate; keep researched limits explicit.');
  for(const row of q.technical.coverage){
    if(row.status==='not_relevant')continue;
    const attempted=row.runIds.some(id=>{const r=c.research.find(x=>x.id===id);return r&&r.capability!=='unavailable'&&(r.queries.length>0||r.inspectedSourceIds.length>0);});
    check(attempted,'technical_attempt',`quality.technical.coverage.${row.topic}.runIds`,`Investigate ${row.topic} rather than asking the founder to design it.`,'retain_and_link_actual_attempt');
  }
  check(!q.technical.material||(q.technical.recommendation&&!q.technical.coverage.every(x=>x.status==='not_relevant')),'technical_recommendation','quality.technical.recommendation','A material technical dependency needs investigated options and a reasoned recommendation.');
  check(c.project.entry!=='existing'||c.project.artifacts.length,'project_inspection','project.artifacts','Inspect relevant permitted repository files before concluding technical feasibility for this existing project.','inspect_permitted_project_files');
  check(q.learning.uncertainty==='none'||q.learning.uncertainty==='technical'||q.learning.recommendation!=='build_decision'||q.learning.experiment,'learning_scope','quality.learning','Recommend the useful user conversations or specify the bounded learning MVP; the founder may still choose the existing Act commitment.','bound_experiment_or_investigate');
  return items;
}

export const learningTopics=['frequency','pain','buyer','reachability','competitors','user_language','habitats','workaround','technical_feasibility'] as const;
export function boundedLearning(c:IdeContext):boolean {return c.quality?.learning.decision==='go'&&!!c.quality.learning.experiment;}

/** Route researchable questions back to the host, without asking the founder
 * to choose databases, vendors, communities or technical definitions. This
 * conservative guard supplements host reasoning; it is not a semantic model. */
export function researchableQuestion(text:string):boolean {
  if(!text.includes('?'))return false;
  if(/\b(constraint|budget|access|permission|experienced|your intent|match what you mean|comfortable|already know)\b/i.test(text))return false;
  return /\b(which|what|how|where|can you explain|tell me)\b.*\b(database|apis?|data provider|technical mechanism|implementation|technical risks?|competitors?|pricing model|communities|data sources?|code works)\b/i.test(text);
}
export function researchPlan(c:IdeContext){return {
  user:c.definition.user.text,problem:c.definition.problem.text,repository:c.project.entry==='existing'?'Inspect relevant permitted repository files before asking about code.':'No existing repository assumed.',
  owner:'Crumb researches; founder confirms intent and supplies personal constraints.',
  work:['Reuse current evidence first; refresh only material gaps or stale facts.','Compare direct, indirect, AI, manual, spreadsheet and do-nothing alternatives.','Separate user love/hate anecdotes from independently repeated themes; verify old gaps against current capabilities.','Investigate problem size/direction, urgency, consequence, necessity, frequency, buyer/payment and switching without scoring.','Assess founder experience, insight, access and sales fit; never invent an edge.','Find specific user habitats and participation limits now; mention them before Act.','Investigate material technical dependencies and recommend a feasible interpretation with rationale.','Choose direct user conversations when behavior uncertainty is cheaper to resolve that way.'],
  technicalQuestions:[...technicalTopics],qualityTemplate:c.quality??emptyQuality(),
  scopeDiscipline:'After explicit Act, prefer one useful journey and the smallest complete test; compare a manual or existing-tool option before automation. No speculative infrastructure.',
};}
export function habitatNotice(c:AnyPrebuild):string {
  const h=c.firstUserAvenues.map(id=>c.habitats.find(x=>x.id===id)).find(Boolean);
  return h?`I also found a possible first-user avenue: ${plain(h.place)}. ${plain(h.relevance).slice(0,170)} ${h.participation.verified?'Check current rules before participating.':'Participation rules/access still need checking.'} View first-user avenues is optional.`:'I will look for specific places this user already spends time; no reachable route has been established yet.';
}
export function interviewRecommendation(c:AnyPrebuild):string|null {
  const q=c.contractVersion===2?c.quality:undefined;
  const warranted=q?q.learning.recommendation==='interviews':!c.feedbackClaimIds.length&&c.evaluation.unknowns.some(x=>/pain|frequency|workaround|buyer|pay|switch|behavior/i.test(x));
  return warranted?`I'd talk with a few people like this before committing code. ${q?plain(q.learning.reason):'Desk research cannot tell us how this problem feels in their actual workflow.'} I can prepare a short guide around their last experience. You can still choose to build with that uncertainty.`:null;
}

export function evaluationHighlights(c:IdeContext):string[] {
  const clip=(s:string)=>{const text=plain(s).replace(/[.!?]+$/u,'');return text.length<=230?text:text.slice(0,227).replace(/\s+\S*$/u,'')+'…';};
  const competitor=c.competitors.find(x=>x.fields.love.text||x.fields.hate.text||x.fields.gaps.text);
  return [
    ...(competitor?[`${plain(competitor.name)}: ${clip(competitor.fields.love.text??'User praise is not established')}. Friction: ${clip(competitor.fields.hate.text??'not established')}. Possible gap: ${clip((competitor.fields.gaps.text??'not established').replace(/^possible gap:\s*/i,''))}.`]:[]),
    ...(c.quality?[`${clip(c.quality.technical.summary)} Main technical uncertainty: ${clip(c.quality.technical.centralRisk)} View technical evaluation is optional.`]:[]),
    habitatNotice(c),
  ].slice(0,3);
}
