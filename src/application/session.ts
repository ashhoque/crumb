import { readFileSync, writeFileSync, renameSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readPrebuild } from './prebuild.js';
import { initializeProject } from './initialize.js';
import { openSqlite } from '../persistence/sqlite.js';
import { selectedPath, selectedFileHash, sha256, inspectArtifacts } from '../privacy/artifacts.js';
import { inspectPath, resolveProjectRoot } from '../privacy/storage.js';
import { assertAct, basis, confirmation } from '../domain/ide.js';
import type { SavedPrebuild } from '../domain/prebuild.js';
import { conversationContext, buildTransition, CONTINUE_BUILD, type HostSurface, type SessionMode } from '../domain/session.js';
import { plain } from '../domain/conversation.js';

const manifestName='COPILOT_SESSION.json';
interface Session {format:'business-copilot-session-v1';projectId:string;mode:SessionMode;revision:number;contextHash:string;actBasis:string|null;files:Record<string,string>;inspection:{paths:string[];hashes:string[];quote:string}|null;digest:string}
const managed=['CRUMB_CONTEXT.md','CRUMB_CONTEXT.json','CRUMB_RESEARCH.json','BUILD_HANDOFF.md','BUILD_HANDOFF.json'];
function projectId(root:string):string {const p=initializeProject(root),db=openSqlite(p.database,true);try{return String(db.get('SELECT id FROM projects LIMIT 1')?.['id']);}finally{db.close();}}
function readSession(root:string):Session|null {
  const file=selectedPath(root,manifestName),info=inspectPath(file);if(!info)return null;
  if(!info.isFile()||info.size>32768)throw new Error('Preserve the unrecognized session file; choose an owned project location.');
  const s=JSON.parse(readFileSync(file,'utf8')) as Session;
  const {digest,...body}=s;
  if(s.format!=='business-copilot-session-v1'||!['conversation','build'].includes(s.mode)||sha256(JSON.stringify(body))!==digest||s.projectId!==projectId(root)||Object.keys(s.files).some(p=>!managed.includes(p)))throw new Error('Session ownership/integrity does not match this project. Preserve it and review.');
  return s;
}
function writeOwned(root:string,path:string,body:string):void {
  const file=selectedPath(root,path),temp=join(root,`COPILOT_WRITE_${randomUUID()}.tmp`);
  try{writeFileSync(temp,body,{flag:'wx'});renameSync(temp,file);}finally{if(existsSync(temp))unlinkSync(temp);}
}
function saveSession(root:string,s:Omit<Session,'digest'>):Session {const result={...s,digest:sha256(JSON.stringify(s))};writeOwned(root,manifestName,JSON.stringify(result,null,2)+'\n');return result;}
const quote=(s:string|null|undefined)=>'> '+plain(s??'Unknown; do not invent.');

/** Derived portable files contain current knowledge, not standalone permission.
 * SQLite confirmations remain authoritative. Owned outputs are hash checked. */
export function syncConversationArtifacts(target:string,saved=readPrebuild(target)):Session|null {
  if(!saved||saved.context.contractVersion!==2)return null;
  const root=resolveProjectRoot(target),c=saved.context,old=readSession(root),compact=conversationContext(saved),ready=compact.state.act_readiness==='founder_confirmed';
  const contextText=['# Current Crumb context',`Revision: ${saved.version}; mode: ${ready?'conversation, ready for build transition':'conversation'}.`,c.synthetic?'Synthetic fixture.':'Founder-supplied state; not customer validation.','## Intention',quote(c.intention.statement),'## User / buyer / problem',quote(c.definition.user.text),quote(compact.buyer),quote(c.definition.problem.text),'## Constraints',...compact.constraints.map(x=>quote(x)),'## Evaluation',quote(compact.evaluation.conclusion),'## Competitor / market learning',...compact.evaluation.competitors.map(x=>quote(`${x.name}: ${x.insight}`)),quote(compact.evaluation.marketGap),'## Habitats',...compact.habitats.map(h=>quote(`${h.place}: ${h.summary}; route verified: ${h.verifiedRoute}`)),'## Interview learning',...compact.interviewLearning.map(x=>quote(x.summary)),'## Unknowns',...compact.evaluation.unknowns.map(x=>quote(x)),'## Current agreements',JSON.stringify(compact.state),'## Relevant detail only','CRUMB_RESEARCH.json holds current deeper evidence, not the whole chat. Reuse cached research unless a material/stale/inadequate/requested refresh is needed. Preferred name: '+(compact.preferredName?.value??'not provided')+'. Conversation work still uses tokens.'].join('\n\n')+'\n';
  const detail={format:'business-copilot-research-v1',revision:saved.version,contextHash:saved.hash,synthetic:c.synthetic,claims:c.claims,sources:c.sources,competitors:c.competitors,habitats:c.habitats,firstUserAvenues:c.firstUserAvenues,firstUserCards:c.firstUserCards,discovery:c.discovery,redTeam:c.redTeam,adjacent:c.adjacent,investigation:c.investigation,quality:c.quality,feedbackClaimIds:c.feedbackClaimIds};
  const handoff={format:'business-copilot-build-handoff-v1',status:ready?'ready':'stale_or_unconfirmed',revision:saved.version,contextHash:saved.hash,projectId:projectId(root),projectReference:root,mode:'conversation',nextMode:'build',intention:c.intention.statement,user:c.definition.user.text,buyer:c.definition.buyer.text,problem:c.definition.problem.text,evaluation:c.evaluation.conclusion,selectedOpportunity:c.investigation.decision,constraints:compact.constraints,competitorInsight:compact.evaluation.competitors,marketGap:compact.evaluation.marketGap,unknowns:compact.evaluation.unknowns,evidenceReferences:[...new Set([...c.evaluation.coverage.flatMap(x=>x.claimIds),...c.feedbackClaimIds])],actConfirmation:confirmation(c,'act')??null,researchReference:'CRUMB_RESEARCH.json',continuation:CONTINUE_BUILD,executionApproved:false};
  const files:Record<string,string>={'CRUMB_CONTEXT.md':contextText,'CRUMB_CONTEXT.json':JSON.stringify(compact,null,2)+'\n','CRUMB_RESEARCH.json':JSON.stringify(detail,null,2)+'\n'};
  if(ready||old?.files['BUILD_HANDOFF.md']){
    files['BUILD_HANDOFF.json']=JSON.stringify(handoff,null,2)+'\n';
    files['BUILD_HANDOFF.md']=['# Build handoff',`Status: ${handoff.status}; revision ${saved.version}; context ${saved.hash}.`,`Project: ${root}`,'## Confirmed Intention / User / Buyer / Problem',quote(handoff.intention),quote(handoff.user),quote(handoff.buyer),quote(handoff.problem),'## Evaluation and selected opportunity',quote(handoff.evaluation),quote(handoff.selectedOpportunity),'## Competitor and market insight',...compact.evaluation.competitors.map(x=>quote(`${x.name}: ${x.insight}`)),quote(handoff.marketGap),'## Constraints and unknowns',...handoff.constraints.map(x=>quote(x)),...handoff.unknowns.map(x=>quote(x)),'## References',...handoff.evidenceReferences.map(x=>'- '+x),'CRUMB_RESEARCH.json contains deeper evidence with provenance; no transcript is required.','## Act confirmation',quote(handoff.actConfirmation?.quote),`Confirmation: ${handoff.actConfirmation?.id??'missing'}; basis ${handoff.actConfirmation?.basis??'missing'}.`,'## Continue',CONTINUE_BUILD,'Read and verify both current context and handoff against the same project before repository inspection and Build Pack creation. This file does not approve code, spending or external actions.'].join('\n\n')+'\n';
  }
  for(const [path,text]of Object.entries(files)){const actual=selectedFileHash(root,path);if(actual!==null&&actual!==old?.files[path]&&actual!==sha256(text))throw new Error(`Preserve edited or unowned ${path}. Context is saved in SQLite; resolve the file conflict and refresh the artifacts.`);}
  for(const [path,text]of Object.entries(files))if(selectedFileHash(root,path)!==sha256(text))writeOwned(root,path,text);
  const retainsBuild=ready&&old?.mode==='build'&&old.contextHash===saved.hash;
  return saveSession(root,{format:'business-copilot-session-v1',projectId:handoff.projectId,mode:retainsBuild?'build':'conversation',revision:saved.version,contextHash:saved.hash,actBasis:ready?basis(c,'act'):null,files:Object.fromEntries(Object.entries(files).map(([p,t])=>[p,sha256(t)])),inspection:retainsBuild?old.inspection:null});
}
function currentSession(target:string){const root=resolveProjectRoot(target),s=readSession(root),c=readPrebuild(root);if(!s||!c)throw new Error('Build handoff is missing. Refresh the saved conversation context and Act handoff; do not repeat discovery.');if(s.revision!==c.version||s.contextHash!==c.hash)throw new Error('Build handoff is stale. Refresh it from the current confirmed IDE revision.');for(const [path,hash]of Object.entries(s.files))if(selectedFileHash(root,path)!==hash)throw new Error(`Current ${path} changed or is missing. Restore/refresh that owned artifact before continuing.`);return {root,s,c};}
export function currentConversation(target:string){const {s}=currentSession(target);return {...JSON.parse(readFileSync(selectedPath(resolveProjectRoot(target),'CRUMB_CONTEXT.json'),'utf8')),mode:s.mode};}
export function readyToBuild(target:string,host:HostSurface):string {const {c}=currentSession(target);assertAct(c.context);return buildTransition(c.context,host);}
export function continueBuild(target:string,input:unknown){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['phrase','host','paths','permissionQuote'].includes(k)))throw new Error('Use the build continuation with the selected project and permitted repository paths.');
  const r=input as {phrase:string;host:HostSurface;paths:string[];permissionQuote:string};
  if(typeof r.phrase!=='string'||r.phrase.trim().replace(/[.!]$/,'').toLowerCase()!==CONTINUE_BUILD.toLowerCase().replace(/\.$/,''))throw new Error('Continue with the saved Build Handoff for this project.');
  if(!r.host||!['codex','chatgpt','claude','cursor','portable'].includes(r.host.host)||r.host.canExecute!==true||r.host.sharedProjectFiles!==true)throw new Error('This host has not declared execution and access to the same project files. Use the portable handoff in a capable build environment; no native integration or sync is implied.');
  const {root,s,c}=currentSession(target);assertAct(c.context);
  // Reading both documents is intentional, even though their hashes were checked.
  readFileSync(selectedPath(root,'CRUMB_CONTEXT.md'),'utf8');readFileSync(selectedPath(root,'BUILD_HANDOFF.md'),'utf8');
  const handoff=JSON.parse(readFileSync(selectedPath(root,'BUILD_HANDOFF.json'),'utf8'));
  if(handoff.status!=='ready'||handoff.contextHash!==c.hash||handoff.actConfirmation?.id!==confirmation(c.context,'act')?.id)throw new Error('The handoff lacks current explicit Act confirmation. Refresh the affected agreement.');
  if(!Array.isArray(r.paths)||typeof r.permissionQuote!=='string'||!r.permissionQuote.trim()||r.permissionQuote.length>2000)throw new Error('Select permitted repository paths and retain the actual permission quote.');
  const artifacts=r.paths.length?inspectArtifacts(root,{paths:r.paths,permissionGranted:true,permissionQuote:r.permissionQuote}):[];
  if(c.context.project.entry==='existing'&&!artifacts.length)throw new Error('Inspect relevant permitted files in the existing repository before preparing its Build Pack.');
  const {digest:_,...body}=s;const saved=saveSession(root,{...body,mode:'build',inspection:{paths:artifacts.map(x=>x.path),hashes:artifacts.map(x=>x.sha256),quote:r.permissionQuote}});
  return {mode:saved.mode,revision:c.version,handoffHash:saved.files['BUILD_HANDOFF.json']!,context:conversationContext(c),repository:artifacts,next:'Prepare all six Build Pack documents for review before any product-code changes.',executionApproved:false};
}
export function assertBuildSession(target:string,handoffHash:string,verifyInspection=true):void {const {s}=currentSession(target);if(s.mode!=='build'||s.files['BUILD_HANDOFF.json']!==handoffHash||!s.inspection)throw new Error('Continue the Crumb build in the current verified build session before preparing or executing this scope.');if(verifyInspection)for(let i=0;i<s.inspection.paths.length;i++)if(selectedFileHash(resolveProjectRoot(target),s.inspection.paths[i]!)!==s.inspection.hashes[i])throw new Error('Inspected repository changed before scope preparation. Reinspect it.');}

/** Retrieve just the saved evidence needed for a current decision. No research
 * request, network operation or full history is triggered by a lookup. */
export function conversationDetail(target:string,input:unknown){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>k!=='ids'))throw new Error('Request one to six relevant saved evidence IDs.');
  const ids=(input as {ids:unknown}).ids;
  if(!Array.isArray(ids)||ids.length<1||ids.length>6||ids.some(x=>typeof x!=='string')||new Set(ids).size!==ids.length)throw new Error('Request one to six distinct saved evidence IDs.');
  const {c}=currentSession(target);if(c.context.contractVersion!==2)throw new Error('Use current IDE context.');
  const data=c.context,items=[...data.claims,...data.sources,...data.competitors,...data.habitats,...(data.contractVersion===2?(data.firstUserCards??[]):[])];
  return {revision:c.version,items:items.filter(x=>ids.includes(x.id)),unknownIds:ids.filter(id=>!items.some(x=>x.id===id)),provenance:'Saved research; no fresh search or customer validation is implied.'};
}
