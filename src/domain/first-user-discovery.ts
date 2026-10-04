import { plain } from './conversation.js';
import { createHash } from 'node:crypto';
import type { AnyPrebuild, IdeContext } from './ide.js';

export type DiscoveryChannels = 'online' | 'local' | 'both';
export type DiscoveryOutcome = 'not_run' | 'ready' | 'partial' | 'no_results' | 'unavailable' | 'declined';

/** Optional, source-backed people/handles or route cards. A card is a review
 * candidate, never a lead, contact permission or willingness-to-talk claim. */
export interface FirstUserCard {
  id: string;
  kind: 'person' | 'community' | 'business' | 'event' | 'place';
  displayName: string;
  subjectKey: string;
  relationship: 'intended_user' | 'buyer' | 'expert' | 'gatekeeper' | 'adjacent' | 'unknown';
  observed: string;
  fitInference: string;
  uncertainty: string;
  sourceIds: string[];
  route: string | null;
  routeStatus: 'reviewed' | 'check_rules' | 'unavailable';
  firsthand: boolean;
  scopeKey?: string;
  usePermission?: 'permitted' | 'unknown' | 'restricted';
}

export interface FirstUserDiscovery {
  channels: DiscoveryChannels;
  region: string | null;
  outcome: DiscoveryOutcome;
  runIds: string[];
  limitation: string;
  suppressedSubjectKeys?: string[];
}

export function discoveryScope(c: AnyPrebuild): string {
  return createHash('sha256').update(JSON.stringify([c.intention.statement,c.definition.user.text,c.definition.problem.text,c.contractVersion===2?c.discovery?.region:null])).digest('hex');
}
export function discoveryCards(c: AnyPrebuild): FirstUserCard[] {
  if(c.contractVersion!==2)return [];
  return (c.firstUserCards??[]).filter(card=>!(c.discovery?.suppressedSubjectKeys??[]).includes(card.subjectKey)
    && card.scopeKey===discoveryScope(c) && card.usePermission==='permitted'
    && card.sourceIds.every(id=>c.sources.some(s=>s.id===id&&!s.archived&&s.access!=='unavailable')));
}

export function validateFirstUserCards(c: AnyPrebuild): void {
  const cards = c.contractVersion===2 ? c.firstUserCards??[] : [];
  if (cards.length > 3) throw new Error('Keep up to three source-backed first-user candidates; relevance matters more than volume.');
  const sourceMap = new Map(c.sources.map(source => [source.id, source]));
  const ids = new Set<string>();
  for (const card of cards) {
    if (ids.has(card.id)) throw new Error('First-user card identities must be unique.');
    ids.add(card.id);
    if (![card.displayName, card.subjectKey, card.observed, card.fitInference, card.uncertainty].every(value => plain(value).length > 0)) throw new Error('First-user cards need observed context, fit limits and uncertainty.');
    if (!card.sourceIds.length) throw new Error('A first-user card needs retained source references.');
    for (const id of card.sourceIds) {
      const source = sourceMap.get(id);
      if (!source || source.access === 'unavailable' || source.archived) throw new Error('First-user cards cannot rely on unavailable or archived sources.');
      if (!['public', 'founder_report', 'artifact_observation', 'synthetic_fixture'].includes(source.provenance)) throw new Error('First-user cards need attributed source provenance.');
    }
    if (card.routeStatus === 'reviewed' && !card.route) throw new Error('A reviewed first-user route needs the observed route.');
    if (card.routeStatus === 'reviewed' && !card.sourceIds.some(id=>sourceMap.get(id)?.access==='inspected')) throw new Error('A reviewed route requires an inspected source, not a snippet.');
    if (!c.synthetic && card.sourceIds.some(id=>sourceMap.get(id)?.provenance==='synthetic_fixture')) throw new Error('Synthetic candidates cannot become live discovered users.');
    if (card.kind === 'person' && /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(card.displayName)) throw new Error('Keep personal email addresses out of first-user cards; use an observed public route.');
  }
  if(c.contractVersion===2&&c.discovery){
    if(c.discovery.runIds.some(id=>!c.research.some(run=>run.id===id)))throw new Error('Discovery receipts must refer to retained research.');
    if(['ready','partial','no_results'].includes(c.discovery.outcome)&&!c.discovery.runIds.length)throw new Error('A discovery outcome requires an actual retained research receipt.');
  }
}

export function discoveryPlan(c: AnyPrebuild): object {
  const channels = c.contractVersion === 2 ? ((c as IdeContext).discovery?.channels ?? 'online') : 'online';
  const region = c.contractVersion === 2 ? ((c as IdeContext).discovery?.region ?? null) : null;
  const role = plain(c.definition.user.text ?? 'the confirmed user');
  const job = plain(c.definition.job.text ?? c.definition.problem.text ?? 'the confirmed workflow');
  const pain = plain(c.definition.pain.text ?? c.definition.problem.text ?? 'the reported pain');
  return {
    owner: 'Crumb prepares the bounded research plan; the host must inspect permitted sources and record actual receipts.',
    scope: { channels, region },
    scopeKey: discoveryScope(c),
    bounds: { maxQueries: 6, maxInspectedPages: 10, reuseExisting: true },
    terms: { role, job, pain },
    routes: ['specific pain discussions', 'relevant online communities', ...(channels !== 'online' ? ['appropriate local businesses, associations or events'] : []), 'source-backed named professionals or public handles only where permitted'],
    queries: [
      `${role} ${job} discussion workaround`,
      `${role} ${pain} alternatives`,
      ...(channels !== 'online' && region ? [`${role} ${region} association events`, `${role} ${region} business directory`] : []),
      `${role} ${job} professional community`,
    ].slice(0, 6),
    constraints: ['Do not infer a city, address or device location.', 'A public URL is not collection or outreach permission.', 'Do not deanonymize, merge similar handles, scrape private groups or send messages.', 'Record snippet-only, unavailable, stale and not-searched routes honestly.'],
  };
}

function cardLine(card: FirstUserCard): string {
  const route = card.routeStatus === 'reviewed' && card.route ? `Route: ${plain(card.route)}.` : card.routeStatus === 'check_rules' ? 'Route found; check participation rules before using it.' : 'No usable route is established.';
  const relationship = card.relationship === 'unknown' ? 'relationship not established' : card.relationship.replaceAll('_', ' ');
  return `${plain(card.displayName)} (${relationship}) — ${plain(card.observed)} Fit: ${plain(card.fitInference)} Unknown: ${plain(card.uncertainty)} ${route} No willingness or contact permission is inferred.`;
}

/** The concise end-of-Evaluate bridge. It reports what is stored; it never
 * claims that a search, conversation or outreach happened. */
export function firstUserDiscoveryNotice(c: AnyPrebuild): string {
  const avenues = c.firstUserAvenues.map(id => c.habitats.find(h => h.id === id)).filter(Boolean).slice(0, 3) as NonNullable<ReturnType<typeof c.habitats.find>>[];
  const cards = discoveryCards(c).slice(0, 3);
  if (!avenues.length && !cards.length) return 'I do not have a source-backed first-user route yet. That is a research limitation, not evidence that the audience is absent.';
  const places = avenues.map(h => `${plain(h.place)} — ${plain(h.relevance)}`).join(' ');
  const people = cards.length ? ` ${cards.map(card=>{
    const source=c.sources.find(s=>s.id===card.sourceIds[0])!;
    return `${plain(card.displayName)}: ${plain(card.fitInference).slice(0,180)} (${source.access}: ${plain(source.url??source.title)}; willingness unknown).`;
  }).join(' ')}` : '';
  const limits = avenues.some(h => !h.participation.verified) || cards.some(card => card.routeStatus !== 'reviewed') ? ' Access or participation rules still need checking; I have not contacted anyone.' : ' These are research routes, not permission to contact.';
  return `The saved research points to ${places||'these first-user candidates'}.${people}${limits}`;
}

export function firstUserScopeQuestion(c: AnyPrebuild): string | null {
  if (c.contractVersion !== 2) return null;
  const d = (c as IdeContext).discovery;
  if (d && d.channels !== 'online' && !plain(d.region ?? '')) return 'Would online routes be enough, or should I search a particular city or region?';
  return null;
}
