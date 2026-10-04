import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { initializeProject } from './initialize.js';
import { assertPrebuildReference, storedPrebuild } from './prebuild.js';
import { openSqlite, type SqliteConnection } from '../persistence/sqlite.js';
import { migrateAct } from '../persistence/act-store.js';
import { storedLearn } from '../persistence/learn-store.js';
import { assertBuildSession } from './session.js';
import { inspectPath, PRIVATE_DIRECTORY, resolveProjectRoot } from '../privacy/storage.js';
import { inspectArtifacts, selectedPath, selectedFileHash, sha256 } from '../privacy/artifacts.js';
import { assertAct, basis, type IdeContext } from '../domain/ide.js';
import { unique, validateActPlan, validateStageResult, type ActRecord, type ActPlan, type SavedAct, type StageReceipt } from '../domain/act.js';
import { buildPackFiles, writeBuildPack, verifyBuildPack } from './build-pack.js';

export function compactAct(s:SavedAct):object {
  const r=s.record,stage=r.plan.stages[r.currentStage]!;
  return {version:s.version,hash:s.hash,runId:r.id,planHash:r.planHash,status:r.status,stage,stopAfterStageId:r.plan.stopAfterStageId,pack:r.pack,scopeApproved:r.approval!==null,latestReceipt:r.receipts.at(-1)??null,next:r.status==='proposed'?'Show scope and obtain approval':r.status==='authorized'?'Obtain current stage handoff; edit, test and record only that stage':r.status==='awaiting_review'?'Founder reviews the result before any continuation':"Wait for the founder's decision",customerValidation:'not_established'};
}

export function stored(db: SqliteConnection): SavedAct | null {
  if (Number(db.get('PRAGMA user_version')?.['user_version']) < 3) return null;
  const row=db.get('SELECT version, body, digest, recorded_at FROM act_revisions ORDER BY version DESC LIMIT 1');
  return row ? {version:Number(row['version']),hash:String(row['digest']),recordedAt:String(row['recorded_at']),record:JSON.parse(String(row['body'])) as ActRecord} : null;
}
export function readAct(target: string): SavedAct | null {
  const root=resolveProjectRoot(target);
  if(!inspectPath(join(root,PRIVATE_DIRECTORY))) return null;
  const location=initializeProject(root),db=openSqlite(location.database,true);
  try{return stored(db);}finally{db.close();}
}
function append(db:SqliteConnection,record:ActRecord,version:number):SavedAct {
  const body=JSON.stringify(record),projectId=String(db.get('SELECT id FROM projects LIMIT 1')?.['id']),recordedAt=new Date().toISOString();
  if(Buffer.byteLength(body)>307_200) throw new Error('Act history for this run is full; preserve it and review before more work.');
  const hash=sha256(JSON.stringify({projectId,version,record}));
  db.run('INSERT INTO act_revisions VALUES (?, ?, ?, ?, ?, ?)',version,projectId,record.id,body,hash,recordedAt);
  return {version,hash,recordedAt,record};
}
function store<T>(target:string,operation:(db:SqliteConnection,root:string)=>T):T {
  const location=initializeProject(target),db=openSqlite(location.database);
  try{migrateAct(db);return db.transaction(()=>operation(db,location.projectRoot));}finally{db.close();}
}
function current(db:SqliteConnection,expectedVersion:number):SavedAct {
  const saved=stored(db);
  if(!saved || saved.version!==expectedVersion) throw new Error('Act changed in another session. Resume the current plan and stage.');
  return structuredClone(saved);
}
function context(db:SqliteConnection):IdeContext {
  const saved=storedPrebuild(db);
  if(!saved) throw new Error('Return to IDE: confirm intention, user, problem, evaluation and Act readiness first.');
  assertAct(saved.context); return saved.context;
}
function eligible(db:SqliteConnection,r:ActRecord):IdeContext {
  const c=context(db);
  // A presentation-only save can advance context.version without changing consent.
  // New proposals still require the exact current context reference; execution is
  // bound to the approved substantive Act basis and its receipt, not file changes
  // deliberately made by an authorized build stage.
  if(basis(c,'act')!==r.ideBasis || !c.ide.confirmations.some(x=>x.id===r.plan.scope.decision.confirmationId && x.basis===r.ideBasis)) throw new Error('The approved IDE foundation changed. Return to IDE and review a new scope.');
  return c;
}
function normalPath(root:string,path:string):void {
  selectedPath(root,path);
  if(path.includes('\\') || path.length>240 || path.split('/').some(x=>/[. ]$/.test(x)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(x))) throw new Error('Use canonical forward-slash project paths without Windows aliases.');
}
function paths(p:ActPlan):string[]{return [...new Set([...p.repository.inspectedPaths,...p.scope.artifacts.map(x=>x.path),...p.keep.flatMap(x=>x.paths),...p.park.flatMap(x=>x.paths),...p.stages.flatMap(x=>x.writes)])];}
function snapshot(root:string,p:ActPlan):Record<string,string|null>{return Object.fromEntries(paths(p).map(path=>{normalPath(root,path);return [path,selectedFileHash(root,path)];}));}
function expectedFiles(r:ActRecord):Record<string,string|null>{return Object.assign({},r.baseline,...r.receipts.map(x=>x.fileHashes));}
function unchanged(root:string,r:ActRecord):void {
  for(const [path,hash] of Object.entries(expectedFiles(r))) if(selectedFileHash(root,path)!==hash) throw new Error(`Selected file changed outside the recorded stage: ${path}. Review or record unfinished authorized work before continuing.`);
}

export function saveActPlan(target:string,input:unknown):SavedAct {
  return store(target,(db,root)=>{
    const c=context(db); validateActPlan(input,c); const old=stored(db);
    if(input.execution)assertBuildSession(root,input.execution.handoffHash);
    const learned=storedLearn(db)?.record;
    if(learned?.decision?.choice==='approve'){
      const destination=learned.decision.destination;
      if(destination==='define_problem'&&basis(c,'problem')===learned.foundation.bases.problem || destination==='define_user'&&basis(c,'user')===learned.foundation.bases.user || destination==='intention'&&basis(c,'intention')===learned.foundation.bases.intention || destination==='evaluate'&&basis(c,'act')===learned.ideBasis)throw new Error('Follow the approved learning decision: revise and confirm the affected IDE foundation and reassess Evaluate before a new Act scope.');
    }
    if((old?.version??0)!==input.expectedVersion) throw new Error('Act changed in another session. Resume the current plan.');
    if(old && !['proposed','stopped','cancelled'].includes(old.record.status)) throw new Error('Preserve the approved run; pause/cancel or finish it before proposing different scope.');
    assertPrebuildReference(db,input.scope);
    if(input.scope.artifacts.length) {
      const actual=inspectArtifacts(root,{paths:input.scope.artifacts.map(x=>x.path),permissionGranted:input.scope.artifactPermission.granted,permissionQuote:input.scope.artifactPermission.quote});
      if(actual.some((x,i)=>x.sha256!==input.scope.artifacts[i]!.sha256)) throw new Error('Selected repository artifacts changed before scope review.');
    }
    normalPath(root,input.packDirectory);
    if(!unique(paths(input))) throw new Error('Use one canonical spelling for each selected path across the entire plan.');
    if(paths(input).some(x=>x.toLowerCase()===input.packDirectory.toLowerCase() || x.toLowerCase().startsWith(input.packDirectory.toLowerCase()+'/'))) throw new Error('Keep build-pack files separate from customer source paths.');
    const baseline=snapshot(root,input);
    if(input.repository.inspectedPaths.some(x=>baseline[x]===null)) throw new Error('An inspected repository file must exist.');
    const id=old?.record.status==='proposed'?old.record.id:randomUUID();
    return append(db,{id,plan:structuredClone(input),planHash:sha256(JSON.stringify(input)),ideBasis:basis(c,'act'),approval:null,pack:null,currentStage:0,status:'proposed',baseline,receipts:[],reviews:[]},(old?.version??0)+1);
  });
}
function request(input:unknown,keys:string[]):Record<string,unknown>{
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(x=>!keys.includes(x))) throw new Error('Invalid Act operation.');
  const r=input as Record<string,unknown>;
  if(!Number.isSafeInteger(r['expectedVersion']) || Number(r['expectedVersion'])<1) throw new Error('Use the current Act version.');
  return r;
}
function quote(r:Record<string,unknown>):string {
  if(typeof r['quote']!=='string'||!r['quote'].trim()||r['quote'].length>2000) throw new Error('Record the actual founder decision, not assumed approval.');
  return r['quote'].trim();
}
export function approveActPlan(target:string,input:unknown):SavedAct {
  const r=request(input,['expectedVersion','planHash','quote']);const approvalQuote=quote(r);
  return store(target,(db,root)=>{
    const s=current(db,Number(r['expectedVersion']));eligible(db,s.record);
    if(s.record.status!=='proposed'||s.record.planHash!==r['planHash']) throw new Error('Approve the exact displayed plan before starting a build.');
    if(s.record.plan.execution){assertBuildSession(root,s.record.plan.execution.handoffHash);if(!s.record.pack)throw new Error('Generate and review the complete Build Pack before approval.');verifyBuildPack(root,s.record.pack);}
    unchanged(root,s.record);s.record.approval={quote:approvalQuote,recordedAt:new Date().toISOString()};s.record.status='authorized';
    return append(db,s.record,s.version+1);
  });
}
export function generateBuildPack(target:string,input:unknown):SavedAct {
  const r=request(input,['expectedVersion']);
  return store(target,(db,root)=>{
    const s=current(db,Number(r['expectedVersion'])),c=eligible(db,s.record);
    if((!s.record.approval&&!s.record.plan.execution)||s.record.status==='cancelled') throw new Error('The customer build pack requires approved scope.');
    if(s.record.plan.execution)assertBuildSession(root,s.record.plan.execution.handoffHash);
    if(s.record.pack){verifyBuildPack(root,s.record.pack);return s;}
    unchanged(root,s.record);
    const directory=`${s.record.plan.packDirectory}/${s.record.id}${s.record.plan.execution?'/revision-'+s.record.planHash.slice(0,12):''}`;
    const files=buildPackFiles(s.record,c);
    s.record.pack=writeBuildPack(root,directory,files);
    return append(db,s.record,s.version+1);
  });
}
export function actHandoff(target:string):{version:number;runId:string;stage:ActRecord['plan']['stages'][number];pack:NonNullable<ActRecord['pack']>;planHash:string;stop:string} {
  // A handoff is read-only with respect to the journal; the host performs edits.
  const s=readAct(target);if(!s)throw new Error('No approved Act plan. Return to the current IDE foundation.');
  const root=resolveProjectRoot(target),location=initializeProject(root),db=openSqlite(location.database,true);
  try{eligible(db,s.record);}finally{db.close();}
  if(s.record.status!=='authorized'||!s.record.approval||!s.record.pack)throw new Error('This stage is not authorized. Review the current result or finish the approved build pack first.');
  if(s.record.plan.execution)assertBuildSession(root,s.record.plan.execution.handoffHash,false);
  unchanged(root,s.record);verifyBuildPack(root,s.record.pack);
  return {version:s.version,runId:s.record.id,stage:s.record.plan.stages[s.record.currentStage]!,pack:s.record.pack,planHash:s.record.planHash,stop:s.record.plan.execution?.automaticStages?'Execute this authorized stage and record actual checks. The core advances only on passed exit criteria within the approved plan; stop at every declared human checkpoint. No outreach, deployment or later milestone is authorized.':'Run only this stage. Record actual changes and checks, then stop for founder review. No M3, outreach or deployment is authorized.'};
}
export function recordActStage(target:string,input:unknown):SavedAct {
  return store(target,(db,root)=>{
    if(!input||typeof input!=='object'||!('expectedVersion' in input))throw new Error('Use the current Act version.');
    const s=current(db,Number(input.expectedVersion)),r=s.record;eligible(db,r);
    if(r.plan.execution)assertBuildSession(root,r.plan.execution.handoffHash,false);
    if(r.status!=='authorized'||!r.pack)throw new Error('Only the currently authorized stage can record implementation.');
    verifyBuildPack(root,r.pack);
    const stage=r.plan.stages[r.currentStage]!;validateStageResult(input,stage);
    const expected=expectedFiles(r),now=snapshot(root,r.plan),reported=new Map(input.changes.map(x=>[x.path,x]));
    for(const [path,hash] of Object.entries(now)) {
      if(hash!==expected[path] && (!stage.writes.includes(path)||!reported.has(path))) throw new Error(`Unreported or out-of-stage change: ${path}. Preserve it and review.`);
    }
    for(const change of input.changes) {
      const before=expected[change.path],after=now[change.path];
      if(before===after || change.kind!==(after===null?'deleted':before===null?'created':'modified'))throw new Error('Recorded file change does not match the before/after files.');
    }
    if(input.implementation==='completed' && stage.kind==='mvp' && !input.changes.length && !r.receipts.some(x=>x.stageId===stage.id&&x.changes.length))throw new Error('Record actual MVP changes rather than declaring an unbuilt mock complete.');
    const receipt:StageReceipt={...structuredClone(input),id:randomUUID(),recordedAt:new Date().toISOString(),fileHashes:Object.fromEntries(input.changes.map(x=>[x.path,now[x.path]!])),customerValidation:'not_established',release:'not_released',provenance:'host_report_with_local_file_hashes'};
    r.receipts.push(receipt);
    if(input.implementation==='completed'){
      const execution=r.plan.execution,next=r.plan.stages[r.currentStage+1];
      if(execution?.automaticStages&&!execution.humanCheckpoints.includes(stage.id)&&stage.id!==r.plan.stopAfterStageId&&next){(r.automaticAdvances??=[]).push({fromStage:stage.id,toStage:next.id,receiptId:receipt.id,reason:'passed_preapproved_exit_criteria'});r.currentStage++;r.status='authorized';}
      else r.status='awaiting_review';
    }
    return append(db,r,s.version+1);
  });
}
export function reviewActStage(target:string,input:unknown):SavedAct {
  const r=request(input,['expectedVersion','decision','quote']),reviewQuote=quote(r),decision=r['decision'];
  if(!['continue','finish','pause','resume','cancel'].includes(String(decision)))throw new Error('Choose continue, finish, pause, resume or cancel.');
  return store(target,(db,root)=>{
    const s=current(db,Number(r['expectedVersion'])),a=s.record,stage=a.plan.stages[a.currentStage]!;
    if(!a.approval||['stopped','cancelled'].includes(a.status))throw new Error('This run has no active approved stage.');
    if(decision!=='cancel'&&decision!=='pause'){eligible(db,a);unchanged(root,a);if(a.pack)verifyBuildPack(root,a.pack);}
    const passed=a.receipts.findLast(x=>x.stageId===stage.id)?.implementation==='completed';
    if(decision==='continue') {
      if(a.status!=='awaiting_review'||!passed)throw new Error('Review a completed stage before authorizing the next one.');
      if(stage.id===a.plan.stopAfterStageId||a.currentStage===a.plan.stages.length-1)throw new Error('The intended stopping stage is complete. Stop here; a new scope needs new approval.');
      a.currentStage++;a.status='authorized';
    } else if(decision==='finish') {
      if(a.status!=='awaiting_review'||!passed)throw new Error('Finish only after reviewing the actual completed stage.');
      a.status='stopped';
    } else if(decision==='resume') {
      if(a.status!=='paused')throw new Error('Only a paused run can resume.');
      a.status=passed?'awaiting_review':'authorized';
    } else a.status=decision==='pause'?'paused':'cancelled';
    a.reviews.push({stageId:stage.id,decision:decision as ActRecord['reviews'][number]['decision'],quote:reviewQuote,recordedAt:new Date().toISOString()});
    return append(db,a,s.version+1);
  });
}
