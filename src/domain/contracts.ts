import { readFileSync } from 'node:fs';
import { Ajv } from 'ajv';

export interface Claim {
  value: string | null;
  basis: 'founder_statement' | 'artifact_observation' | 'assumption' | 'unknown';
  source: string | null;
}
export const claimFields = ['targetUser', 'buyer', 'problem', 'trigger', 'workaround', 'desiredOutcome', 'solution'] as const;
export interface Foundation extends Record<typeof claimFields[number], Claim> {
  name: string;
  stage: 'idea' | 'building' | 'pilot' | 'live' | 'unknown';
  contactState: 'none_reported' | 'contact_reported' | 'unknown';
  constraints: string[];
  unknowns: string[];
}
export interface Proposal {
  title: string; method: 'build' | 'learning'; journey: string; criticalUnknown: string;
  why: string; nextAction: string; capabilities: string[]; keep: string[]; park: string[];
  technicalAcceptance: string[]; learningAcceptance: string[]; observationWindow: string; cashSpend: 0;
}
export interface LegacyDraft {
  contractVersion: 1; synthetic: true; expectedVersion: number;
  foundation: Foundation; proposal: Proposal;
  artifacts: { path: string; sha256: string }[];
  artifactPermission: { granted: boolean; quote: string };
}
export const evaluationTopics = ['direct_competitors', 'manual_substitutes', 'ai_substitutes', 'pricing_positioning', 'praise', 'complaints', 'differentiation', 'growth_signals', 'problem_discussions', 'communities', 'user_habitats', 'first_user_avenues'] as const;
export type EvaluationTopic = typeof evaluationTopics[number];
export interface Evaluation {
  state: 'not_run' | 'requested' | 'available' | 'unavailable';
  question: string | null;
  unavailableReason: string | null;
  findings: {
    topic: EvaluationTopic; statement: string;
    kind: 'disclosed_metric' | 'public_proxy' | 'public_observation';
    source: { title: string; url: string; accessedOn: string };
    limitation: string; provenance: 'synthetic_fixture';
  }[];
}
export interface RevisedDraft extends Omit<LegacyDraft, 'contractVersion'> {
  contractVersion: 2;
  ideal: {
    intention: { goal: 'solo_profit' | 'high_growth' | 'b2b_enterprise' | 'impact' | 'learning' | 'custom' | 'unknown'; statement: string | null };
    consequence: Claim;
    feedback: { summary: string; source: string; provenance: 'founder_reported' }[];
    evaluation: Evaluation;
  };
  brief: { summary: string; nextAction: string };
}
interface ConversationBase extends Omit<RevisedDraft, 'contractVersion' | 'proposal' | 'ideal' | 'brief'> {
  contractVersion: 3;
  ideal: Omit<RevisedDraft['ideal'], 'intention'> & {
    intention: RevisedDraft['ideal']['intention'] & { status: 'unasked' | 'asked' | 'provided' | 'skipped' };
    assessment: { promising: string | null; weak: string | null; criticalUnknown: string; cheapestCheck: string } | null;
  };
  brief: RevisedDraft['brief'] & { questions: string[] };
}
export interface OrientationDraft extends ConversationBase {
  phase: 'orientation'; proposal: null; decision: null;
}
export interface ActionDraft extends ConversationBase {
  phase: 'proposal'; proposal: Proposal;
  decision: { basis: 'context_ready' | 'build_requested'; source: string };
}
export interface EvaluatedActionDraft extends Omit<ActionDraft, 'contractVersion' | 'decision' | 'synthetic'> {
  contractVersion: 4; synthetic: boolean;
  context: { version: number; hash: string };
  decision: { basis: 'evaluation_ready' | 'build_requested'; source: string };
}
export interface ConfirmedActionDraft extends Omit<EvaluatedActionDraft, 'contractVersion' | 'decision'> {
  contractVersion: 5;
  decision: { basis: 'act_confirmed'; source: string; confirmationId: string };
}
/** Actionable drafts retain the historical Draft API; orientation cannot be approved. */
export type Draft = LegacyDraft | RevisedDraft | ActionDraft | EvaluatedActionDraft | ConfirmedActionDraft;
export type ConversationDraft = Draft | OrientationDraft;
export function isActionable(draft: ConversationDraft): draft is Draft { return draft.proposal !== null; }
export interface Approval { contractVersion: 1; draftHash: string; founderApproved: true; approvalQuote: string }
export interface Receipt {
  contractVersion: 1; cycleId: string;
  implementation: 'completed' | 'partial' | 'not_started' | 'not_applicable';
  changes: { path: string; kind: 'created' | 'modified' | 'deleted' }[];
  checks: { label: string; command: string; executed: boolean; exitCode: number | null; result: 'passed' | 'failed' | 'not_run'; output: string }[];
  runInstructions: string[]; gaps: string[]; reportedBy: 'codex';
}
export interface ArtifactRequest { paths: string[]; permissionGranted: true; permissionQuote: string }

const schema = JSON.parse(readFileSync(new URL('../../contracts/m1.schema.json', import.meta.url), 'utf8')) as object;
const ajv = new Ajv({ strict: true, allErrors: true });
ajv.addSchema(schema);
ajv.addSchema(JSON.parse(readFileSync(new URL('../../contracts/m1r.schema.json', import.meta.url), 'utf8')) as object);
ajv.addSchema(JSON.parse(readFileSync(new URL('../../contracts/conversation-v3.schema.json', import.meta.url), 'utf8')) as object);
ajv.addSchema(JSON.parse(readFileSync(new URL('../../contracts/conversation-v4.schema.json', import.meta.url), 'utf8')) as object);
ajv.addSchema(JSON.parse(readFileSync(new URL('../../contracts/conversation-v5.schema.json', import.meta.url), 'utf8')) as object);
const validators = Object.fromEntries(['draft', 'approval', 'receipt', 'inspect'].map(name => [name, ajv.compile({ $ref: `https://cec.local/contracts/m1-v1#/$defs/${name}` })]));
const revisedDraftValidator = ajv.compile({ $ref: 'https://pruvity.local/contracts/m1r-v2#/$defs/draft' });
const conversationValidator = ajv.compile({ $ref: 'urn:business-copilot:conversation:v3#/$defs/draft' });
const evaluatedValidator = ajv.compile({ $ref: 'urn:business-copilot:conversation:v4#/$defs/draft' });
const confirmedValidator = ajv.compile({ $ref: 'urn:business-copilot:conversation:v5#/$defs/draft' });

export function validate<T>(kind: 'draft' | 'approval' | 'receipt' | 'inspect', input: unknown): asserts input is T {
  const version = kind === 'draft' && typeof input === 'object' && input !== null && 'contractVersion' in input ? input.contractVersion : undefined;
  const validator = version === 5 ? confirmedValidator : version === 4 ? evaluatedValidator : version === 3 ? conversationValidator : version === 2 ? revisedDraftValidator : validators[kind]!;
  if (!validator(input)) {
    // Report locations/rules, never echo potentially private field values.
    throw new Error(`Invalid ${kind}: ${validator.errors?.slice(0, 5).map(error => `${error.instancePath || '/'} ${error.message}`).join('; ')}. Correct the request; nothing was saved.`);
  }
}
