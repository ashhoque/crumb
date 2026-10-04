/** Compact working notes. These observations never grant IDE or Act approval. */
export const projectFactKeys = [
  'product','customer','problem','stage','capabilities','workflow','business_model',
  'pricing','validation','constraints','assumptions','decision','risk','next_move',
  'user_incentives','switching_barriers','trust','buyer_process',
  'market_pulse','research_habitat','acquisition_habitat','first_user_learning',
] as const;
export const founderFactKeys = [
  'objective','stage','decision','momentum','knowledge','friction',
  'likely_next_need','pace','ambition','constraints',
] as const;
export type ProjectFactKey = typeof projectFactKeys[number];
export type FounderFactKey = typeof founderFactKeys[number];
export type WorkingFact = {
  value: string;
  status: 'known' | 'inferred' | 'stale' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  source: string | null;
};
export interface FounderWorkingContext {
  conversationId: string;
  project: Partial<Record<ProjectFactKey, WorkingFact>>;
  founder: Partial<Record<FounderFactKey, WorkingFact>>;
  inspected: { path: string; sha256: string }[];
  opportunity: { signal: string; evidenceIds: string[]; level: 'signal' | 'hypothesis' | 'strong' | 'recommended_test' } | null;
}

const names = (keys: readonly string[]) => new Set(keys);
const projectKeys = names(projectFactKeys), founderKeys = names(founderFactKeys);
const id = /^[A-Za-z0-9_-]{8,120}$/;
const hash = /^[a-f0-9]{64}$/;
const clean = (value: string, max: number): string => value.trim().slice(0,max);

/** Delta updates change only supplied fields and leave other observations intact. */
export function updateWorkingContext(
  current: FounderWorkingContext | undefined,
  delta: Partial<Pick<FounderWorkingContext,'project'|'founder'|'inspected'|'opportunity'>>,
  conversationId: string,
): FounderWorkingContext {
  if (!id.test(conversationId) || (current && current.conversationId !== conversationId)) throw new Error('Working context belongs to a different conversation. Start a separate project context.');
  if (!delta || typeof delta !== 'object' || Array.isArray(delta) || Object.keys(delta).some(k=>!['project','founder','inspected','opportunity'].includes(k))) throw new Error('Use a bounded working-context delta.');
  const result: FounderWorkingContext = current ? structuredClone(current) : {conversationId,project:{},founder:{},inspected:[],opportunity:null};
  for (const area of ['project','founder'] as const) {
    const changes=delta[area]; if (changes === undefined) continue;
    if (!changes || typeof changes !== 'object' || Array.isArray(changes)) throw new Error('Working facts must be keyed observations.');
    for (const [key, raw] of Object.entries(changes)) {
      if (!(area==='project'?projectKeys:founderKeys).has(key) || !raw || typeof raw !== 'object') throw new Error('Unknown working-context fact.');
      const fact=raw as WorkingFact;
      if (typeof fact.value!=='string' || !fact.value.trim() || fact.value.length>320 || !['known','inferred','stale','unknown'].includes(fact.status) || !['high','medium','low'].includes(fact.confidence) || (fact.source!==null && (typeof fact.source!=='string' || fact.source.length>240))) throw new Error('Working facts need a short value, status, confidence and optional source.');
      if (fact.status==='inferred' && fact.confidence==='high') throw new Error('An inference cannot be high-confidence without direct evidence.');
      result[area][key as ProjectFactKey & FounderFactKey]={...fact,value:clean(fact.value,320),source:fact.source?.trim()??null};
    }
  }
  if (delta.inspected !== undefined) {
    if (!Array.isArray(delta.inspected) || delta.inspected.length>12 || delta.inspected.some(x=>!x || typeof x.path!=='string' || x.path.length>240 || !hash.test(x.sha256) || /(^|[\\/])(?:\.git|\.customer-evidence|\.env)(?:[\\/]|$)/i.test(x.path))) throw new Error('Keep at most twelve safe source path/hash references.');
    result.inspected=delta.inspected.map(x=>({path:x.path,sha256:x.sha256}));
  }
  if (delta.opportunity !== undefined) {
    const o=delta.opportunity;
    if (o!==null && (!o || typeof o.signal!=='string' || !o.signal.trim() || o.signal.length>300 || !Array.isArray(o.evidenceIds) || o.evidenceIds.length>6 || o.evidenceIds.some(x=>typeof x!=='string'||x.length>80) || !['signal','hypothesis','strong','recommended_test'].includes(o.level))) throw new Error('An opportunity needs a bounded signal, evidence IDs and calibrated level.');
    result.opportunity=o;
  }
  if (JSON.stringify(result).length>6500) throw new Error('Working context exceeds the compact snapshot budget. Summarize before saving.');
  return result;
}

export function opportunityLevel(independentEvidence: number, repeated: boolean, directUserEvidence: boolean): NonNullable<FounderWorkingContext['opportunity']>['level'] {
  if (!Number.isInteger(independentEvidence) || independentEvidence<0) throw new Error('Count independent evidence, not repeated mentions of one source.');
  if (independentEvidence>=2 && repeated && directUserEvidence) return 'recommended_test';
  if (independentEvidence>=2 && (repeated || directUserEvidence)) return 'strong';
  if (independentEvidence>=1) return 'hypothesis';
  return 'signal';
}

export interface FounderTurnDecision {
  kind: 'clarification' | 'project_decision' | 'evidence_decision' | 'deep_request';
  hasCurrentSnapshot: boolean;
  materialExternalGap: boolean;
  existingEvidence: 'current' | 'stale' | 'none';
}
export function planFounderMove(input:FounderTurnDecision) {
  if(!input || !['clarification','project_decision','evidence_decision','deep_request'].includes(input.kind) || typeof input.hasCurrentSnapshot!=='boolean' || typeof input.materialExternalGap!=='boolean' || !['current','stale','none'].includes(input.existingEvidence))throw new Error('Describe the current decision and evidence gap.');
  if(input.kind==='clarification')return {path:'fast' as const,projectPasses:0,researchBatches:0,followUpBatches:0,next:'Answer directly and offer one useful next move.'};
  const projectPasses=input.kind==='project_decision'&&!input.hasCurrentSnapshot?2:0;
  const needResearch=input.materialExternalGap&&input.existingEvidence!=='current';
  return {path:projectPasses?'bootstrap' as const:needResearch?'research' as const:'fast' as const,
    projectPasses,researchBatches:needResearch?1:0,followUpBatches:needResearch?1:0,
    next:needResearch?'Research the material gap, stop when the decision is supported, then recommend one action.':'Use current evidence, make a reasoned recommendation, then offer one next move.'};
}
