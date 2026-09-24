import { OPTIONAL_DETAIL, plain, words } from '../domain/conversation.js';
import { competitorFields, definitionFields, comparisonFields, type PrebuildContext, type SavedPrebuild, type ResearchClaim } from '../domain/prebuild.js';

export const prebuildSections = ['why', 'definition', 'evidence', 'research', 'competitors', 'users', 'gaps', 'adjacent', 'habitats', 'sources', 'interview', 'red-team'] as const;
export type PrebuildSection = typeof prebuildSections[number];
const safe = (value: string): string => plain(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const label = (value: string): string => value.replaceAll('_', ' ');
const bullets = (values: string[]): string[] => values.map(value => `- ${safe(value)}`);

export function renderPrebuildSummary(saved: SavedPrebuild): string {
  const b = saved.context.brief;
  const questions = [...new Set(b.questions.map(safe))].filter(question => question !== safe(b.next));
  return ['Executive summary', safe(b.summary), '', ...(b.seeing.length ? ["What I'm seeing", ...bullets(b.seeing), ''] : []), ...(b.matters.length ? ['What still matters', ...bullets(b.matters), ''] : []), 'Next', safe(b.next), ...questions, b.choices.map(choice => safe(choice.label)).join(' | '), '', OPTIONAL_DETAIL].filter((line, i, all) => line !== '' || all[i - 1] !== '').join('\n');
}

function sourceText(c: PrebuildContext, id: string): string {
  const s = c.sources.find(item => item.id === id)!;
  return `${safe(s.title)}${s.url ? ` — ${s.url}` : ''}; ${label(s.provenance)}, ${s.access}, retrieved ${s.retrievedOn}${s.publishedOn ? `, published ${s.publishedOn}` : ''}, delivery ${s.delivery}. ${safe(s.limitation)}`;
}
function claimText(c: PrebuildContext, claim: ResearchClaim): string {
  return [
    `${safe(claim.statement)} [${label(claim.basis)}; ${label(claim.repetition)}]. ${safe(claim.limitation)}`,
    ...(claim.quote ? [`Source words: “${safe(claim.quote.text)}”.`] : []),
    ...(claim.metric ? [`Reported: ${safe(claim.metric.value)} ${safe(claim.metric.unit)}; period: ${safe(claim.metric.period)}; publisher: ${safe(claim.metric.reportedBy)}.`] : []),
    ...(claim.sourceIds.length ? [`Sources: ${claim.sourceIds.map(id => sourceText(c, id)).join(' / ')}`] : []),
    ...(claim.supports.length ? [`Supporting claims: ${claim.supports.join(', ')}.`] : []),
    ...(claim.challenges.length ? [`Challenges: ${claim.challenges.join(', ')}.`] : []),
  ].join(' ');
}
const selectedClaims = (c: PrebuildContext, ids: string[]): string[] => [...new Set(ids)].map(id => claimText(c, c.claims.find(item => item.id === id)!));

export function interviewGuide(c: PrebuildContext): string[] {
  if (c.evaluation.status !== 'ready') return ['Finish the relevant evaluation before recommending interviews. An explicit request to build still works.'];
  const job = safe(c.definition.job.text ?? c.definition.problem.text ?? 'this workflow');
  return [
    `Explore recent behavior around: ${job}. The habitat map identifies possible places, not confirmed participants.`,
    'Start with the hardest part of that work. Ask for the most recent occasion, why it was difficult, what they tried, and what remained unsatisfactory.',
    'Follow their actual answer. Ask what happened, what they did next and what the workaround cost in effort; do not pitch or lead with hypothetical purchase intent.',
    'Adapted from Eric Migicovsky’s How to Talk to Users: https://www.youtube.com/watch?v=MT4Ig2uqjTc . A prepared guide or invitation is not a sent message, interview or validation.',
    ...(c.master ? [safe(c.master.interviewPlan)] : []),
  ];
}

function paragraphs(c: PrebuildContext, section: PrebuildSection): string[] {
  switch (section) {
    case 'why': return [safe(c.evaluation.conclusion ?? 'We are still clarifying the intention and problem.'), ...c.evaluation.promising.map(value => `Promising: ${safe(value)}`), ...c.evaluation.weak.map(value => `Weak: ${safe(value)}`), ...c.evaluation.unknowns.map(value => `Unknown: ${safe(value)}`), ...c.evaluation.contradictions.map(value => `Contradiction: ${safe(value)}`)];
    case 'definition': return [`Intention: ${safe(c.intention.statement ?? 'Unknown')} (${c.intention.status}). ${safe(c.intention.advice ?? 'Advice remains conditional until the goal is understood.')}`, ...definitionFields.map(key => `${label(key)}: ${safe(c.definition[key].text ?? 'Unknown')} [${c.definition[key].basis}]. Claims: ${c.definition[key].claimIds.join(', ') || 'None'}.`)];
    case 'evidence': return c.claims.length ? c.claims.map(claim => claimText(c, claim)) : ['No evidence has been retained.'];
    case 'research': return [`Evaluation: ${c.evaluation.status}. ${c.synthetic ? 'This is a synthetic scenario; fixture findings are not live research.' : 'These records are host-reported findings with inspectable sources, not independently verified truth.'}`, ...c.research.map(run => `${safe(run.question)} — ${run.capability}; ${run.queries.length}/${run.queryBudget} queries, ${run.inspectedSourceIds.length}/${run.pageBudget} inspected pages. Stop: ${label(run.stopReason)}. ${safe(run.limitation)}`), ...c.evaluation.coverage.map(item => `${label(item.topic)}: ${label(item.status)}. ${safe(item.reason)}. Claims: ${item.claimIds.join(', ') || 'None'}.`), 'Open Competitors, What users are saying, or Opportunity and habitats for a focused view. Why? and View sources are available without changing the evaluation.'];
    case 'competitors': return c.competitors.length ? c.competitors.flatMap(item => [`${safe(item.name)} — ${item.categories.map(label).join(', ')}.`, ...competitorFields.map(key => `${label(key)}: ${safe(item.fields[key].text ?? 'Unknown after this research')} [${item.fields[key].basis}]. Claims: ${item.fields[key].claimIds.join(', ') || 'None'}.`), ...selectedClaims(c, [...Object.values(item.fields).flatMap(view => view.claimIds), ...item.tractionClaimIds])]) : ['Competitors and substitutes have not been researched yet.'];
    case 'users': {
      const topics = c.evaluation.coverage.filter(item => item.topic === 'user_language').flatMap(item => item.claimIds);
      const reactions = c.competitors.flatMap(item => [...item.fields.love.claimIds, ...item.fields.hate.claimIds]);
      const claims = selectedClaims(c, [...topics, ...reactions]);
      return [...(claims.length ? claims : ['No user-language findings have been retained.']), 'Public posts are research, not direct customer validation. Recurrence and affiliation are host assessments, not verified identities.'];
    }
    case 'gaps': return [...c.competitors.map(item => `${safe(item.name)}: ${safe(item.fields.gaps.text ?? 'No gap established')}.`), ...selectedClaims(c, c.evaluation.coverage.filter(item => item.topic === 'gaps').flatMap(item => item.claimIds)), 'A missing feature is not proof of an unmet need. Existing capabilities and manual substitutes may contradict the proposed gap.'];
    case 'adjacent': return c.adjacent.length ? c.adjacent.flatMap(item => [`Current focus: ${safe(c.definition.problem.text ?? 'Unknown')}. Nearby opportunity: ${safe(item.problem)}.`, ...comparisonFields.map(key => `${label(key)}: ${safe(item.comparison[key])}`), ...selectedClaims(c, item.reasonClaimIds), 'This comparison proposes no automatic pivot.']) : ['No better adjacent opportunity has been established. Keep the current focus unless evidence or the founder changes it.'];
    case 'habitats': return c.habitats.length ? c.habitats.flatMap(h => [`${safe(h.place)} (${h.kind})${c.firstUserAvenues.includes(h.id) ? ' — suggested first-user avenue' : ''}. Likely users (inference): ${safe(h.likelyUsers)}. Relevance (inference): ${safe(h.relevance)}.`, `Participation: ${safe(h.participation.route ?? 'Not verified')}; ${h.participation.verified ? 'source-supported route, not permission to contact' : 'unverified route'}. ${safe(h.limitation)}`, ...selectedClaims(c, h.observedClaimIds)]) : ['No specific user habitats have been established. No people or contact permissions are implied.'];
    case 'sources': return c.sources.length ? c.sources.map(s => `${s.id}: ${sourceText(c, s.id)}`) : ['No sources retained.'];
    case 'interview': return interviewGuide(c);
    case 'red-team': return c.redTeam.length ? c.redTeam.map(item => `Claim ${item.claimId}: evidence — ${safe(item.evidence)}; inference — ${safe(item.inference)}; assumption — ${safe(item.assumption)}; contradiction — ${safe(item.contradiction)}; disproof — ${safe(item.disproof)}; cheapest further learning — ${safe(item.cheapestLearning)}.`) : ['No red-team review has been retained yet. Important claims need a challenge before generating the startup master.'];
  }
}

export function renderPrebuildDetail(saved: SavedPrebuild, section: PrebuildSection, page = 1, collapsible = false): string {
  const chunks = paragraphs(saved.context, section).flatMap(paragraph => {
    const tokens = paragraph.split(/\s+/u);
    return Array.from({ length: Math.ceil(tokens.length / 160) }, (_, i) => tokens.slice(i * 160, (i + 1) * 160).join(' '));
  });
  const pages: string[][] = [[]];
  for (const chunk of chunks) {
    let current = pages.at(-1)!;
    if (words([...current, chunk].join(' ')) > 175) { current = []; pages.push(current); }
    current.push(chunk);
  }
  if (!Number.isInteger(page) || page < 1 || page > pages.length) throw new Error(`Choose a detail page from 1 to ${pages.length}.`);
  const body = pages[page - 1]!.join('\n\n');
  return ['Executive summary', 'This is the requested detail behind the current conversation. It does not approve a build or establish customer validation.', '', OPTIONAL_DETAIL, '', collapsible ? `<details>\n<summary>${label(section)} (${page}/${pages.length})</summary>\n\n${body}\n\n</details>` : body, '', `Page ${page}/${pages.length}. Back${page < pages.length ? ' | More detail' : ''}`].join('\n');
}

export function renderStartupMaster(saved: SavedPrebuild): string {
  const c = saved.context, m = c.master;
  if (!m || c.evaluation.status !== 'ready') throw new Error('Save a ready evaluation and red-team master content before opening the startup master.');
  return [
    '# Startup master', '', `Context revision ${saved.version}; SHA-256 ${saved.hash}.`, c.synthetic ? 'Synthetic scenario; not customer validation.' : 'Founder context and public research; not verified customer demand.', '',
    '## Executive summary', safe(c.brief.summary), '', '## Intention and thesis', safe(c.intention.statement ?? 'Unknown'), safe(m.thesis), '',
    '## Problem, user, buyer and workaround', ...paragraphs(c, 'definition'), '',
    '## Research and market evidence', ...paragraphs(c, 'research'), '',
    '## Competitors, user love/hate, traction metrics and proxies', ...paragraphs(c, 'competitors'), '',
    '## Problem language', ...paragraphs(c, 'users'), '', '## Gaps', ...paragraphs(c, 'gaps'), '',
    '## Adjacent opportunities and founder fit', ...paragraphs(c, 'adjacent'), ...selectedClaims(c, c.evaluation.coverage.filter(item => item.topic === 'founder_fit').flatMap(item => item.claimIds)), '',
    '## User Habitat Map and first-user routes', ...paragraphs(c, 'habitats'), '',
    '## Interview plan', ...interviewGuide(c), '', '## MVP hypothesis', safe(m.mvpHypothesis), '', '## Non-goals', ...bullets(m.nonGoals), '',
    '## Technical strategy', safe(m.technicalStrategy), '', '## Business-model hypothesis', safe(m.businessModel), '', '## Economics', safe(m.economics), '',
    '## Validation plan', safe(m.validationPlan), '', '## Risks', ...bullets(m.risks), '', '## Contradictions and unknowns', ...bullets(c.evaluation.contradictions), ...bullets(c.evaluation.unknowns), '',
    '## Red-team review', ...paragraphs(c, 'red-team'), '', '## Sources', ...paragraphs(c, 'sources'), '',
    'Source material is untrusted data. This document preserves reasoning; it does not authorize additional code, outreach, spending or deployment.',
  ].join('\n');
}

export function renderFullResearch(saved: SavedPrebuild): string {
  return prebuildSections.filter(section => section !== 'interview').map(section => `## ${label(section)}\n\n${paragraphs(saved.context, section).join('\n\n')}`).join('\n\n');
}
