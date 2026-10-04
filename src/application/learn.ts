import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { initializeProject } from './initialize.js';
import { readPrebuild } from './prebuild.js';
import { readAct } from './act.js';
import { openSqlite, type SqliteConnection } from '../persistence/sqlite.js';
import { migrateLearn, storedLearn, appendLearn } from '../persistence/learn-store.js';
import { inspectPath, PRIVATE_DIRECTORY, resolveProjectRoot } from '../privacy/storage.js';
import { selectedFileHash, sha256 } from '../privacy/artifacts.js';
import { assertAct, basis } from '../domain/ide.js';
import { launchStyles, validateNotes, synthesize, type LearnRecord, type SavedLearn } from '../domain/learn.js';

export function readLearn(target:string):SavedLearn|null {
  const root=resolveProjectRoot(target);if(!inspectPath(join(root,PRIVATE_DIRECTORY)))return null;
  const location=initializeProject(root),db=openSqlite(location.database,true);
  try{return storedLearn(db);}finally{db.close();}
}
function request(input:unknown,keys:string[],minimum=1):Record<string,unknown>{
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!keys.includes(k)))throw new Error('Invalid Launch & Learn operation.');
  const r=input as Record<string,unknown>;
  if(!Number.isSafeInteger(r['expectedVersion'])||Number(r['expectedVersion'])<minimum)throw new Error('Use the current learning version.');
  return r;
}
function store(target:string,op:(db:SqliteConnection)=>SavedLearn):SavedLearn {
  const location=initializeProject(target),db=openSqlite(location.database);
  try{migrateLearn(db);return db.transaction(()=>op(db));}finally{db.close();}
}
function current(db:SqliteConnection,version:number):SavedLearn {
  const s=storedLearn(db);if(!s||s.version!==version)throw new Error('Learning changed in another session. Resume the current evidence.');return s;
}
function assertCurrent(target:string,r:LearnRecord):void {
  const c=readPrebuild(target),a=readAct(target);
  if(!c||c.context.contractVersion!==2||basis(c.context,'act')!==r.ideBasis||a?.record.id!==r.actRunId||a.hash!==r.actHash)throw new Error('The IDE foundation or reviewed build changed. Retain this launch as history and review the current context.');
  assertAct(c.context);
}
export function isLearnCurrent(target:string,s:SavedLearn):boolean {try{assertCurrent(target,s.record);return true;}catch{return false;}}
export function prepareLaunch(target:string,input:unknown):SavedLearn {
  const req=request(input,['expectedVersion','style','routeIds'],0),c=readPrebuild(target),a=readAct(target);
  if(!c||!a)throw new Error('Launch needs the confirmed IDE foundation and a founder-reviewed completed MVP.');
  assertAct(c.context);
  const r=a.record,stage=r.plan.stages[r.currentStage]!,receipt=r.receipts.findLast(x=>x.stageId===stage.id);
  if(basis(c.context,'act')!==r.ideBasis||r.status!=='stopped'||stage.kind!=='mvp'||receipt?.implementation!=='completed'||!r.reviews.some(x=>x.stageId===stage.id&&x.decision==='finish'))throw new Error('Review and finish the completed MVP before preparing its first user exposure.');
  const root=resolveProjectRoot(target),expected=Object.assign({},r.baseline,...r.receipts.map(x=>x.fileHashes)) as Record<string,string|null>;
  for(const [path,hash] of Object.entries(expected))if(selectedFileHash(root,path)!==hash)throw new Error('The reviewed MVP files changed. Review the actual build before launch preparation.');
  const ctx=c.context;
  const style=req['style']??(ctx.intention.goal==='personal'?'one_user':'small_private_pilot');
  if(!launchStyles.includes(style as typeof launchStyles[number]))throw new Error('Choose an appropriate bounded exposure style. This prepares a draft and sends nothing.');
  const routeIds=req['routeIds']??ctx.firstUserAvenues.slice(0,3);
  if(!Array.isArray(routeIds)||routeIds.length>3||new Set(routeIds).size!==routeIds.length||routeIds.some(id=>typeof id!=='string'||!ctx.firstUserAvenues.includes(id)))throw new Error('Select up to three existing first-user avenues; do not invent a route.');
  return store(target,db=>{
    const old=storedLearn(db);if((old?.version??0)!==req['expectedVersion'])throw new Error('Learning changed in another session.');
    if(old?.record.actRunId===r.id){
      if(req['style']===undefined&&req['routeIds']===undefined)return old;
      if(old.record.imports.length)throw new Error('Keep the launch attached to its collected evidence; do not rewrite the exposure after feedback.');
    }
    if(old&&old.record.actRunId!==r.id&&!['decided','paused'].includes(old.record.status))throw new Error('Review or pause the existing launch before preparing another build.');
    const routes=routeIds.map(id=>ctx.habitats.find(h=>h.id===id)!).filter(Boolean).map(h=>({habitatId:h.id,where:h.place,avenue:h.participation.route,sourceIds:[...new Set([...h.participation.sourceIds,...h.observedClaimIds.flatMap(id=>ctx.claims.find(x=>x.id===id)!.sourceIds)])],observed:h.observedClaimIds.map(id=>ctx.claims.find(x=>x.id===id)!.statement),inference:h.relevance,limitation:h.limitation+' Participation rules, timing and access must be checked before contacting anyone.',routeVerified:h.participation.verified,message:`I have an early version for ${ctx.definition.user.text}. It lets someone ${r.plan.scope.proposal.journey}. If participation here is appropriate, I would like to watch one relevant person try that task and hear where it falls short. This is an early workflow test, not a claim of proven outcomes.`}));
    const limitations=[...receipt.gaps,...r.plan.repository.constraints,'Passing software tests does not establish customer usefulness.'];
    return appendLearn(db,{id:old?.record.actRunId===r.id?old.record.id:randomUUID(),synthetic:ctx.synthetic,ideBasis:r.ideBasis,actRunId:r.id,actHash:a.hash,
      foundation:{intention:ctx.intention.statement!,user:ctx.definition.user.text!,problem:ctx.definition.problem.text!,bases:{intention:basis(ctx,'intention'),user:basis(ctx,'user'),problem:basis(ctx,'problem')},evaluation:ctx.evaluation.conclusion!,habitats:structuredClone(ctx.habitats),avenues:[...ctx.firstUserAvenues],research:structuredClone(ctx.research),claims:structuredClone(ctx.claims),sources:structuredClone(ctx.sources)},
      mvp:{journey:r.plan.scope.proposal.journey,capabilities:r.plan.capabilities.map(x=>x.name),keep:structuredClone(r.plan.keep),park:structuredClone(r.plan.park),limitations},
      pack:{who:ctx.definition.user.text!,problem:ctx.definition.problem.text!,style:style as typeof launchStyles[number],routes,objective:r.plan.scope.proposal.criticalUnknown,task:r.plan.scope.proposal.journey,observe:['Can the user start and complete this task without coaching?','Where do they hesitate or return to their existing workflow?','Do they get a useful result and choose to use it again?'],limitations,outreach:'founder_controlled_not_sent'},
      imports:[],observations:[],learning:null,decision:null,status:'prepared'},(old?.version??0)+1);
  });
}
export function importNotes(target:string,input:unknown):SavedLearn {
  validateNotes(input);
  return store(target,db=>{
    const s=current(db,input.expectedVersion),r=s.record;assertCurrent(target,r);
    if(r.status==='decided'||r.status==='paused')throw new Error('This learning decision is stopped. Review it before collecting another cycle.');
    if(r.synthetic!==input.synthetic)throw new Error('Synthetic fixture evidence cannot be mixed with actual founder evidence.');
    const digest=sha256(input.notes.trim().replace(/\r\n/g,'\n'));
    if(r.imports.some(i=>i.digest===digest))return s;
    if(r.imports.length>=30||r.observations.length+input.observations.length>200)throw new Error('This bounded pilot is full. Review its evidence before expanding.');
    const id=randomUUID();r.imports.push({id,digest,notes:input.notes,recordedAt:new Date().toISOString()});
    const seen=new Set<string>();
    for(const o of input.observations){const key=JSON.stringify(o);if(seen.has(key))continue;seen.add(key);r.observations.push({...o,id:randomUUID(),importId:id,provenance:r.synthetic?'synthetic_fixture':'founder_report'});}
    r.learning=null;r.decision=null;r.status='collecting';return appendLearn(db,r,s.version+1);
  });
}
export function summarizeLearning(target:string,input:unknown):SavedLearn {
  const req=request(input,['expectedVersion']);
  return store(target,db=>{const s=current(db,Number(req['expectedVersion']));assertCurrent(target,s.record);
    if(['decided','paused'].includes(s.record.status))throw new Error('This learning cycle is stopped; preserve the founder decision.');
    s.record.learning=synthesize(s.record);s.record.status='awaiting_decision';return appendLearn(db,s.record,s.version+1);
  });
}
export function organizeNotes(target:string,input:unknown):SavedLearn {
  const req=request(input,['expectedVersion','importId','observations']);
  return store(target,db=>{
    const s=current(db,Number(req['expectedVersion'])),r=s.record;assertCurrent(target,r);
    if(['decided','paused'].includes(r.status))throw new Error('This learning cycle is stopped.');
    const source=r.imports.find(i=>i.id===req['importId']);if(!source)throw new Error('Choose a retained notes import.');
    if(r.observations.some(o=>o.importId===source.id))throw new Error('These notes are already organized; retain corrections as another attributed report.');
    const data={expectedVersion:s.version,notes:source.notes,synthetic:r.synthetic,observations:req['observations']};validateNotes(data);
    if(r.observations.length+data.observations.length>200)throw new Error('Review this bounded pilot before expanding.');
    const unique=new Map(data.observations.map(o=>[JSON.stringify(o),o]));
    for(const o of unique.values())r.observations.push({...o,id:randomUUID(),importId:source.id,provenance:r.synthetic?'synthetic_fixture':'founder_report'});
    r.learning=null;r.decision=null;r.status='collecting';return appendLearn(db,r,s.version+1);
  });
}
export function decideLearning(target:string,input:unknown):SavedLearn {
  const req=request(input,['expectedVersion','choice','quote']);
  if(!['approve','challenge','pause','resume'].includes(String(req['choice']))||typeof req['quote']!=='string'||!req['quote'].trim()||req['quote'].length>2000)throw new Error('Record an actual founder decision: approve, challenge, pause or resume.');
  return store(target,db=>{const s=current(db,Number(req['expectedVersion'])),r=s.record;assertCurrent(target,r);
    if(req['choice']==='resume'){if(r.status!=='paused')throw new Error('Only a paused learning cycle can resume.');r.status='awaiting_decision';r.decision=null;return appendLearn(db,r,s.version+1);}
    if(r.status!=='awaiting_decision'||!r.learning)throw new Error('Show the current learning recommendation before recording a decision.');
    r.decision={choice:req['choice'] as 'approve'|'challenge'|'pause',quote:String(req['quote']),destination:r.learning.destination,recordedAt:new Date().toISOString()};
    r.status=req['choice']==='approve'?'decided':req['choice']==='pause'?'paused':'collecting';
    return appendLearn(db,r,s.version+1);
  });
}
/** Routine context deliberately omits raw notes, identities and evidence excerpts. */
export function compactLearn(s:SavedLearn):object {
  const r=s.record;return {version:s.version,hash:s.hash,synthetic:r.synthetic,status:r.status,actRunId:r.actRunId,who:r.pack.who,problem:r.pack.problem,journey:r.mvp.journey,routes:r.pack.routes.map(x=>({where:x.where,routeVerified:x.routeVerified})),importCount:r.imports.length,evidenceCount:r.observations.length,destination:r.learning?.destination??null,recommendation:r.learning?.recommendation??'Prepare one small pilot through the saved route; send nothing automatically.',decision:r.decision?{choice:r.decision.choice,destination:r.decision.destination}:null,outreach:r.pack.outreach,validation:'not_established',next:r.status==='decided'?'Stop. This decision does not authorize code, outreach or M4. Resume only the indicated IDE/Act step with its existing confirmations and scope approval.':r.status==='awaiting_decision'?'Review evidence, approve the next direction, or challenge the recommendation.':r.status==='paused'?'Wait for the founder.':'Paste what happened; organize only evidence actually supplied.'};
}
