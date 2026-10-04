import { Ajv } from 'ajv';
import type { IdeContext } from './ide.js';

export const coverageTopics = ['frequency', 'urgency', 'pain', 'necessity', 'prevalence', 'category_direction', 'buyer', 'existing_spend', 'reachability', 'founder_fit', 'ai_substitutes', 'dedicated_value', 'competitors', 'user_language', 'traction', 'gaps', 'adjacency', 'habitats'] as const;
export type CoverageTopic = typeof coverageTopics[number];
export const competitorFields = ['target', 'workflow', 'positioning', 'pricing', 'capabilities', 'love', 'hate', 'complexity', 'onboarding', 'missing_workflows', 'switching', 'underserved', 'gaps'] as const;
export const comparisonFields = ['pain_urgency', 'frequency', 'spending', 'reachability', 'competition_gaps', 'founder_fit', 'reusable_code', 'learning_cost'] as const;
export const definitionFields = ['user', 'buyer', 'problem', 'trigger', 'job', 'workaround', 'pain', 'consequence', 'frequency', 'reason_for_belief'] as const;
export const choiceActions = ['respond', 'correct', 'evaluate', 'research', 'competitors', 'users', 'gaps', 'adjacent', 'habitats', 'sources', 'why', 'interview', 'shape_mvp', 'master', 'build_requested'] as const;
export type ChoiceAction = typeof choiceActions[number];
export interface FindingView { text: string | null; claimIds: string[]; basis: 'observed' | 'inferred' | 'unknown' }
export interface ResearchSource {
  id: string; title: string; url: string | null;
  kind: 'vendor' | 'discussion' | 'review' | 'association' | 'industry' | 'filing' | 'founder' | 'artifact';
  provenance: 'public' | 'synthetic_fixture' | 'founder_report' | 'artifact_observation';
  access: 'inspected' | 'snippet' | 'unavailable' | 'provided';
  retrievedOn: string; publishedOn: string | null; delivery: 'live' | 'cached' | 'unknown' | 'provided';
  retainedText: string; limitation: string; archived: boolean;
  independenceKey: string; affiliation: 'independent' | 'vendor' | 'unknown';
}
export interface ResearchClaim {
  id: string; statement: string;
  basis: 'public_observation' | 'reported_metric' | 'public_proxy' | 'founder_reported' | 'artifact_observation' | 'inference' | 'assumption' | 'unknown';
  sourceIds: string[]; supports: string[]; challenges: string[]; limitation: string; important: boolean;
  repetition: 'single' | 'recurring' | 'not_applicable';
  metric: { name: string; value: string; unit: string; period: string; reportedBy: string } | null;
  quote: { sourceId: string; text: string } | null;
}
export interface ResearchRun {
  id: string; question: string; capability: 'host_research' | 'provided_sources' | 'synthetic_fixture' | 'unavailable';
  queryBudget: number; pageBudget: number; budgetReason: string | null;
  queries: { text: string; materialFinding: boolean }[]; inspectedSourceIds: string[];
  stopReason: 'coverage_sufficient' | 'diminishing_returns' | 'budget_reached' | 'unavailable' | 'user_stopped';
  limitation: string;
}
export interface Habitat {
  id: string; kind: 'online' | 'professional' | 'physical'; place: string; observedClaimIds: string[];
  likelyUsers: string; relevance: string; participation: { route: string | null; verified: boolean; sourceIds: string[] }; limitation: string;
}
export interface PrebuildContext {
  contractVersion: 1; expectedVersion: number; synthetic: boolean;
  stage: 'intention' | 'define' | 'evaluate';
  project: { name: string; entry: 'fresh' | 'existing' | 'unknown'; artifacts: { path: string; sha256: string }[]; permissionQuote: string | null };
  preferredName: { value: string; source: string } | null;
  intention: { status: 'unasked' | 'asked' | 'provided' | 'skipped' | 'undecided'; goal: 'personal' | 'solo_profit' | 'bootstrapped' | 'high_growth' | 'b2b_enterprise' | 'impact' | 'learning' | 'custom' | 'unknown'; statement: string | null; advice: string | null };
  definition: Record<typeof definitionFields[number], FindingView>;
  feedbackClaimIds: string[];
  sources: ResearchSource[]; claims: ResearchClaim[]; research: ResearchRun[];
  evaluation: {
    status: 'not_started' | 'in_progress' | 'limited' | 'ready';
    coverage: { topic: CoverageTopic; status: 'unexamined' | 'findings' | 'unknown_after_search' | 'not_relevant'; claimIds: string[]; runIds: string[]; reason: string }[];
    promising: string[]; weak: string[]; unknowns: string[]; contradictions: string[]; conclusion: string | null;
  };
  competitors: { id: string; name: string; categories: ('direct' | 'indirect' | 'adjacent' | 'incumbent' | 'new_ai' | 'service' | 'manual' | 'do_nothing' | 'generic_ai')[]; fields: Record<typeof competitorFields[number], FindingView>; tractionClaimIds: string[] }[];
  adjacent: { id: string; problem: string; reasonClaimIds: string[]; comparison: Record<typeof comparisonFields[number], string> }[];
  habitats: Habitat[]; firstUserAvenues: string[];
  redTeam: { claimId: string; evidence: string; inference: string; assumption: string; contradiction: string; disproof: string; cheapestLearning: string }[];
  master: { thesis: string; interviewPlan: string; mvpHypothesis: string; nonGoals: string[]; technicalStrategy: string; businessModel: string; economics: string; validationPlan: string; risks: string[] } | null;
  buildRequest: { quote: string } | null;
  brief: { kind: 'conversation' | 'research'; summary: string; seeing: string[]; matters: string[]; next: string; questions: string[]; choices: { label: string; action: ChoiceAction }[] };
}
export interface SavedPrebuild { version: number; hash: string; recordedAt: string; context: PrebuildContext | IdeContext }

/** A starting shape for the host, not an intake form for the founder. */
export function emptyPrebuild(): PrebuildContext {
  return {
    contractVersion: 1, expectedVersion: 0, synthetic: true, stage: 'intention',
    project: { name: 'Current project', entry: 'unknown', artifacts: [], permissionQuote: null },
    preferredName: null, intention: { status: 'unasked', goal: 'unknown', statement: null, advice: null },
    definition: Object.fromEntries(definitionFields.map(key => [key, { text: null, claimIds: [], basis: 'unknown' } as FindingView])) as PrebuildContext['definition'],
    feedbackClaimIds: [], sources: [], claims: [], research: [], competitors: [], adjacent: [], habitats: [], firstUserAvenues: [], redTeam: [], master: null, buildRequest: null,
    evaluation: { status: 'not_started', coverage: coverageTopics.map(topic => ({ topic, status: 'unexamined', claimIds: [], runIds: [], reason: 'Not examined yet.' })), promising: [], weak: [], unknowns: [], contradictions: [], conclusion: null },
    brief: { kind: 'conversation', summary: 'We will start from where you are. First, let’s make the problem and your ambition clearer.', seeing: [], matters: [], next: 'Describe what you have in mind.', questions: ['Are you starting fresh, or do you have a project in progress?'], choices: [{ label: 'Starting fresh', action: 'respond' }, { label: 'Existing project', action: 'respond' }] },
  };
}

const text = (maxLength = 1000) => ({ type: 'string', minLength: 1, maxLength, pattern: '\\S' });
const nullable = (schema: object) => ({ anyOf: [schema, { type: 'null' }] });
const enumeration = (values: readonly string[]) => ({ enum: values });
const object = (properties: Record<string, object>) => ({ type: 'object', additionalProperties: false, properties, required: Object.keys(properties) });
const array = (items: object, maxItems = 64, minItems = 0) => ({ type: 'array', items, maxItems, minItems });
const identifier = { type: 'string', pattern: '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$' };
const ids = () => array(identifier);
const strings = (maxItems = 12) => array(text(), maxItems);
const integer = (maximum = 1_000_000) => ({ type: 'integer', minimum: 0, maximum });
const boolean = { type: 'boolean' };
const view = object({ text: nullable(text()), claimIds: ids(), basis: enumeration(['observed', 'inferred', 'unknown']) });
const keyed = (keys: readonly string[], value: object) => object(Object.fromEntries(keys.map(key => [key, value])));

/** Neutral, strict contract: source bodies are data, never tool instructions. */
export const prebuildSchema = {
  $id: 'urn:business-copilot:prebuild:v1',
  ...object({
    contractVersion: { const: 1 }, expectedVersion: integer(), synthetic: boolean,
    stage: enumeration(['intention', 'define', 'evaluate']),
    project: object({ name: text(160), entry: enumeration(['fresh', 'existing', 'unknown']), artifacts: array(object({ path: text(240), sha256: { type: 'string', pattern: '^[a-f0-9]{64}$' } }), 6), permissionQuote: nullable(text()) }),
    preferredName: nullable(object({ value: text(80), source: text() })),
    intention: object({ status: enumeration(['unasked', 'asked', 'provided', 'skipped', 'undecided']), goal: enumeration(['personal', 'solo_profit', 'bootstrapped', 'high_growth', 'b2b_enterprise', 'impact', 'learning', 'custom', 'unknown']), statement: nullable(text()), advice: nullable(text()) }),
    definition: keyed(definitionFields, view), feedbackClaimIds: ids(),
    sources: array(object({ id: text(80), title: text(240), url: nullable(text(2000)), kind: enumeration(['vendor', 'discussion', 'review', 'association', 'industry', 'filing', 'founder', 'artifact']), provenance: enumeration(['public', 'synthetic_fixture', 'founder_report', 'artifact_observation']), access: enumeration(['inspected', 'snippet', 'unavailable', 'provided']), retrievedOn: text(10), publishedOn: nullable(text(10)), delivery: enumeration(['live', 'cached', 'unknown', 'provided']), retainedText: { type: 'string', maxLength: 4000 }, limitation: text(), archived: boolean, independenceKey: text(240), affiliation: enumeration(['independent', 'vendor', 'unknown']) })),
    claims: array(object({ id: text(80), statement: text(), basis: enumeration(['public_observation', 'reported_metric', 'public_proxy', 'founder_reported', 'artifact_observation', 'inference', 'assumption', 'unknown']), sourceIds: ids(), supports: ids(), challenges: ids(), limitation: text(), important: boolean, repetition: enumeration(['single', 'recurring', 'not_applicable']), metric: nullable(object({ name: text(160), value: text(160), unit: text(160), period: text(160), reportedBy: text(160) })), quote: nullable(object({ sourceId: text(80), text: text(1000) })) }), 128),
    research: array(object({ id: text(80), question: text(), capability: enumeration(['host_research', 'provided_sources', 'synthetic_fixture', 'unavailable']), queryBudget: integer(100), pageBudget: integer(200), budgetReason: nullable(text()), queries: array(object({ text: text(), materialFinding: boolean }), 100), inspectedSourceIds: ids(), stopReason: enumeration(['coverage_sufficient', 'diminishing_returns', 'budget_reached', 'unavailable', 'user_stopped']), limitation: text() }), 12),
    evaluation: object({ status: enumeration(['not_started', 'in_progress', 'limited', 'ready']), coverage: array(object({ topic: enumeration(coverageTopics), status: enumeration(['unexamined', 'findings', 'unknown_after_search', 'not_relevant']), claimIds: ids(), runIds: ids(), reason: text() }), coverageTopics.length), promising: strings(), weak: strings(), unknowns: strings(), contradictions: strings(), conclusion: nullable(text()) }),
    competitors: array(object({ id: text(80), name: text(160), categories: array(enumeration(['direct', 'indirect', 'adjacent', 'incumbent', 'new_ai', 'service', 'manual', 'do_nothing', 'generic_ai']), 9, 1), fields: keyed(competitorFields, view), tractionClaimIds: ids() }), 16),
    adjacent: array(object({ id: text(80), problem: text(), reasonClaimIds: array(text(80), 64, 1), comparison: keyed(comparisonFields, text()) }), 2),
    habitats: array(object({ id: text(80), kind: enumeration(['online', 'professional', 'physical']), place: text(240), observedClaimIds: array(text(80), 64, 1), likelyUsers: text(), relevance: text(), participation: object({ route: nullable(text()), verified: boolean, sourceIds: ids() }), limitation: text() }), 12),
    firstUserAvenues: array(text(80), 3),
    redTeam: array(object({ claimId: text(80), evidence: text(), inference: text(), assumption: text(), contradiction: text(), disproof: text(), cheapestLearning: text() }), 128),
    master: nullable(object({ thesis: text(), interviewPlan: text(2000), mvpHypothesis: text(), nonGoals: strings(), technicalStrategy: text(), businessModel: text(), economics: text(), validationPlan: text(), risks: strings() })),
    buildRequest: nullable(object({ quote: text() })),
    brief: object({ kind: enumeration(['conversation', 'research']), summary: text(1600), seeing: strings(3), matters: strings(2), next: text(), questions: array(text(400), 2), choices: array(object({ label: text(80), action: enumeration(choiceActions) }), 3) }),
  }),
};
const validateShape = new Ajv({ strict: true, allErrors: true }).compile(prebuildSchema);
const fail = (message: string): never => { throw new Error(message); };
const date = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const unique = (values: string[], label: string): void => { if (new Set(values).size !== values.length) fail(`${label} must be unique.`); };

export function validatePublicUrl(value: string): void {
  let url: URL;
  try { url = new URL(value); } catch { fail('Use a valid public HTTPS source URL.'); }
  if (/[\s<>"`]/u.test(value) || url!.protocol !== 'https:' || url!.username || url!.password || !url!.hostname || /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[::1\])/i.test(url!.hostname)) fail('Use a public HTTPS source URL without credentials or a local host.');
  for (const key of url!.searchParams.keys()) if (/^(token|access_token|api[-_]?key|authorization|password|secret|signature|x-amz-credential|x-amz-signature)$/i.test(key)) fail('Do not retain secret-bearing source URLs.');
}

export function validatePrebuild(input: unknown): asserts input is PrebuildContext {
  if (Buffer.byteLength(JSON.stringify(input) ?? '') > 262_144) fail('Keep the research dossier below 256 KiB; retain selected observations, not scraped pages.');
  if (!validateShape(input)) fail(`Invalid pre-build context: ${validateShape.errors?.slice(0, 4).map(e => `${e.instancePath || '/'} ${e.message}`).join('; ')}. Nothing was saved.`);
  const c = input as PrebuildContext;
  const sourceMap = new Map(c.sources.map(s => [s.id, s]));
  const claimMap = new Map(c.claims.map(item => [item.id, item]));
  const runs = new Map(c.research.map(run => [run.id, run]));
  for (const [name, items] of [['sources', c.sources], ['claims', c.claims], ['research', c.research], ['competitors', c.competitors], ['adjacent opportunities', c.adjacent], ['habitats', c.habitats]] as const) unique(items.map(item => item.id), name);
  const refs = (values: string[], map: Map<string, unknown>, label: string) => { unique(values, `${label} references`); for (const id of values) if (!map.has(id)) fail(`Unknown ${label} reference. Preserve evidence links before saving.`); };
  for (const key of [...sourceMap.keys(), ...claimMap.keys(), ...runs.keys(), ...c.competitors.map(item => item.id), ...c.adjacent.map(item => item.id), ...c.habitats.map(item => item.id)]) if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(key)) fail('Use plain stable identifiers for evidence references.');
  const claimRefs = (values: string[]) => refs(values, claimMap, 'claim');
  const sourceRefs = (values: string[]) => refs(values, sourceMap, 'source');
  for (const s of c.sources) {
    if (!date(s.retrievedOn) || (s.publishedOn !== null && !date(s.publishedOn))) fail('Source dates must be real calendar dates.');
    if (s.url !== null) validatePublicUrl(s.url);
    if (s.provenance === 'public' && s.url === null) fail('Public research needs an inspectable URL.');
    if (!c.synthetic && s.provenance === 'synthetic_fixture') fail('Do not mix synthetic fixture findings into actual founder context.');
    if (s.access === 'unavailable' && s.retainedText) fail('An unavailable source cannot contain inspected text.');
    if (s.access === 'provided' && s.delivery !== 'provided') fail('Keep supplied content distinct from host retrieval.');
    if (s.provenance === 'founder_report' && (s.kind !== 'founder' || s.access !== 'provided')) fail('Founder reports must remain supplied founder sources.');
    if (s.provenance === 'artifact_observation' && s.kind !== 'artifact') fail('Artifact observations must remain selected artifact sources.');
    if (s.provenance === 'public' && ['founder', 'artifact'].includes(s.kind)) fail('Public research cannot masquerade as a supplied founder report or selected file.');
    if (s.kind === 'artifact' && !c.project.artifacts.some(item => item.path === s.title)) fail('An artifact source title must name a selected, permitted file.');
  }
  const urls = c.sources.filter(s => s.url).map(s => { const url = new URL(s.url!); return `${url.origin}${url.pathname.replace(/\/$/, '')}`; });
  unique(urls, 'Source pages');
  for (const claim of c.claims) {
    sourceRefs(claim.sourceIds); claimRefs(claim.supports); claimRefs(claim.challenges);
    if (claim.supports.includes(claim.id) || claim.challenges.includes(claim.id)) fail('A claim cannot support or challenge itself.');
    const evidence = claim.sourceIds.map(id => sourceMap.get(id)!);
    if (['public_observation', 'reported_metric', 'public_proxy', 'founder_reported', 'artifact_observation'].includes(claim.basis) && !evidence.some(s => s.access !== 'unavailable')) fail('Observed or reported claims need an accessible source.');
    if (['public_observation', 'reported_metric', 'public_proxy'].includes(claim.basis) && !evidence.some(s => ['public', 'synthetic_fixture'].includes(s.provenance))) fail('Public findings must reference public research or labelled fixtures.');
    if (claim.basis === 'founder_reported' && !evidence.some(s => s.kind === 'founder')) fail('Founder reports must preserve their founder source.');
    if (claim.basis === 'artifact_observation' && !evidence.some(s => s.kind === 'artifact')) fail('Code observations must preserve their artifact source.');
    if ((claim.basis === 'reported_metric') !== (claim.metric !== null)) fail('Reported metrics need the reported value, unit, period and publisher; proxies must not carry a reported business metric.');
    if (claim.basis === 'inference' && claim.sourceIds.length + claim.supports.length + claim.challenges.length === 0) fail('An inference needs its basis; otherwise retain an assumption.');
    if (claim.repetition === 'recurring') {
      const independent = evidence.filter(s => s.affiliation === 'independent' && ['inspected', 'provided'].includes(s.access));
      if (new Set(independent.map(s => s.independenceKey)).size < 2) fail('Recurring praise or complaints need at least two distinct independent observations; keep an isolated finding single.');
    }
    if (claim.quote) {
      const source = sourceMap.get(claim.quote.sourceId);
      if (!claim.sourceIds.includes(claim.quote.sourceId) || !source || !['inspected', 'provided'].includes(source.access) || !source.retainedText.includes(claim.quote.text)) fail('A quotation must reproduce exact retained source text.');
    }
  }
  // Refuse circular evidence chains rather than presenting self-support as research.
  const visiting = new Set<string>(), visited = new Set<string>();
  const visit = (id: string): void => { if (visiting.has(id)) fail('Evidence support links must not form a cycle.'); if (visited.has(id)) return; visiting.add(id); for (const next of claimMap.get(id)!.supports) visit(next); visiting.delete(id); visited.add(id); };
  c.claims.forEach(item => visit(item.id));
  for (const run of c.research) {
    sourceRefs(run.inspectedSourceIds);
    if (run.queries.length > run.queryBudget || run.inspectedSourceIds.length > run.pageBudget) fail('Research exceeded its recorded budget. Preserve the actual work and explain an authorized budget revision.');
    if ((run.queryBudget > 12 || run.pageBudget > 24) && !run.budgetReason) fail('A larger research budget needs its reason.');
    if (run.inspectedSourceIds.some(id => !['inspected', 'provided'].includes(sourceMap.get(id)!.access))) fail('Snippets and unavailable pages are not inspected sources.');
    if (run.stopReason === 'diminishing_returns' && (run.queries.length < 2 || run.queries.slice(-2).some(q => q.materialFinding))) fail('Record two successive searches without material new findings before claiming diminishing returns.');
    if (run.stopReason === 'budget_reached' && run.queries.length < run.queryBudget && run.inspectedSourceIds.length < run.pageBudget) fail('The recorded research budget was not reached.');
    if (run.capability === 'unavailable' && (run.inspectedSourceIds.length || run.stopReason !== 'unavailable')) fail('Unavailable research cannot claim inspected results.');
    if (!c.synthetic && run.capability === 'synthetic_fixture') fail('Synthetic research runs cannot establish a real evaluation.');
  }
  const checkView = (v: FindingView): void => {
    claimRefs(v.claimIds);
    if ((v.text === null) !== (v.basis === 'unknown')) fail('Unknown views retain null instead of invented findings.');
    if (v.basis !== 'unknown' && !v.claimIds.length) fail('A finding view needs its supporting claims.');
    if (v.basis === 'observed' && !v.claimIds.some(id => ['public_observation', 'reported_metric', 'public_proxy', 'founder_reported', 'artifact_observation'].includes(claimMap.get(id)!.basis))) fail('An assumption or inference alone is not an observed finding.');
  };
  Object.values(c.definition).forEach(checkView);
  for (const competitor of c.competitors) { Object.values(competitor.fields).forEach(checkView); claimRefs(competitor.tractionClaimIds); if (competitor.tractionClaimIds.some(id => !['reported_metric', 'public_proxy', 'unknown'].includes(claimMap.get(id)!.basis))) fail('Keep traction metrics/proxies distinct from general observations.'); }
  claimRefs(c.feedbackClaimIds);
  if (c.feedbackClaimIds.some(id => claimMap.get(id)!.basis !== 'founder_reported')) fail('Feedback must retain its founder-reported provenance.');
  c.adjacent.forEach(item => claimRefs(item.reasonClaimIds));
  for (const h of c.habitats) {
    claimRefs(h.observedClaimIds); sourceRefs(h.participation.sourceIds);
    if (h.participation.verified && (!h.participation.route || !h.participation.sourceIds.length || h.participation.sourceIds.some(id => { const s = sourceMap.get(id)!; return s.archived || !['inspected', 'provided'].includes(s.access); }))) fail('A verified participation route needs an inspected, unarchived source. Relevance alone is not permission.');
  }
  refs(c.firstUserAvenues, new Map(c.habitats.map(h => [h.id, h])), 'habitat');
  unique(c.redTeam.map(item => item.claimId), 'Red-team claims'); c.redTeam.forEach(item => claimRefs([item.claimId]));
  const intent = c.intention;
  if ((intent.status === 'provided') !== (intent.goal !== 'unknown' && intent.statement !== null)) fail('Retain the supplied intention or its actual unknown/skipped disposition.');
  if (intent.status !== 'provided' && (intent.goal !== 'unknown' || intent.statement !== null)) fail('Do not invent a skipped or undecided intention.');
  if (intent.status === 'provided' && !intent.advice) fail('Explain briefly how the intention shapes advice.');
  unique(c.evaluation.coverage.map(item => item.topic), 'Evaluation topics');
  for (const item of c.evaluation.coverage) {
    claimRefs(item.claimIds); refs(item.runIds, runs, 'research run');
    if (item.status === 'findings' && !item.claimIds.length) fail('Coverage findings need referenced evidence.');
    if (item.status === 'unknown_after_search' && !item.runIds.some(id => { const run = runs.get(id)!; return run.queries.length > 0 || run.inspectedSourceIds.length > 0; })) fail('Unknown after search requires an actual recorded attempt.');
  }
  if (c.evaluation.status === 'ready') {
    if (c.stage !== 'evaluate' || intent.status !== 'provided' || !c.definition.problem.text || !c.evaluation.conclusion) fail('Normal action readiness needs understood intention, a defined problem and an evaluation synthesis.');
    if (c.evaluation.coverage.length !== coverageTopics.length || c.evaluation.coverage.some(item => item.status === 'unexamined')) fail('Evaluate the relevant coverage before recommending an action; unknowns need attempted research or a relevance reason.');
    if (!c.research.some(run => run.inspectedSourceIds.length && run.stopReason !== 'unavailable')) fail('A brief assessment without inspected research is not meaningful Evaluate.');
    for (const topic of ['competitors', 'user_language', 'habitats'] as const) {
      const coverage = c.evaluation.coverage.find(item => item.topic === topic)!;
      if (coverage.status === 'not_relevant') fail('Competitor, user-language and habitat investigation are core Evaluate work. Record an attempted limitation rather than skipping them.');
      if (!coverage.runIds.length) fail('Core Evaluate coverage needs a research receipt.');
    }
    const inspected = c.research.flatMap(run => run.inspectedSourceIds).map(id => sourceMap.get(id)!);
    if (!inspected.some(s => ['discussion', 'review', 'founder'].includes(s.kind))) {
      if (c.evaluation.coverage.find(item => item.topic === 'user_language')!.status !== 'unknown_after_search') fail('Vendor marketing alone does not establish user-language research.');
    }
    if (!c.competitors.length || !c.evaluation.promising.length || !c.evaluation.weak.length || !c.evaluation.unknowns.length) fail('Retain considered alternatives, promising/weak findings and unknowns in the synthesis.');
  }
  if (c.master && (c.evaluation.status !== 'ready' || c.claims.filter(item => item.important).some(item => !c.redTeam.some(review => review.claimId === item.id)))) fail('A startup master requires a ready evaluation and red-team review of important claims.');
  for (const choice of c.brief.choices) {
    if (['interview', 'shape_mvp', 'master'].includes(choice.action) && c.evaluation.status !== 'ready') fail('Finish meaningful Evaluate before normal interview, MVP or master choices. An explicit build request remains possible.');
    if (choice.action === 'build_requested' && !c.buildRequest) fail('Do not promote Build now before an actual explicit request.');
  }
  const briefText = [c.brief.summary, ...c.brief.seeing, ...c.brief.matters, c.brief.next, ...c.brief.questions, ...c.brief.choices.map(item => item.label)].join(' ');
  if ((briefText.match(/[?？]/gu)?.length ?? 0) > 2) fail('Ask at most two material questions; normally one.');
  const sentences = [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(c.brief.summary)];
  const briefWordCount = briefText.trim().split(/\s+/u).length;
  const shortAcknowledgment = c.brief.kind === 'conversation' && briefWordCount <= 35 && !c.brief.seeing.length && !c.brief.matters.length && c.brief.questions.length <= 1;
  if (sentences.length < (shortAcknowledgment ? 1 : 2) || sentences.length > 5) fail('Begin substantial replies with an executive summary of two to five short sentences. A short acknowledgment needs no padding.');
  // Include labels/optional sentence allowance; final rendering is also checked by tests.
  if (briefWordCount > (c.brief.kind === 'research' ? 174 : 124)) fail('Shorten the visible reply; retain the research in optional detail.');
}
