/** A small, offline decision policy for host research. The host judges materiality
 * and performs permitted searches; Core sets a bounded path and honest labels. */
export interface ResearchDecision {
  decision: string;
  materialExternalGap: boolean;
  evidence: 'none' | 'current' | 'stale' | 'estimate';
  kind: 'money' | 'competition' | 'technical' | 'first_users' | 'other';
  localityMatters?: boolean;
  cityRegion?: string | null;
  claimEvidence?: ExternalEvidence;
}
export interface ResearchPlan {
  action: 'answer' | 'reuse' | 'ask_locality' | 'research';
  decision: string;
  question: string | null;
  maxQueries: number;
  maxPages: number;
  stopWhen: string;
  claimStatus: ReturnType<typeof classifyExternalEvidence> | null;
}
export function planDecisionResearch(input: ResearchDecision): ResearchPlan {
  if (!input || typeof input !== 'object' || typeof input.decision !== 'string' || !input.decision.trim() || input.decision.length > 400 || typeof input.materialExternalGap !== 'boolean' || !['none','current','stale','estimate'].includes(input.evidence) || !['money','competition','technical','first_users','other'].includes(input.kind) || (input.localityMatters !== undefined && typeof input.localityMatters !== 'boolean') || (input.cityRegion != null && (typeof input.cityRegion !== 'string' || input.cityRegion.length > 120)) || (input.claimEvidence !== undefined && (!input.claimEvidence || typeof input.claimEvidence !== 'object' || Array.isArray(input.claimEvidence)))) throw new Error('Describe one decision, material external gap, evidence state and research kind.');
  const classified=input.claimEvidence ? classifyExternalEvidence(input.claimEvidence) : null;
  const claimStatus=classified==='verified_current' && input.evidence!=='current' ? 'publicly_listed' : classified;
  const base={decision:input.decision.trim(),question:null,maxQueries:0,maxPages:0,stopWhen:'No external call is needed for this turn.',claimStatus};
  if (!input.materialExternalGap) return {...base,action:'answer'};
  if (input.localityMatters && !input.cityRegion?.trim()) return {...base,action:'ask_locality',question:'Which city or region should we use?',stopWhen:'Wait for the minimum locality needed to avoid an arbitrary match.'};
  if (input.evidence==='current') return {...base,action:'reuse',stopWhen:'Reuse the relevant current source and its limits; do not repeat the search.'};
  return {action:'research',decision:base.decision,question:null,maxQueries:3,maxPages:6,stopWhen:'Stop once credible evidence changes or adequately supports this decision; record unresolved limits. Broaden only for a material gap.',claimStatus};
}

export interface ExternalEvidence {
  sourceUrl?: string | null;
  retrievedOn?: string | null;
  entity?: string | null;
  location?: string | null;
  localityMatters?: boolean;
  inspected?: boolean;
  directlyVerified?: boolean;
  currentAsOf?: string | null;
  estimated?: boolean;
}
export function classifyExternalEvidence(evidence: ExternalEvidence): 'verified_current' | 'publicly_listed' | 'estimate' | 'unverified' {
  if (!evidence) return 'unverified';
  if (evidence.estimated) return 'estimate';
  if (!evidence.sourceUrl || !evidence.retrievedOn || !evidence.entity?.trim() || !evidence.inspected || (evidence.localityMatters && !evidence.location?.trim())) return 'unverified';
  try { const url=new URL(evidence.sourceUrl);if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return 'unverified'; } catch { return 'unverified'; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(evidence.retrievedOn) || Number.isNaN(Date.parse(evidence.retrievedOn)) || new Date(evidence.retrievedOn).toISOString().slice(0,10)!==evidence.retrievedOn) return 'unverified';
  if (evidence.directlyVerified && evidence.currentAsOf === evidence.retrievedOn) return 'verified_current';
  return 'publicly_listed';
}
