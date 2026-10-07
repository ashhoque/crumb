import { Ajv } from 'ajv';
import { validate, type ConfirmedActionDraft, type Receipt } from './contracts.js';
import { validateConversation, words } from './conversation.js';
import { assertAct, basis, type IdeContext } from './ide.js';

export interface ActPlan {
  execution?: {mode:'build';handoffHash:string;automaticStages:boolean;humanCheckpoints:string[]};
  contractVersion: 1; expectedVersion: number; scope: ConfirmedActionDraft;
  outcome: { input: string; output: string; failureBehavior: string; persistence: { mode: 'none' | 'local' | 'existing' | 'integration'; reason: string } };
  capabilities: { name: string; userBasis: string; problemBasis: string; evidenceClaimIds: string[]; learningObjective: string }[];
  repository: { permissionQuote: string; inspectedPaths: string[]; environment: 'known' | 'unknown'; stack: string; constraints: string[] };
  keep: { label: string; paths: string[]; reason: string }[];
  park: { label: string; paths: string[]; reason: string }[];
  stages: ActStage[]; stopAfterStageId: string; packDirectory: string;
}
export interface ActStage { id: string; title: string; kind: 'groundwork' | 'risk' | 'mvp'; goal: string; capabilities: string[]; writes: string[]; checks: { id: string; description: string; commandHint: string }[] }
export interface StageResult {
  expectedVersion: number; stageId: string; implementation: 'completed' | 'partial' | 'not_started';
  changes: Receipt['changes']; checks: (Receipt['checks'][number] & { criterionId: string })[];
  runInstructions: string[]; gaps: string[];
}
export interface StageReceipt extends StageResult {
  id: string; recordedAt: string; fileHashes: Record<string, string | null>;
  customerValidation: 'not_established'; release: 'not_released'; provenance: 'host_report_with_local_file_hashes';
}
export interface ActRecord {
  id: string; plan: ActPlan; planHash: string; ideBasis: string;
  approval: { quote: string; recordedAt: string } | null;
  pack: { directory: string; files: { path: string; sha256: string }[] } | null;
  currentStage: number; status: 'proposed' | 'authorized' | 'awaiting_review' | 'paused' | 'stopped' | 'cancelled';
  baseline: Record<string, string | null>;
  receipts: StageReceipt[];
  reviews: { stageId: string; decision: 'continue' | 'finish' | 'pause' | 'resume' | 'cancel'; quote: string; recordedAt: string }[];
  automaticAdvances?: {fromStage:string;toStage:string;receiptId:string;reason:'passed_preapproved_exit_criteria'}[];
}
export interface SavedAct { version: number; hash: string; recordedAt: string; record: ActRecord }

const text = (maxLength = 1500) => ({ type: 'string', minLength: 1, maxLength, pattern: '\\S' });
const obj = (properties: Record<string, object>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const arr = (items: object, maxItems = 24, minItems = 0) => ({ type: 'array', items, maxItems, minItems });
const strs = (maxItems = 24, minItems = 0) => arr(text(), maxItems, minItems);
const version = { type: 'integer', minimum: 0 };
const hash = { type: 'string', pattern: '^[a-f0-9]{64}$' };
const basePlanSchema = { $id: 'urn:business-copilot:act-plan:v1', ...obj({
  contractVersion: { const: 1 }, expectedVersion: version, scope: { type: 'object' },
  outcome: obj({ input: text(), output: text(), failureBehavior: text(), persistence: obj({ mode: { enum: ['none','local','existing','integration'] }, reason: text() }) }),
  capabilities: arr(obj({ name: text(), userBasis: hash, problemBasis: hash, evidenceClaimIds: strs(12, 1), learningObjective: text() }), 3, 1),
  repository: obj({ permissionQuote: text(), inspectedPaths: strs(24), environment: { enum: ['known','unknown'] }, stack: text(), constraints: strs(12) }),
  keep: arr(obj({ label: text(), paths: strs(), reason: text() })), park: arr(obj({ label: text(), paths: strs(), reason: text() })),
  stages: arr(obj({ id: { type: 'string', pattern: '^[a-z][a-z0-9-]{0,39}$' }, title: text(120), kind: { enum: ['groundwork','risk','mvp'] }, goal: text(), capabilities: strs(3), writes: strs(), checks: arr(obj({ id: text(80), description: text(), commandHint: text() }), 8, 1) }), 8, 1),
  stopAfterStageId: text(40), packDirectory: text(200),
}) };
export const actPlanSchema={...basePlanSchema,properties:{...basePlanSchema.properties,execution:obj({mode:{const:'build'},handoffHash:hash,automaticStages:{type:'boolean'},humanCheckpoints:strs(8,1)})}};
export const stageResultSchema = obj({
  expectedVersion: version, stageId: text(40), implementation: { enum: ['completed','partial','not_started'] },
  changes: arr(obj({ path: text(240), kind: { enum: ['created','modified','deleted'] } })),
  checks: arr(obj({ criterionId: text(80), label: text(160), command: text(), executed: { type: 'boolean' }, exitCode: { anyOf: [{ type: 'integer' }, { type: 'null' }] }, result: { enum: ['passed','failed','not_run'] }, output: text(6000) }), 8, 1),
  runInstructions: strs(8, 1), gaps: strs(12),
});
const ajv = new Ajv({ strict: true, allErrors: true });
const planShape = ajv.compile(actPlanSchema), resultShape = ajv.compile(stageResultSchema);
export const unique = (xs: string[]): boolean => new Set(xs.map(x => x.toLowerCase().replaceAll('\\', '/'))).size === xs.length;

export function evaluatedClaimIds(c:IdeContext):Set<string> {
  return new Set([...c.evaluation.coverage,...c.investigation.coverage].flatMap(x=>x.claimIds)
    .concat(c.redTeam.map(x=>x.claimId),c.competitors.flatMap(x=>Object.values(x.fields).flatMap(v=>v.claimIds)),c.adjacent.flatMap(x=>x.reasonClaimIds)));
}

export function validateActPlan(input: unknown, c: IdeContext): asserts input is ActPlan {
  assertAct(c);
  if (Buffer.byteLength(JSON.stringify(input) ?? '') > 65_536 || !planShape(input)) throw new Error(`Invalid bounded Act plan: ${planShape.errors?.slice(0,3).map(x=>`${x.instancePath} ${x.message}`).join('; ') ?? 'exceeds 64 KiB'}`);
  const p = input as unknown as ActPlan;
  validate<ConfirmedActionDraft>('draft', p.scope); validateConversation(p.scope);
  if (p.scope.contractVersion !== 5 || p.scope.proposal.method !== 'build') throw new Error('Act needs a v5 build scope tied to confirmed IDE.');
  if (JSON.stringify(p.capabilities.map(x=>x.name)) !== JSON.stringify(p.scope.proposal.capabilities) || !unique(p.capabilities.map(x=>x.name))) throw new Error('Use exactly the one to three displayed scope capabilities.');
  if(c.quality?.learning.experiment&&JSON.stringify(p.capabilities.map(x=>x.name))!==JSON.stringify(c.quality.learning.experiment.capabilities))throw new Error('A bounded learning build must preserve the capabilities in the exact approved experiment. Re-present a material scope change.');
  const evaluated=evaluatedClaimIds(c);
  for (const item of p.capabilities) {
    if (item.userBasis !== basis(c,'user') || item.problemBasis !== basis(c,'problem')) throw new Error('Every capability must trace to the current confirmed user and problem.');
    if (!unique(item.evidenceClaimIds) || item.evidenceClaimIds.some(id=>!c.claims.some(x=>x.id===id))) throw new Error('Every capability needs retained evaluation insight and a learning objective.');
    if(!item.evidenceClaimIds.some(id=>evaluated.has(id))) throw new Error('Link each capability to an insight actually considered in Evaluation, not merely any stored claim.');
  }
  if (!unique(p.stages.map(x=>x.id)) || !p.stages.some(x=>x.id===p.stopAfterStageId)) throw new Error('Stage identities must be unique and the stopping stage must exist.');
  if(p.execution&&(!unique(p.execution.humanCheckpoints)||p.execution.humanCheckpoints.some(id=>!p.stages.some(s=>s.id===id))||!p.execution.humanCheckpoints.includes(p.stopAfterStageId)||!p.execution.humanCheckpoints.includes(p.stages.at(-1)!.id)))throw new Error('Define explicit human checkpoints including the final MVP and intended stopping stage.');
  if (p.repository.environment === 'unknown' && p.stages[0]!.kind !== 'groundwork') throw new Error('Unknown customer tooling needs a first groundwork stage.');
  if (p.stages.at(-1)!.kind !== 'mvp' || p.stages.filter(x=>x.kind==='mvp').length!==1) throw new Error('Plan one complete core journey as the final MVP stage.');
  if(words([p.scope.proposal.journey,p.scope.foundation.targetUser.value,p.scope.foundation.problem.value,p.scope.proposal.criticalUnknown,...p.capabilities.map(x=>x.name),...p.park.slice(0,2).map(x=>x.label),p.stages[0]!.title,p.stages[0]!.goal].join(' '))>220) throw new Error('Keep the visible Act decision concise; retain deeper detail in the full plan.');
  const names = p.capabilities.map(x=>x.name);
  for (const stage of p.stages) {
    if (!unique(stage.writes) || !unique(stage.checks.map(x=>x.id)) || !unique(stage.capabilities) || stage.capabilities.some(x=>!names.includes(x))) throw new Error('Stage paths, checks and capability references must be unique and in scope.');
  }
  if (names.some(name=>!p.stages.filter(s=>s.kind==='mvp').some(s=>s.capabilities.includes(name)))) throw new Error('The MVP stage must complete every approved capability.');
  const parked = p.park.flatMap(x=>x.paths).map(x=>x.toLowerCase().replaceAll('\\','/'));
  if (p.stages.flatMap(x=>x.writes).some(path=>parked.includes(path.toLowerCase().replaceAll('\\','/')))) throw new Error('Park means preserve, not edit or delete.');
  if (c.project.entry === 'existing' && !p.repository.inspectedPaths.length) throw new Error('Inspect the existing customer repository before planning its changes.');
  if (JSON.stringify(p.keep.map(x=>x.label)) !== JSON.stringify(p.scope.proposal.keep) || JSON.stringify(p.park.map(x=>x.label)) !== JSON.stringify(p.scope.proposal.park)) throw new Error('Keep and Park must match the displayed scope.');
}

export function validateStageResult(input: unknown, stage: ActStage): asserts input is StageResult {
  if (!resultShape(input)) throw new Error(`Invalid stage result: ${resultShape.errors?.slice(0,3).map(x=>`${x.instancePath} ${x.message}`).join('; ')}`);
  const r = input as unknown as StageResult;
  if (r.stageId !== stage.id || !unique(r.changes.map(x=>x.path)) || !unique(r.checks.map(x=>x.criterionId))) throw new Error('Record the current stage with unique paths and check results.');
  if(r.implementation==='not_started' && r.changes.length) throw new Error('A stage with file changes has started; record it as partial or completed.');
  if (r.changes.some(x=>!stage.writes.includes(x.path)) || r.checks.some(x=>!stage.checks.some(y=>y.id===x.criterionId))) throw new Error('Changes and checks must belong to this approved stage.');
  for (const check of r.checks) {
    if (check.result !== (!check.executed ? 'not_run' : check.exitCode === 0 ? 'passed' : 'failed') || (check.executed === (check.exitCode === null))) throw new Error('Failed or unexecuted checks cannot be called successful.');
  }
  if (r.implementation === 'completed' && (r.checks.length !== stage.checks.length || r.checks.some(x=>x.result !== 'passed'))) throw new Error('Stage completion needs every planned technical check executed and passed.');
  if (r.implementation !== 'completed' && !r.gaps.length) throw new Error('Explain the remaining work or failed checks.');
}
