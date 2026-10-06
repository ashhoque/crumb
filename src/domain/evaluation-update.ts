import { Ajv } from 'ajv';
import { ideSchema, type IdeContext } from './ide.js';

// Host evidence updates never reconstruct application-owned receipts or opening
// metadata. The complete dossier still passes the ordinary domain validators.
const fields = ['project','intention','definition','feedbackClaimIds','sources','claims','research','competitors','adjacent','habitats','firstUserAvenues','redTeam','evaluation','investigation','opportunity','quality'] as const;
export const evaluationUpdateSchema = {
  type:'object', additionalProperties:false, required:['expectedVersion','changes'],
  properties:{
    expectedVersion:{type:'integer',minimum:0},
    changes:{type:'object',additionalProperties:false,minProperties:1,
      properties:Object.fromEntries(fields.map(key=>[key,(ideSchema.properties as Record<string,object>)[key]]))},
  },
};
const shape = new Ajv({strict:true,allErrors:true}).compile(evaluationUpdateSchema);

export function assembleEvaluationUpdate(current:IdeContext, input:unknown):IdeContext {
  if(!shape(input))throw new Error(`Invalid evaluation update: ${shape.errors?.map(e=>`${e.instancePath} ${e.message}`).join('; ')}`);
  const request=input as {expectedVersion:number;changes:Partial<IdeContext>};
  const context={...structuredClone(current),...structuredClone(request.changes),expectedVersion:request.expectedVersion,stage:'evaluate' as const};
  for(const claim of context.claims){
    if(claim.basis==='reported_metric'&&!claim.metric)throw new Error(`Claim ${claim.id}: reported_metric requires metric {name,value,unit,period,reportedBy}. Use public_observation only for an actual non-metric observation; do not reclassify evidence to evade this check.`);
  }
  context.brief={kind:'research',summary:`${(context.evaluation.conclusion??'Evaluation evidence updated').replace(/[.!?]+$/u,'')}. Review and build permission remain separate.`,seeing:[],matters:[],next:'Continue the current evaluation and its required review; this save is not build approval.',questions:[],choices:[]};
  return context;
}
