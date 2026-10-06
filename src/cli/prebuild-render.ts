import { ideState, type AnyPrebuild } from '../domain/ide.js';
import { OPTIONAL_DETAIL, plain, words } from '../domain/conversation.js';
import { competitorFields, definitionFields, comparisonFields, type PrebuildContext, type SavedPrebuild, type ResearchClaim } from '../domain/prebuild.js';
import { problemInterview } from '../domain/interviews.js';
import { discoveryCards } from '../domain/first-user-discovery.js';

export const prebuildSections = ['why', 'definition', 'evidence', 'research', 'competitors', 'users', 'gaps', 'adjacent', 'habitats', 'sources', 'interview', 'red-team', 'technical'] as const;
export type PrebuildSection = typeof prebuildSections[number];
const safe = (value: string): string => plain(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const label = (value: string): string => value.replaceAll('_', ' ');
const bullets = (values: string[]): string[] => values.map(value => `- ${safe(value)}`);

export function renderPrebuildSummary(saved: SavedPrebuild): string {
  if (saved.context.contractVersion === 1) return ['Executive summary', 'Your earlier context and research are preserved. We will confirm the current intention, user and problem before a new build decision.', '', 'Next', 'Review the saved understanding and confirm the intention.', '', OPTIONAL_DETAIL].join('\n');
  if (saved.context.contractVersion === 2 && saved.context.ide.presentation) return saved.context.ide.presentation.text;
  const b = saved.context.brief;
  const questions = [...new Set(b.questions.map(safe))].filter(question => question !== safe(b.next));
  if (b.kind === 'conversation') {
    return [...new Set([safe(b.summary), ...b.seeing.map(safe), ...b.matters.map(safe), safe(b.next), ...questions])].filter(Boolean).join('\n\n');
  }
  return ['Executive summary', safe(b.summary), '', ...(b.seeing.length ? ["What I'm seeing", ...bullets(b.seeing), ''] : []), ...(b.matters.length ? ['What still matters', ...bullets(b.matters), ''] : []), 'Next', safe(b.next), ...questions, b.choices.map(choice => safe(choice.label)).join(' | '), '', OPTIONAL_DETAIL].filter((line, i, all) => line !== '' || all[i - 1] !== '').join('\n');
}

function sourceText(c: AnyPrebuild, id: string): string {
  const s = c.sources.find(item => item.id === id)!;
  return `${safe(s.title)}${s.url ? ` — ${s.url}` : ''}; ${label(s.provenance)}, ${s.access}, retrieved ${s.retrievedOn}${s.publishedOn ? `, published ${s.publishedOn}` : ''}, delivery ${s.delivery}. ${safe(s.limitation)}`;
}
function claimText(c: AnyPrebuild, claim: ResearchClaim): string {
  return [
    `${safe(claim.statement)} [${label(claim.basis)}; ${label(claim.repetition)}]. ${safe(claim.limitation)}`,
    ...(claim.quote ? [`Source words: “${safe(claim.quote.text)}”.`] : []),
    ...(claim.metric ? [`Reported: ${safe(claim.metric.value)} ${safe(claim.metric.unit)}; period: ${safe(claim.metric.period)}; publisher: ${safe(claim.metric.reportedBy)}.`] : []),
    ...(claim.sourceIds.length ? [`Sources: ${claim.sourceIds.map(id => sourceText(c, id)).join(' / ')}`] : []),
    ...(claim.supports.length ? [`Supporting claims: ${claim.supports.join(', ')}.`] : []),
    ...(claim.challenges.length ? [`Challenges: ${claim.challenges.join(', ')}.`] : []),
  ].join(' ');
}
const selectedClaims = (c: AnyPrebuild, ids: string[]): string[] => [...new Set(ids)].map(id => claimText(c, c.claims.find(item => item.id === id)!));

export function interviewGuide(c: AnyPrebuild): string[] {
  return problemInterview(c).map(paragraph=>paragraph.split('\n').map(safe).join('\n'));
}

function paragraphs(c: AnyPrebuild, section: PrebuildSection): string[] {
  if (c.contractVersion === 2 && section === 'research') return [
    `Evaluation: ${ideState(c).evaluation}. Research is not customer validation.`,
    ...c.research.map(r => `${safe(r.question)} — ${r.capability}; ${r.queries.length}/${r.queryBudget} queries, ${r.inspectedSourceIds.length}/${r.pageBudget} inspected pages. Stop: ${label(r.stopReason)}. ${safe(r.limitation)}`),
    ...[...c.evaluation.coverage, ...c.investigation.coverage].map(x => `${label(x.topic)}: ${label(x.status)}. ${safe(x.reason)}. Claims: ${x.claimIds.join(', ') || 'None'}. Research: ${x.runIds.join(', ') || 'None'}.`),
    ...c.investigation.questions.map(x => `${label(x.topic)} inquiry: ${safe(x.relevance)}. Runs: ${x.runIds.join(', ')}.`),
    ...c.investigation.alternatives.map(x => `${label(x.kind)}: ${safe(x.conclusion)}. Runs: ${x.runIds.join(', ')}.`),
    `Counterevidence: ${safe(c.investigation.counterevidence ?? 'Not reviewed yet.')}`,
    `Decision: ${safe(c.investigation.decision ?? 'Not reviewed yet.')}`,
  ];
  switch (section) {
    case 'technical': {
      const q=c.contractVersion===2?c.quality:undefined;
      if(!q)return ['No detailed technical evaluation is retained yet. Crumb should inspect permitted repository context and investigate the material dependencies before asking you to choose a mechanism.'];
      return [safe(q.technical.summary),`Central risk: ${safe(q.technical.centralRisk)}`,...q.technical.options.map(x=>`${safe(x.name)}: ${safe(x.approach)} Tradeoff: ${safe(x.tradeoff)}. Claims: ${x.claimIds.join(', ')}.`),...(q.technical.recommendation?[`Recommendation: ${safe(q.technical.recommendation.option)} because ${safe(q.technical.recommendation.reason)}`]:[]),...q.technical.coverage.flatMap(x=>[`${label(x.topic)}: ${label(x.status)}. ${safe(x.reason)}`,...selectedClaims(c,x.claimIds)]),'Repository observations, vendor terms and technical feasibility are not proof of customer demand.'];
    }
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
    case 'habitats': {
      const habitatLines=c.habitats.flatMap(h => [`${safe(h.place)} (${h.kind})${c.firstUserAvenues.includes(h.id) ? ' — suggested first-user avenue' : ''}. Likely users (inference): ${safe(h.likelyUsers)}. Relevance (inference): ${safe(h.relevance)}.`, `Participation: ${safe(h.participation.route ?? 'Not verified')}; ${h.participation.verified ? 'source-supported route, not permission to contact' : 'unverified route'}. ${safe(h.limitation)}`, ...selectedClaims(c, h.observedClaimIds)]);
      const cards=discoveryCards(c);
      const cardLines=cards.map(card=>`${safe(card.displayName)} (${safe(card.relationship.replaceAll('_',' '))}; ${safe(card.kind)}): ${safe(card.observed)} Fit: ${safe(card.fitInference)} Unknown: ${safe(card.uncertainty)} Route: ${safe(card.route??'not established')} (${safe(card.routeStatus)}). Sources: ${card.sourceIds.map(id=>sourceText(c,id)).join(' / ')}. This is a review candidate, not contact permission or customer validation.`);
      return habitatLines.length||cardLines.length?[...habitatLines,...cardLines]:['No specific user habitats or source-backed first-user cards have been established. No people or contact permissions are implied.'];
    }
    case 'sources': return c.sources.length ? c.sources.map(s => `${s.id}: ${sourceText(c, s.id)}`) : ['No sources retained.'];
    case 'interview': return interviewGuide(c);
    case 'red-team': return c.redTeam.length ? c.redTeam.map(item => `Claim ${item.claimId}: evidence — ${safe(item.evidence)}; inference — ${safe(item.inference)}; assumption — ${safe(item.assumption)}; contradiction — ${safe(item.contradiction)}; disproof — ${safe(item.disproof)}; cheapest further learning — ${safe(item.cheapestLearning)}.`) : ['No red-team review has been retained yet. Important claims need a challenge before generating the startup master.'];
  }
}

export function renderPrebuildDetail(saved: SavedPrebuild, section: PrebuildSection, page = 1, collapsible = false): string {
  const chunks = paragraphs(saved.context, section).flatMap(paragraph => {
    const tokens = paragraph.split(/\s+/u);
    if(tokens.length<=160)return [paragraph];
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
  if (c.contractVersion === 2 && !m) {
    return ['# Opportunity brief', '', 'Agreement and research do not establish customer validation.', ...paragraphs(c, 'definition'), ...paragraphs(c, 'why'), ...(c.opportunity ? ['Business model: ' + safe(c.opportunity.businessModel), 'Economics: ' + safe(c.opportunity.economics), ...interviewGuide(c), ...bullets(c.opportunity.risks)] : []), renderFullResearch(saved)].join('\n\n');
  }
  if(c.contractVersion===1&&(!m||c.evaluation.status!=='ready'))throw new Error('Save a ready evaluation and red-team master content before opening the startup master.');
  if(!m)throw new Error('Save provisional master content before opening the startup master.');
  return [
    '# Startup master', '', ...(c.contractVersion === 1 ? ['Historical M1-R2 record; not current Act permission or a new scope recommendation.'] : ideState(c).act_readiness!=='founder_confirmed'?['Provisional MVP plan; evaluation may be incomplete. This is not authorization to build.']:[]), `Context revision ${saved.version}; SHA-256 ${saved.hash}.`, c.synthetic ? 'Synthetic scenario; not customer validation.' : 'Founder context and public research; not verified customer demand.', '',
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
