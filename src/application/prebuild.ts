import { join } from 'node:path';
import { assertFounderProject } from './project-bootstrap.js';
import { randomUUID } from 'node:crypto';
import { initializeProject, DATABASE_NAME } from './initialize.js';
import { openSqlite, type SqliteConnection } from '../persistence/sqlite.js';
import { migratePrebuild } from '../persistence/prebuild-store.js';
import { inspectPath, PRIVATE_DIRECTORY, resolveProjectRoot } from '../privacy/storage.js';
import { inspectArtifacts, sha256 } from '../privacy/artifacts.js';
import { validatePrebuild, type PrebuildContext, type SavedPrebuild } from '../domain/prebuild.js';
import type { EvaluatedActionDraft } from '../domain/contracts.js';
import { emptyIde, validateIde, upgradeContext, resumedBrief, invalidateChanges, basis, evaluationBasis, assertEvaluationComplete, presentationText, thesisBasis, thesisText, subjects, ideState, assertAct, confirmation, type AnyPrebuild, type Subject } from '../domain/ide.js';
import type { ConfirmedActionDraft } from '../domain/contracts.js';
import { nextIdeStep } from '../domain/guide.js';
import { agreesWithPresentation, type ReplyInterpretation } from '../domain/reply.js';
import { syncConversationArtifacts } from './session.js';
import { updateWorkingContext, credibleWorkingFact, type FounderWorkingContext } from '../domain/founder-intelligence.js';
import { assembleEvaluationUpdate } from '../domain/evaluation-update.js';
import { emptyQuality } from '../domain/evaluation-quality.js';

export function saveEvaluationUpdate(target:string,input:unknown):SavedPrebuild {
  const saved=readPrebuild(target);
  const current=saved?.context.contractVersion===2?saved.context:saved?upgradeContext(saved.context):{...emptyIde(),quality:emptyQuality()};
  return savePrebuild(target,assembleEvaluationUpdate(current,input));
}

export function storedPrebuild(db: SqliteConnection): SavedPrebuild | null {
  if (Number(db.get('PRAGMA user_version')?.['user_version']) < 2) return null;
  const row = db.get('SELECT version, body, digest, recorded_at FROM prebuild_revisions ORDER BY version DESC LIMIT 1');
  return row ? { version: Number(row['version']), hash: String(row['digest']), recordedAt: String(row['recorded_at']), context: JSON.parse(String(row['body'])) as PrebuildContext } : null;
}

export function readPrebuild(target: string): SavedPrebuild | null {
  const root = resolveProjectRoot(target);
  if (!inspectPath(join(root, PRIVATE_DIRECTORY))) return null;
  if (!inspectPath(join(root, PRIVATE_DIRECTORY, DATABASE_NAME))) throw new Error('Private workspace has no database; preserve it and review.');
  const location = initializeProject(root);
  if (location.foundationOnly) return null;
  const db = openSqlite(location.database, true);
  try { return storedPrebuild(db); } finally { db.close(); }
}

function savePrebuildState(target: string, input: unknown): SavedPrebuild {
  const modern = typeof input === 'object' && input !== null && 'contractVersion' in input && input.contractVersion === 2;
  if (modern) validateIde(input, true); else validatePrebuild(input);
  const data = input as AnyPrebuild;
  // Preserve the caller's object; clearing a stale document affects only the new revision.
  const context = structuredClone(data);
  const root = resolveProjectRoot(target);
  if (data.project.artifacts.length) {
    if (!data.project.permissionQuote) throw new Error('Record permission for the selected project files.');
    const artifacts = inspectArtifacts(root, { paths: data.project.artifacts.map(item => item.path), permissionGranted: true, permissionQuote: data.project.permissionQuote });
    if (artifacts.some((item, i) => item.sha256 !== data.project.artifacts[i]?.sha256)) throw new Error('Selected project files changed. Revisit the code observations before saving.');
  }
  const location = initializeProject(root);
  const db = openSqlite(location.database);
  try {
    migratePrebuild(db);
    return db.transaction(() => {
      const current = storedPrebuild(db);
      if ((current?.version ?? 0) !== data.expectedVersion) throw new Error('Pre-build context changed in another session. Resume the latest context before saving.');
      if (current?.context.contractVersion === 2 && context.contractVersion === 1) throw new Error('Cannot downgrade confirmed IDE to legacy readiness.');
      if (context.contractVersion === 2) {
        if(current?.context.contractVersion===2&&current.context.quality&&!context.quality)throw new Error('Retain the technical evaluation and learning context; revise its findings instead of dropping the quality contract.');
        if(current?.context.contractVersion===2 && (current.context.discovery?.suppressedSubjectKeys??[]).some(key=>!context.discovery?.suppressedSubjectKeys?.includes(key)))throw new Error('Preserve first-user opt-outs when refreshing discovery.');
        const previous = current?.context.contractVersion === 2 ? current.context : upgradeContext(current?.context ?? { ...data, contractVersion: 1 } as PrebuildContext);
        if (JSON.stringify(context.ide) !== JSON.stringify(previous.ide)) throw new Error('Use presentation, review and confirmation transitions; generic saves cannot manufacture founder confirmation.');
        if (current?.context.contractVersion === 2) invalidateChanges(current.context, context);
        validateIde(context);
      }
      if (current?.context.master && JSON.stringify(current.context.master) === JSON.stringify(context.master) && masterBasis(current.context) !== masterBasis(context)) context.master = null;
      return appendContext(db, context, (current?.version ?? 0) + 1);
    });
  } finally { db.close(); }
}

function masterBasis(context: AnyPrebuild): string {
  const { expectedVersion, brief, preferredName, master, ...basis } = context;
  if ('workingContext' in basis) delete basis.workingContext;
  return JSON.stringify(basis);
}

/** Host context excludes the optional dossier until it is explicitly requested. */
export function compactPrebuild(saved: SavedPrebuild): object {
  const { context: c, ...identity } = saved;
  return { ...identity, guidance: nextIdeStep(c), ...(c.contractVersion === 2 ? { ideState: ideState(c), basis: Object.fromEntries(subjects.map(s=>[s,basis(c,s)])), confirmations: c.ide.confirmations.map(({id,subject,basis})=>({id,subject,basis})), presentation: c.ide.presentation, ...(c.workingContext?{workingContext:c.workingContext}:{}) } : { historical: true }), synthetic: c.synthetic, stage: c.stage, project: c.project, preferredName: c.preferredName, intention: c.intention, definition: c.definition, feedbackClaimIds: c.feedbackClaimIds, brief: c.brief, evaluation: { status: c.evaluation.status, conclusion: c.evaluation.conclusion, promising: c.evaluation.promising, weak: c.evaluation.weak, unknowns: c.evaluation.unknowns, contradictions: c.evaluation.contradictions }, detailCounts: { sources: c.sources.length, claims: c.claims.length, competitors: c.competitors.length, habitats: c.habitats.length, adjacent: c.adjacent.length }, masterAvailable: c.master !== null || (c.contractVersion === 2 && c.ide.reviewBasis !== null) };
}

export function assertPrebuildReference(db: SqliteConnection, draft: EvaluatedActionDraft | ConfirmedActionDraft): void {
  const saved = storedPrebuild(db);
  if (!saved || saved.version !== draft.context.version || saved.hash !== draft.context.hash) throw new Error('The referenced evaluation changed. Review the latest context and scope before approval.');
  assertAct(saved.context);
  if (draft.contractVersion !== 5 || draft.decision.basis !== 'act_confirmed' || draft.decision.confirmationId !== confirmation(saved.context, 'act')?.id) throw new Error('Use a v5 action linked to the current explicit Act confirmation.');
  if (saved.context.synthetic !== draft.synthetic) throw new Error('Preserve the context’s synthetic or actual provenance in the action.');
  const intent = saved.context.intention;
  const goal = ['personal', 'bootstrapped'].includes(intent.goal) ? 'custom' : intent.goal;
  const status = intent.status === 'undecided' ? 'skipped' : intent.status;
  if (draft.ideal.intention.goal !== goal || draft.ideal.intention.status !== status || draft.ideal.intention.statement !== intent.statement) throw new Error('Carry the saved intention into the action without inventing or changing the founder’s goal.');
  if (saved.context.project.artifacts.some(contextFile => !draft.artifacts.some(file => file.path === contextFile.path && file.sha256 === contextFile.sha256))) throw new Error('Carry the context’s selected file hashes into the action so approval can detect changed code.');
  if (draft.foundation.targetUser.value !== saved.context.definition.user.text || draft.foundation.problem.value !== saved.context.definition.problem.text) throw new Error('Carry the confirmed user and problem into the action without changing them.');
}

export function exportPrebuild(target: string): object {
  const saved = readPrebuild(target);
  if (!saved) throw new Error('No pre-build context to export.');
  return { format: 'business-copilot-prebuild-export-v1', contentHash: sha256(JSON.stringify(saved.context)), context: saved.context };
}

/** Recover selected context into an empty context store; never replace old history. */
export function importPrebuild(target: string, input: unknown): SavedPrebuild {
  if (!input || typeof input !== 'object' || !('format' in input) || input.format !== 'business-copilot-prebuild-export-v1' || !('context' in input) || !('contentHash' in input) || input.contentHash !== sha256(JSON.stringify(input.context))) throw new Error('Invalid or changed pre-build export. Nothing was imported.');
  const c = input.context as AnyPrebuild;
  if (c.contractVersion === 2) validateIde(c); else validatePrebuild(c);
  if (readPrebuild(target)) throw new Error('Restore context into a project without pre-build history; existing context will not be overwritten.');
  // A portable export is knowledge, not permission for another project. Exact
  // database backup recovery retains project identity and original receipts.
  const context = c.contractVersion === 2 ? { ...c, ide: upgradeContext({ ...c, contractVersion: 1 }).ide, master: null, brief: resumedBrief() } : c;
  return savePrebuild(target, { ...context, expectedVersion: 0 });
}

function appendContext(db: SqliteConnection, context: AnyPrebuild, version: number): SavedPrebuild {
  const projectId = String(db.get('SELECT id FROM projects LIMIT 1')?.['id']);
  const body = JSON.stringify(context), recordedAt = new Date().toISOString();
  const hash = sha256(JSON.stringify({ projectId, version, context }));
  db.run('INSERT INTO prebuild_revisions VALUES (?, ?, ?, ?, ?)', version, projectId, body, hash, recordedAt);
  return { version, hash, recordedAt, context };
}

export interface IdeTransition { expectedVersion: number; operation: 'present' | 'confirm' | 'review' | 'present-thesis' | 'confirm-thesis' | 'revise-foundation'; subject?: Subject; text?: string; presentationId?: string; displayedText?: string; quote?: string; turnId?: string; interpretation?:ReplyInterpretation }
function transitionIdeState(target: string, input: unknown): SavedPrebuild {
  if (!input || typeof input !== 'object') throw new Error('Provide an IDE transition.');
  const r = input as IdeTransition;
  if (!Number.isSafeInteger(r.expectedVersion) || !['present', 'confirm', 'review', 'present-thesis', 'confirm-thesis', 'revise-foundation'].includes(r.operation) || Object.keys(r).some(k => !['expectedVersion', 'operation', 'subject', 'text', 'presentationId', 'displayedText', 'quote', 'turnId','interpretation'].includes(k))) throw new Error('Invalid IDE transition.');
  if(r.operation==='revise-foundation'&&(!r.subject||!['intention','user','problem'].includes(r.subject)||typeof r.text!=='string'||!r.text.trim()||r.text.length>2000||typeof r.quote!=='string'||!r.quote.trim()||r.quote.length>1000||typeof r.turnId!=='string'||!r.turnId.trim()||r.turnId.length>160))throw new Error('A foundation correction needs one subject, provisional text, actual founder quote and source turn.');
  if (r.operation === 'present' && (!r.subject || !subjects.includes(r.subject))) throw new Error('Choose the confirmation subject.');
  if (['confirm','confirm-thesis'].includes(r.operation) && [r.presentationId, r.quote, r.turnId].some(x => typeof x !== 'string' || !x.trim() || x.length > 2000)) throw new Error('Confirmation needs the displayed presentation, founder reply and source turn.');
  const location = initializeProject(target), db = openSqlite(location.database);
  try { return db.transaction(() => {
    const saved = storedPrebuild(db);
    if (!saved || saved.context.contractVersion !== 2) throw new Error('Save the current IDE context first; legacy findings remain drafts.');
    if (saved.version !== r.expectedVersion) throw new Error('IDE changed in another session. Resume the current presentation.');
    const c = structuredClone(saved.context); c.expectedVersion = saved.version;
    if(r.operation==='revise-foundation'){
      if(confirmation(c,'act'))throw new Error('Do not change an approved build through a conversation correction.');
        const sourceId=randomUUID(),claimId=randomUUID();
        const limitation='Founder correction of a working hypothesis; not independent customer or payment evidence.';
        c.sources.push({id:sourceId,title:`Founder correction: ${r.subject}`,url:null,kind:'founder',provenance:c.synthetic?'synthetic_fixture':'founder_report',access:'provided',retrievedOn:new Date().toISOString().slice(0,10),publishedOn:null,delivery:'provided',retainedText:r.quote!,limitation,archived:false,independenceKey:r.turnId!,affiliation:'unknown'});
        c.claims.push({id:claimId,statement:r.text!.trim(),basis:'founder_reported',sourceIds:[sourceId],supports:[],challenges:[],limitation,important:true,repetition:'not_applicable',metric:null,quote:{sourceId,text:r.quote!}});
      if(r.subject==='intention'){c.intention.statement=r.text!.trim();c.feedbackClaimIds.push(claimId);}
      else{
        c.definition[r.subject as 'user'|'problem']={text:r.text!.trim(),claimIds:[claimId],basis:'observed'};
      }
      invalidateChanges(saved.context,c);
    }
    if (r.operation === 'review') { assertEvaluationComplete(c); c.ide.reviewBasis = evaluationBasis(c); c.ide.presentation = null; }
    if (r.operation === 'present') c.ide.presentation = { id: randomUUID(), subject: r.subject!, basis: basis(c, r.subject!), text: presentationText(c, r.subject!) };
    if (r.operation === 'present-thesis') {
      // Notes become missing provisional drafts only at this explicit review boundary.
      // Preserve existing definitions and open/skipped intention; never grant receipts.
      const notes=c.workingContext;
      const objective=notes?.founder.objective;
      if(!c.intention.statement&&!['skipped','undecided'].includes(c.intention.status)&&credibleWorkingFact(objective)){
        c.intention.statement=objective.value;c.intention.status='provided';
        if(c.intention.goal==='unknown')c.intention.goal='custom';
        c.intention.advice??='Keep the first reversible test aligned with the stated objective and constraints.';
      }
      for(const [subject,key] of [['user','customer'],['problem','problem']] as const){
        const fact=notes?.project[key];
        if(!c.definition[subject].text&&credibleWorkingFact(fact)){
          const claimId=randomUUID();
          c.claims.push({id:claimId,statement:fact.value,basis:'assumption',sourceIds:[],supports:[],challenges:[],limitation:`Provisional working note attributed to ${fact.source}; not independently verified.`,important:true,repetition:'not_applicable',metric:null,quote:null});
          c.definition[subject]={text:fact.value,claimIds:[claimId],basis:'inferred'};
        }
      }
      invalidateChanges(saved.context,c);
      c.ide.presentation = {id:randomUUID(),subject:'thesis',basis:thesisBasis(c),text:thesisText(c)};
    }
    if (r.operation === 'confirm-thesis') {
      const p=c.ide.presentation;
      if(!p||p.subject!=='thesis'||p.id!==r.presentationId||p.basis!==thesisBasis(c))throw new Error('Confirm the exact current displayed thesis, not an old or unseen prompt.');
      const normalized=(text:string)=>text.normalize('NFC').trim().replace(/\s+/gu,' ');
      if(typeof r.displayedText!=='string'||r.displayedText.length>6000||normalized(r.displayedText)!==normalized(p.text))throw new Error('The text actually shown to the founder must match the recorded thesis. Present the current thesis again before requesting review.');
      if(c.ide.confirmations.some(x=>x.turnId===r.turnId))throw new Error('A founder reply cannot be reused from an earlier confirmation.');
      const quote=r.quote!.trim();
      const agreement=agreesWithPresentation(quote,r.interpretation)||/^(yes|looks good|sounds right|that works)[,.]?\s+(?:but\s+)?(?:do not|don't)\s+build\s+yet[.!]?$/i.test(quote);
      if(!agreement)throw new Error('Review the working thesis with clear agreement or a correction; this does not authorize Act.');
      for(const subject of ['intention','user','problem'] as const)c.ide.confirmations.push({id:randomUUID(),subject,basis:basis(c,subject),presentationId:p.id,presentedText:p.text,turnId:r.turnId!,quote,recordedAt:new Date().toISOString()});
      if(c.evaluation.status==='ready'){
        try{
          assertEvaluationComplete(c);
          c.ide.reviewBasis=evaluationBasis(c);
          c.ide.confirmations.push({id:randomUUID(),subject:'evaluation',basis:basis(c,'evaluation'),presentationId:p.id,presentedText:p.text,turnId:r.turnId!,quote,recordedAt:new Date().toISOString()});
        }catch{ /* Incomplete Evaluation remains unreviewed; the thesis may still confirm its foundations. */ }
      }
      c.ide.presentation=null;
    }
    if (r.operation === 'confirm') {
      const p = c.ide.presentation;
      if (!p || p.subject==='thesis' || p.id !== r.presentationId || p.basis !== basis(c, p.subject)) throw new Error('Confirm the exact current displayed statement, not an old or unseen prompt.');
      presentationText(c, p.subject);
      if (c.ide.confirmations.some(x => x.turnId === r.turnId)) throw new Error('A founder reply cannot confirm multiple statements.');
      const quote = r.quote!.trim();
      if (!agreesWithPresentation(quote,r.interpretation)) throw new Error(p.subject === 'act' ? 'Are you ready to commit this build cycle, or is there something you want to adjust first? Explicit agreement with the current commitment is still needed.' : 'Does that capture it, or is there one part you would change? I need clear agreement before recording this confirmation.');
      c.ide.confirmations.push({ id: randomUUID(), subject: p.subject, basis: p.basis, presentationId: p.id, presentedText: p.text, turnId: r.turnId!, quote, recordedAt: new Date().toISOString() });
      c.ide.presentation = null;
    }
    validateIde(c);
    return appendContext(db, c, saved.version + 1);
  }); } finally { db.close(); }
}

export function savePrebuild(target:string,input:unknown):SavedPrebuild {const saved=savePrebuildState(target,input);syncConversationArtifacts(target,saved);return saved;}
/** Conversation notes are knowledge, never confirmation or Act permission. */
export function saveWorkingContext(target:string,input:{expectedVersion:number;conversationId:string;start?:boolean;synthetic?:boolean;delta:Partial<Pick<FounderWorkingContext,'project'|'founder'|'inspected'|'opportunity'>>},allowResume=false):SavedPrebuild {
  assertFounderProject(target);
  if(!input || !Number.isInteger(input.expectedVersion) || typeof input.conversationId!=='string')throw new Error('Working context needs the current revision and conversation identifier.');
  if((input.start!==undefined&&typeof input.start!=='boolean')||(input.synthetic!==undefined&&typeof input.synthetic!=='boolean'))throw new Error('Working context start flags must be boolean.');
  const saved=readPrebuild(target);
  if(input.start){
    if(saved||input.expectedVersion!==0)throw new Error('Start working notes in an unused context folder; never replace another conversation.');
    const context=emptyIde();context.synthetic=input.synthetic??false;
    context.workingContext=updateWorkingContext(undefined,input.delta,input.conversationId);
    return savePrebuild(target,context);
  }
  if(!saved || saved.context.contractVersion!==2)throw new Error('Start a current Crumb project context before saving working notes.');
  if(saved.version!==input.expectedVersion)throw new Error('Project context changed. Resume the latest compact state.');
  if(confirmation(saved.context,'act'))throw new Error('After Act approval, do not rewrite its referenced context for working notes.');
  const current=saved.context.workingContext;
  const copied=allowResume&&current&&current.conversationId!==input.conversationId?{...current,conversationId:input.conversationId}:current;
  const next=updateWorkingContext(copied,input.delta,input.conversationId);
  const context={...saved.context,expectedVersion:saved.version,workingContext:next};
  return savePrebuild(target,context);
}
export function transitionIde(target:string,input:unknown):SavedPrebuild {const saved=transitionIdeState(target,input);syncConversationArtifacts(target,saved);return saved;}
