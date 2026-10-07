import { createHash } from 'node:crypto';
import { Ajv } from 'ajv';
import { emptyPrebuild, prebuildSchema, validatePrebuild, prebuildReadinessRequirements, coverageTopics, type PrebuildContext } from './prebuild.js';
import { plain } from './conversation.js';
import { qualitySchema, validateQuality, boundedLearning, learningTopics, researchableQuestion, evaluationHighlights, type EvaluationQuality } from './evaluation-quality.js';
import { validateFirstUserCards, type FirstUserCard, type FirstUserDiscovery } from './first-user-discovery.js';
import { projectFactKeys, founderFactKeys, credibleWorkingFact, type WorkingFact, type FounderWorkingContext } from './founder-intelligence.js';
import { qualityCompletionRequirements } from './evaluation-quality.js';
import { completionChecks, CompletionError } from './completion.js';

export const subjects = ['intention', 'user', 'problem', 'evaluation', 'act'] as const;
export type Subject = typeof subjects[number];
export const extraTopics = ['workaround', 'willingness_to_pay', 'ability_to_pay', 'switching_cost', 'founder_insight', 'founder_expertise', 'founder_access', 'technical_feasibility', 'business_model_fit', 'intention_alignment'] as const;
export const alternativeKinds = ['direct', 'adjacent', 'incumbent', 'new_ai', 'service', 'manual', 'spreadsheet', 'generic_ai', 'do_nothing'] as const;
export const ideTopics = [...coverageTopics, ...extraTopics];
export interface Confirmation { id: string; subject: Subject; basis: string; presentationId: string; turnId: string; quote: string; recordedAt: string; presentedText: string }
export interface Presentation { id: string; subject: Subject | 'thesis'; basis: string; text: string }
export interface IdeContext extends Omit<PrebuildContext, 'contractVersion'> {
  contractVersion: 2;
  workingContext?: FounderWorkingContext;
  quality?: EvaluationQuality;
  firstUserCards?: FirstUserCard[];
  discovery?: FirstUserDiscovery;
  investigation: {
    coverage: { topic: typeof extraTopics[number]; status: 'unexamined' | 'findings' | 'unknown_after_search' | 'not_relevant'; claimIds: string[]; runIds: string[]; reason: string }[];
    questions: { topic: typeof ideTopics[number]; runIds: string[]; relevance: string }[];
    alternatives: { kind: typeof alternativeKinds[number]; competitorIds: string[]; runIds: string[]; conclusion: string }[];
    counterevidence: string | null; decision: string | null; redefinition: string | null;
  };
  opportunity: { businessModel: string; economics: string; interviewPlan: string; risks: string[] } | null;
  ide: { generations: Record<Subject, number>; confirmations: Confirmation[]; presentation: Presentation | null; reviewBasis: string | null };
}
export type AnyPrebuild = PrebuildContext | IdeContext;
export const digest = (value: unknown): string => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const obj = (properties: Record<string, object>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const str = (n = 2000) => ({ type: 'string', minLength: 1, maxLength: n, pattern: '\\S' });
const nil = (schema: object) => ({ anyOf: [schema, { type: 'null' }] });
const arr = (items: object, maxItems = 128) => ({ type: 'array', items, maxItems });
const hash = { type: 'string', pattern: '^[a-f0-9]{64}$' };
const refs = arr(str(80), 64);
const subject = { enum: subjects };
const workingFact = obj({value:str(320),status:{enum:['known','inferred','stale','unknown']},confidence:{enum:['high','medium','low']},source:nil(str(240))});
const optionalFacts = (keys:readonly string[]) => ({type:'object',properties:Object.fromEntries(keys.map(k=>[k,workingFact])),required:[],additionalProperties:false});
export const ideSchema = {
  ...structuredClone(prebuildSchema), $id: 'urn:business-copilot:prebuild:v2',
  properties: {
    ...structuredClone(prebuildSchema.properties), contractVersion: { const: 2 }, quality:qualitySchema,
    workingContext: obj({conversationId:{type:'string',pattern:'^[A-Za-z0-9_-]{8,120}$'},project:optionalFacts(projectFactKeys),founder:optionalFacts(founderFactKeys),inspected:arr(obj({path:str(240),sha256:hash}),12),opportunity:nil(obj({signal:str(300),evidenceIds:arr(str(80),6),level:{enum:['signal','hypothesis','strong','recommended_test']}}))}),
    firstUserCards: arr({ ...obj({ id: str(80), kind: { enum: ['person','community','business','event','place'] }, displayName: str(240), subjectKey: str(240), relationship: { enum: ['intended_user','buyer','expert','gatekeeper','adjacent','unknown'] }, observed: str(), fitInference: str(), uncertainty: str(), sourceIds: refs, route: nil(str(2000)), routeStatus: { enum: ['reviewed','check_rules','unavailable'] }, firsthand: { type: 'boolean' }, scopeKey:hash, usePermission:{enum:['permitted','unknown','restricted']} }), required:['id','kind','displayName','subjectKey','relationship','observed','fitInference','uncertainty','sourceIds','route','routeStatus','firsthand'] }, 3),
    discovery: { ...obj({ channels: { enum: ['online','local','both'] }, region: nil(str(240)), outcome: { enum: ['not_run','ready','partial','no_results','unavailable','declined'] }, runIds: refs, limitation: str(), suppressedSubjectKeys:refs }), required:['channels','region','outcome','runIds','limitation'] },
    investigation: obj({
      coverage: arr(obj({ topic: { enum: extraTopics }, status: { enum: ['unexamined', 'findings', 'unknown_after_search', 'not_relevant'] }, claimIds: refs, runIds: refs, reason: str() }), extraTopics.length),
      questions: arr(obj({ topic: { enum: ideTopics }, runIds: refs, relevance: str() }), ideTopics.length),
      alternatives: arr(obj({ kind: { enum: alternativeKinds }, competitorIds: refs, runIds: refs, conclusion: str() }), alternativeKinds.length),
      counterevidence: nil(str()), decision: nil(str()), redefinition: nil(str()),
    }),
    opportunity: nil(obj({ businessModel: str(), economics: str(), interviewPlan: str(), risks: arr(str(), 12) })),
    ide: obj({
      generations: obj(Object.fromEntries(subjects.map(s => [s, { type: 'integer', minimum: 0 }]))),
      confirmations: arr(obj({ id: str(80), subject, basis: hash, presentationId: str(80), turnId: str(160), quote: str(), recordedAt: str(40), presentedText: str(6000) })),
      presentation: nil(obj({ id: str(80), subject: {enum:[...subjects,'thesis']}, basis: hash, text: str(6000) })), reviewBasis: nil(hash),
    }),
  },
  required: [...prebuildSchema.required, 'investigation', 'opportunity', 'ide'],
};
const shape = new Ajv({ strict: true, allErrors: true }).compile(ideSchema);

export function upgradeContext(c: PrebuildContext): IdeContext {
  return {
    ...structuredClone(c), contractVersion: 2, master: null, buildRequest: null,
    evaluation: { ...structuredClone(c.evaluation), status: c.evaluation.status === 'ready' ? 'in_progress' : c.evaluation.status },
    brief: resumedBrief(),
    opportunity: null,
    discovery: { channels: 'online', region: null, outcome: 'not_run', runIds: [], limitation: 'No first-user discovery has been run for this context yet.' },
    investigation: { coverage: extraTopics.map(topic => ({ topic, status: 'unexamined', claimIds: [], runIds: [], reason: 'Not examined yet.' })), questions: [], alternatives: [], counterevidence: null, decision: null, redefinition: null },
    ide: { generations: { intention: 0, user: 0, problem: 0, evaluation: 0, act: 0 }, confirmations: [], presentation: null, reviewBasis: null },
  };
}
export function resumedBrief(): PrebuildContext['brief'] {
  return { kind: 'conversation', summary: 'Your earlier context and research are preserved. Let’s confirm the current intention before deciding what deserves a build cycle.', seeing: [], matters: [], next: 'Review the saved understanding and confirm the intention.', questions: [], choices: [] };
}
export function emptyIde(): IdeContext { const c = emptyPrebuild(); return { ...upgradeContext(c), brief: c.brief }; }

/** Reuse v1 evidence validation without letting v1 readiness imply consent. */
export function legacyView(c: AnyPrebuild): PrebuildContext {
  if (c.contractVersion === 1) return c;
  const { ide: _, investigation: __, opportunity: ___, quality: ____, firstUserCards: _____, discovery: ______, workingContext: _______, ...base } = c;
  return { ...base, contractVersion: 1, brief: { ...base.brief, choices: [] } };
}
function foundation(c: IdeContext, s: Subject): unknown {
  // Whitespace changes only affect presentation; wording and evidence links still
  // participate in consent. Do not lowercase or strip punctuation from meaning.
  const content = (value: unknown): unknown => typeof value === 'string' ? value.normalize('NFC').trim().replace(/\s+/gu, ' ') : Array.isArray(value) ? value.map(content) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, content(v)])) : value;
  switch (s) {
    case 'intention': return content(c.intention);
    case 'user': return content({ user: c.definition.user, buyer: c.definition.buyer });
    case 'problem': return content(Object.fromEntries(Object.entries(c.definition).filter(([key]) => !['user', 'buyer'].includes(key))));
    default: return null;
  }
}
export function evaluationBasis(c: IdeContext): string {
  const notes=thesisNotes(c);
  return digest({ foundations: subjects.slice(0, 3).map(s => basis(c, s)), synthetic: c.synthetic, project: c.project, sources: c.sources, claims: c.claims, research: c.research, evaluation: c.evaluation, investigation: c.investigation, competitors: c.competitors, adjacent: c.adjacent, habitats: c.habitats, avenues: c.firstUserAvenues, firstUserCards:c.firstUserCards, discovery:c.discovery, redTeam: c.redTeam, feedback: c.feedbackClaimIds, opportunity: c.opportunity, quality:c.quality, ...(Object.keys(notes).length?{thesisNotes:notes}:{}) });
}
/** Only notes actually used in the review participate in its evidence basis. */
function thesisNotes(c: IdeContext): Partial<Record<'decision'|'market_pulse'|'risk'|'assumptions',WorkingFact>> {
  const needed={decision:!c.investigation.decision,market_pulse:!c.evaluation.conclusion,risk:!c.investigation.counterevidence&&!c.evaluation.weak.length&&!c.evaluation.contradictions.length,assumptions:!c.evaluation.unknowns.length};
  return Object.fromEntries(Object.entries(needed).flatMap(([key,use])=>{
    const fact=c.workingContext?.project[key as keyof typeof needed];
    return use&&credibleWorkingFact(fact)?[[key,fact]]:[];
  }));
}
export function basis(c: IdeContext, s: Subject): string {
  if (s === 'evaluation') return digest({ generation: c.ide.generations.evaluation, content: evaluationBasis(c) });
  if (s === 'act') return digest({ generation: c.ide.generations.act, evaluation: basis(c, 'evaluation') });
  return digest({ generation: c.ide.generations[s], content: foundation(c, s) });
}
export function thesisBasis(c: IdeContext): string { return digest({foundations:subjects.slice(0,3).map(s=>basis(c,s)),evaluation:evaluationBasis(c)}); }
export function thesisText(c: IdeContext): string {
  if(!c.intention.statement||!c.definition.user.text||!c.definition.problem.text)throw new Error('Draft the intention, initial user and pain before presenting a working thesis.');
  const safe=(value:string)=>plain(value).replaceAll('<','&lt;').replaceAll('>','&gt;');
  const notes=thesisNotes(c);
  const note=(fact:WorkingFact)=>`${safe(fact.value)} (${fact.status==='inferred'?'Inference':'Reported'}; source: ${safe(fact.source!)}.)`;
  const text=[`**My take:** ${c.investigation.decision?safe(c.investigation.decision):notes.decision?note(notes.decision):'Keep investigating before committing.'}`,
    `**What we are building toward:** ${safe(c.intention.statement)}`,
    `**The first user:** ${safe(c.definition.user.text)}\n\n**Their pain:** ${safe(c.definition.problem.text)}`,
    ...(c.definition.buyer.text?[`**Likely buyer:** ${safe(c.definition.buyer.text)}`]:[]),
    `**Evidence so far:** ${c.evaluation.conclusion?[safe(c.evaluation.conclusion),...c.evaluation.promising.slice(0,2).map(safe)].join(' '):notes.market_pulse?`${note(notes.market_pulse)} This does not establish demand.`:'This is provisional; external evidence has not established demand.'}`,
    `**What could undo it:**\n\n${[c.investigation.counterevidence,...c.evaluation.weak,...c.evaluation.contradictions].filter((s):s is string=>!!s).map(s=>`- ${safe(s)}`).join('\n')||(notes.risk?note(notes.risk):'No specific counterevidence is captured in this review yet; do not treat that as a cleared risk.')}`,
    `**Still unknown:**\n\n${c.evaluation.unknowns.map(s=>`- ${safe(s)}`).join('\n')||(notes.assumptions?note(notes.assumptions):'Whether this pain changes real behavior and who will pay to solve it.')}`,
    ...(c.quality?[`**Technical risk:** ${safe(c.quality.technical.centralRisk)}`]:[]),
    'Does this capture the direction you agree with, including the doubts? Agreeing lets us keep investigating; it does not approve building.'].join('\n\n');
  if(text.length>6000)throw new Error('Summarize the thesis evidence and risks before presenting it; do not truncate founder review.');
  return text;
}
export function confirmation(c: IdeContext, s: Subject): Confirmation | undefined { return c.ide.confirmations.findLast(r => r.subject === s && r.basis === basis(c, s)); }
export function ideState(c: IdeContext): { intention: string; target_user: string; problem_definition: string; evaluation: string; act_readiness: string } {
  const foundationState = (s: Subject, text: string | null) => confirmation(c, s) ? 'founder_confirmed' : text ? 'drafted' : 'unknown';
  const ready = subjects.slice(0, 3).every(s => confirmation(c, s)) && c.ide.reviewBasis === evaluationBasis(c) && !c.investigation.redefinition;
  const reviewed = ready && !!confirmation(c, 'evaluation');
  return {
    intention: foundationState('intention', c.intention.statement), target_user: foundationState('user', c.definition.user.text), problem_definition: foundationState('problem', c.definition.problem.text),
    evaluation: c.investigation.redefinition ? 'requires_redefinition' : reviewed ? 'founder_reviewed' : ready ? 'reviewed' : c.evaluation.status === 'not_started' ? 'not_started' : 'researching',
    act_readiness: !reviewed ? 'not_ready' : confirmation(c, 'act') ? 'founder_confirmed' : 'ready_for_confirmation',
  };
}
export function assertAct(c: AnyPrebuild): asserts c is IdeContext {
  if (c.contractVersion !== 2) throw new Error('Complete confirmed IDE and explicit Act confirmation; legacy readiness is historical.');
  if(c.quality?.learning.decision&&c.quality.learning.decision!=='go')throw new Error('Act is locked: resolve ONE GAP or PIVOT/STOP before a GO commitment.');
  const state = ideState(c);
  for (const key of ['intention', 'target_user', 'problem_definition'] as const) if (state[key] !== 'founder_confirmed') throw new Error(`Act is locked: founder-confirmed ${key} is required.`);
  if (state.evaluation !== 'founder_reviewed') throw new Error('Act is locked: founder-reviewed evaluation is required.');
  if (state.act_readiness !== 'founder_confirmed') throw new Error('Act is locked: explicitly choose Yes — move to Act on the current commitment summary.');
}
export function invalidateChanges(current: IdeContext, next: IdeContext): void {
  let first = subjects.slice(0, 3).findIndex(s => digest(foundation(current, s)) !== digest(foundation(next, s)));
  if (current.synthetic !== next.synthetic || digest(current.project) !== digest(next.project)) first = 0;
  if (next.investigation.redefinition && next.investigation.redefinition !== current.investigation.redefinition) first = first < 0 ? 1 : Math.min(first, 1);
  if (first < 0 && evaluationBasis(current) !== evaluationBasis(next)) first = 3;
  if (first < 0) return;
  for (const s of subjects.slice(first)) next.ide.generations[s]++;
  next.ide.reviewBasis = null;
  if (next.ide.presentation && (next.ide.presentation.subject==='thesis'?first<=3:subjects.indexOf(next.ide.presentation.subject)>=first)) next.ide.presentation = null;
  next.master = null;
  next.brief.choices = next.brief.choices.filter(x => !['shape_mvp', 'build_requested', 'interview', 'master'].includes(x.action));
}

export function validateIde(input: unknown, pendingChange = false): asserts input is IdeContext {
  if (Buffer.byteLength(JSON.stringify(input) ?? '') > 307_200) throw new Error('Keep IDE context below 300 KiB.');
  if (!shape(input)) throw new Error(`Invalid IDE context: ${shape.errors?.slice(0, 4).map(e => `${e.instancePath} ${e.message}`).join('; ')}`);
  const c = input as unknown as IdeContext;
  validatePrebuild(legacyView(c),{bounded:boundedLearning(c),negative:c.quality?.learning.decision==='pivot_stop'||c.quality?.learning.decision==='one_gap',provisionalMaster:true});
  validateQuality(c);
  validateFirstUserCards(c);
  if (c.workingContext && (JSON.stringify(c.workingContext).length>6500 || Object.values({...c.workingContext.project,...c.workingContext.founder}).some(f=>f?.status==='inferred'&&f.confidence==='high') || c.workingContext.inspected.some(x=>/(^|[\\/])(?:\.git|\.customer-evidence|\.env)(?:[\\/]|$)/i.test(x.path)))) throw new Error('Working context must stay compact, confidence-aware and free of private paths.');
  if([c.brief.next,...c.brief.questions].some(researchableQuestion))throw new Error('Crumb should investigate that first and propose a reasoned option; ask the founder only about intent or meaningful constraints.');
  if (c.buildRequest !== null) throw new Error('An early build request cannot bypass confirmed IDE.');
  const byTurn=new Map<string,Confirmation[]>();for(const receipt of c.ide.confirmations)byTurn.set(receipt.turnId,[...(byTurn.get(receipt.turnId)??[]),receipt]);
  if ([...byTurn.values()].some(group=>group.length>1&&(![3,4].includes(group.length)||new Set(group.map(r=>r.subject)).size!==group.length||!['intention','user','problem',...(group.length===4?['evaluation']:[])].every(s=>group.some(r=>r.subject===s))||new Set(group.map(r=>r.presentationId)).size!==1||new Set(group.map(r=>r.presentedText)).size!==1||new Set(group.map(r=>r.quote)).size!==1)) || new Set(c.ide.confirmations.map(r => r.id)).size !== c.ide.confirmations.length) throw new Error('Confirmation replies and receipt identities cannot be reused outside one displayed thesis.');
  if (c.ide.confirmations.some(r => !Number.isFinite(Date.parse(r.recordedAt)))) throw new Error('Confirmation receipts need valid times.');
  if (!pendingChange && c.brief.choices.some(x => x.action === 'build_requested')) assertAct(c);
  const claims = new Set(c.claims.map(x => x.id)), runs = new Set(c.research.map(x => x.id)), alternatives = new Set(c.competitors.map(x => x.id));
  const checkRefs = (ids: string[], known: Set<string>) => { if (new Set(ids).size !== ids.length || ids.some(id => !known.has(id))) throw new Error('IDE investigation references must be unique and present.'); };
  for (const item of c.investigation.coverage) { checkRefs(item.claimIds, claims); checkRefs(item.runIds, runs); if (item.status === 'findings' && !item.claimIds.length) throw new Error('Coverage findings need claims.'); }
  for (const item of c.investigation.questions) checkRefs(item.runIds, runs);
  for (const item of c.investigation.alternatives) { checkRefs(item.runIds, runs); checkRefs(item.competitorIds, alternatives); }
  for (const items of [c.investigation.coverage.map(x => x.topic), c.investigation.questions.map(x => x.topic), c.investigation.alternatives.map(x => x.kind)]) if (new Set(items).size !== items.length) throw new Error('Investigation topics and alternative categories must be unique.');
}

export function assertEvaluationComplete(c: IdeContext): void {
  const missing=evaluationRequirements(c);if(missing.length)throw new CompletionError(missing);
}

export function evaluationRequirements(c:IdeContext,prospective=false) {
  const {items,check}=completionChecks();
  check(subjects.slice(0,3).every(s=>confirmation(c,s)),'foundation_review','ide.confirmations','Confirm Intention, User and Problem before completing Evaluation.','present_and_confirm_exact_thesis','founder');
  check(!c.investigation.redefinition,'redefinition','investigation.redefinition','Resolve redefinition and reconfirm affected foundations before reviewing Evaluation.','present_corrected_thesis','founder');
  check(prospective||c.evaluation.status==='ready','ready_status','evaluation.status','Finish meaningful Evaluate before founder review.','submit_complete_review');
  try{validateIde({...c,evaluation:{...c.evaluation,status:'limited'}},true);}catch(error){
    check(false,'draft_integrity','context',error instanceof Error?error.message:'Invalid retained context.','repair_submitted_evidence');return items;
  }
  const bounded=boundedLearning(c),negative=c.quality?.learning.decision==='pivot_stop'||c.quality?.learning.decision==='one_gap';
  items.push(...prebuildReadinessRequirements(legacyView(c),{bounded,negative}),...qualityCompletionRequirements(c));
  const all = [...c.evaluation.coverage, ...c.investigation.coverage];
  check(all.length===ideTopics.length,'topic_set','investigation.coverage','Investigate the decision-relevant IDE dimensions; unknowns need relevant attempts.');
  for(const topic of ideTopics){
    const row=all.find(x=>x.topic===topic),material=!bounded||learningTopics.some(t=>t===topic);
    check(row&&(row.status!=='unexamined'||!material),'unexamined',`coverage.${topic}`,'Investigate the decision-relevant IDE dimensions; unknowns need relevant attempts.',material?'research_or_inspect_provided_sources':'initialize_unexamined_row');
  }
  const attempted = (ids: string[]) => ids.some(id => { const r = c.research.find(x => x.id === id); return r && r.capability !== 'unavailable' && (r.queries.length > 0 || r.inspectedSourceIds.length > 0); });
  for (const item of all) {
    if(bounded&&item.status==='unexamined')continue;
    if (item.status === 'not_relevant') continue;
    const question = c.investigation.questions.find(q => q.topic === item.topic);
    check(question&&attempted(question.runIds)&&question.runIds.some(id=>item.runIds.includes(id)),'topic_attempt',`investigation.questions.${item.topic}`,`A relevant research question and attempt are required for ${item.topic}.`,'retain_and_link_actual_attempt');
  }
  const requiredAlternatives=bounded?['direct','manual','do_nothing']:alternativeKinds;
  for(const kind of requiredAlternatives)check(c.investigation.alternatives.some(x=>x.kind===kind&&attempted(x.runIds)),'alternative',`investigation.alternatives.${kind}`,'Investigate the competing product, manual and do-nothing alternatives; full builds require every alternative category.','inspect_alternative');
  check(c.investigation.counterevidence&&c.investigation.decision,'decision','investigation','Evaluation needs counterevidence, a decision synthesis and challenges to important claims.','retain_analysis');
  for(const claim of c.claims.filter(x=>x.important))check(c.redTeam.some(r=>r.claimId===claim.id),'challenge',`redTeam.${claim.id}`,'Evaluation needs counterevidence, a decision synthesis and challenges to important claims.','pressure_test_claim');
  check(negative||(c.firstUserAvenues.length&&c.evaluation.promising.length>=(bounded?1:2)),'first_users','firstUserAvenues','Retain credible user avenues and qualified reasons for the decision.','retain_reachable_route_and_decision');
  return items;
}

export function presentationText(c: IdeContext, s: Subject): string {
  const clean = (value: string) => plain(value).replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const text = (value: string | null) => clean(value ?? 'Unknown');
  if (s === 'intention') {
    if (!c.intention.statement) throw new Error('Draft the intention before asking for confirmation.');
    return `I think you're aiming to ${text(c.intention.statement)}\n\nIs that the intention you want me to optimize around?`;
  }
  if (!confirmation(c, 'intention')) throw new Error('Confirm the intention first.');
  if (s === 'user') {
    if (!c.definition.user.text) throw new Error('Draft a specific user before asking for confirmation.');
    return `The first user I'd focus on is ${text(c.definition.user.text)}${c.definition.buyer.text ? `, with ${text(c.definition.buyer.text)} as the buyer` : ''}.\n\nIs this the user you actually want to focus on first?`;
  }
  if (!confirmation(c, 'user')) throw new Error('Confirm the target user first.');
  if (s === 'problem') {
    if (!c.definition.problem.text) throw new Error('Draft the problem before asking for confirmation.');
    return `The pain I'm hearing is ${text(c.definition.problem.text)}\n\nIs this the exact pain you want us to solve?`;
  }
  if (!confirmation(c, 'problem')) throw new Error('Confirm the problem first.');
  if (c.ide.reviewBasis !== evaluationBasis(c)) throw new Error('Finish and review the current evaluation first.');
  if (s === 'evaluation') return [text(c.evaluation.conclusion), '', ...evaluationHighlights(c).map(x=>clean(x)), '', c.evaluation.unknowns[0] ? `The main thing still uncertain is ${clean(c.evaluation.unknowns[0])}.` : '', '', 'Does that fairly capture what we learned and the uncertainty we are carrying?'].filter(Boolean).join('\n\n');
  if (!confirmation(c, 'evaluation')) throw new Error('The founder must review Evaluation before the commitment decision.');
  if(c.quality?.learning.decision&&c.quality.learning.decision!=='go')throw new Error('No build commitment for ONE GAP or PIVOT/STOP.');
  const experiment=c.quality?.learning.experiment;
  if(experiment)return `For ${text(c.definition.user.text)}, this is a bounded learning MVP: ${text(experiment.promise)}\n\nCapabilities: ${experiment.capabilities.map(text).join('; ')}.\nCuts: ${experiment.cuts.map(text).join('; ')}.\nLimits: ${text(experiment.limitations)}\nSuccess: ${text(experiment.success)}\nFailure: ${text(experiment.failure)}\nProposed first-user test: ${experiment.testDate}.\nRemaining uncertainty: ${text(c.quality!.learning.reason)}\n\nDo you authorize building this exact scope?`;
  return `${c.preferredName ? `${text(c.preferredName.value)}, here` : 'Here'} is the build commitment: ${text(c.intention.statement)}\n\nFor ${text(c.definition.user.text)}, we would address ${text(c.definition.problem.text)}\n\n${c.evaluation.promising.slice(0,2).map(text).join(' ')} Remaining uncertainty: ${text(c.evaluation.unknowns[0]??null)}\n\nAre you ready to commit a build cycle to this?`;
}
