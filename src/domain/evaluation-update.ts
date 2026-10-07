import { Ajv } from 'ajv';
import { ideSchema, ideTopics, extraTopics, emptyIde, type IdeContext } from './ide.js';
import { technicalTopics, emptyQuality } from './evaluation-quality.js';
import { isDeepStrictEqual } from 'node:util';

// Host evidence updates never reconstruct application-owned receipts or opening
// metadata. The complete dossier still passes the ordinary domain validators.
const fields = ['project','intention','definition','feedbackClaimIds','sources','claims','research','competitors','adjacent','habitats','firstUserAvenues','redTeam','evaluation','investigation','opportunity','quality'] as const;
export const evaluationUpdateSchema = {
  type:'object', additionalProperties:false, required:['expectedVersion'],anyOf:['changes','evidence','assessments'].map(key=>({required:[key],properties:{[key]:{}}})),
  properties:{
    expectedVersion:{type:'integer',minimum:0},
    changes:{type:'object',additionalProperties:false,minProperties:1,
      properties:Object.fromEntries(fields.map(key=>[key,(ideSchema.properties as Record<string,object>)[key]]))},
    evidence:{type:'object',additionalProperties:false,minProperties:1,properties:Object.fromEntries(['sources','claims','research'].map(key=>[key,(ideSchema.properties as Record<string,object>)[key]]))},
    assessments:{type:'array',minItems:1,maxItems:40,items:{type:'object',additionalProperties:false,required:['scope','topic','status','claimIds','runIds','reason','question'],properties:{
      scope:{enum:['business','technical']},topic:{enum:[...new Set([...ideTopics,...technicalTopics])]},status:{enum:['findings','unknown_after_search','not_relevant']},
      claimIds:{type:'array',maxItems:64,uniqueItems:true,items:{type:'string',minLength:1,maxLength:80}},runIds:{type:'array',maxItems:64,uniqueItems:true,items:{type:'string',minLength:1,maxLength:80}},reason:{type:'string',minLength:1,maxLength:1200},question:{type:'string',minLength:1,maxLength:1200},
    }}},
  },
};
const shape = new Ajv({strict:true,allErrors:true}).compile(evaluationUpdateSchema);

export function assembleEvaluationUpdate(current:IdeContext, input:unknown):IdeContext {
  if(!shape(input))throw new Error(`Invalid evaluation update: ${shape.errors?.map(e=>`${e.instancePath} ${e.message}`).join('; ')}`);
  const request=input as {expectedVersion:number;changes?:Partial<IdeContext>;evidence?:Pick<Partial<IdeContext>,'sources'|'claims'|'research'>;assessments?:{scope:'business'|'technical';topic:string;status:'findings'|'unknown_after_search'|'not_relevant';claimIds:string[];runIds:string[];reason:string;question:string}[]};
  const context={...structuredClone(current),...structuredClone(request.changes),expectedVersion:request.expectedVersion,stage:'evaluate' as const};
  const blank=emptyIde();
  // An omitted structural row is unexamined, never a finding or not-relevant.
  for(const [rows,defaults] of [[context.evaluation.coverage,blank.evaluation.coverage],[context.investigation.coverage,blank.investigation.coverage],...(context.quality?[[context.quality.technical.coverage,emptyQuality().technical.coverage]]:[])] as const)
    for(const row of defaults)if(!rows.some(x=>x.topic===row.topic))(rows as {topic:string}[]).push(structuredClone(row));
  for(const key of ['sources','claims','research'] as const)for(const entry of request.evidence?.[key]??[]){
    const existing=context[key].find(x=>x.id===entry.id);
    if(existing&&!isDeepStrictEqual(existing,entry))throw new Error(`Conflicting ${key} ID ${entry.id}. Reload current evidence; use an explicit versioned change rather than overwriting an append.`);
    if(!existing)(context[key] as {id:string}[]).push(structuredClone(entry));
  }
  const seen=new Set<string>();
  for(const assessment of request.assessments??[]){
    const key=assessment.scope+':'+assessment.topic;if(seen.has(key))throw new Error('Submit each assessed topic once.');seen.add(key);
    const {scope,question,...row}=assessment;
    const rows=scope==='technical'?context.quality?.technical.coverage:extraTopics.some(t=>t===row.topic)?context.investigation.coverage:context.evaluation.coverage;
    const old=rows?.find(x=>x.topic===row.topic);if(!old)throw new Error(`Unknown ${scope} topic ${row.topic}; use the returned schema.`);
    Object.assign(old,row);
    if(scope==='business'){
      const link={topic:row.topic as typeof ideTopics[number],runIds:[...row.runIds],relevance:question};
      const previous=context.investigation.questions.findIndex(x=>x.topic===row.topic);
      if(previous<0)context.investigation.questions.push(link);else context.investigation.questions[previous]=link;
    }
  }
  for(const claim of context.claims){
    if(claim.basis==='reported_metric'&&!claim.metric)throw new Error(`Claim ${claim.id}: reported_metric requires metric {name,value,unit,period,reportedBy}. Use public_observation only for an actual non-metric observation; do not reclassify evidence to evade this check.`);
  }
  context.brief={kind:'research',summary:`${(context.evaluation.conclusion??'Evaluation evidence updated').replace(/[.!?]+$/u,'')}. Review and build permission remain separate.`,seeing:[],matters:[],next:'Continue the current evaluation and its required review; this save is not build approval.',questions:[],choices:[]};
  return context;
}
