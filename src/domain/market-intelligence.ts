/** Bounded decision aids. Host research supplies evidence; these functions never browse or contact anyone. */
export interface MarketPulseInput {
  user: string; problem: string; product?: string;
  decision: string; externalEvidence: 'current' | 'stale' | 'none';
  materialGap: boolean; localMarket: boolean; region?: string | null;
}
export function planMarketPulse(input: MarketPulseInput) {
  if (!input || typeof input !== 'object' || typeof input.user !== 'string' || typeof input.problem !== 'string' || typeof input.decision !== 'string' || typeof input.materialGap !== 'boolean' || typeof input.localMarket !== 'boolean' || !['current','stale','none'].includes(input.externalEvidence) || [input.user,input.problem,input.decision].some(x=>x.length>400) || (input.region!=null && (typeof input.region!=='string'||input.region.length>120))) throw new Error('Describe one bounded market decision.');
  const ready=!!input.user.trim()&&!!input.problem.trim()&&!!input.decision.trim();
  if (!ready) return {action:'clarify' as const,queries:[],maxQueries:0,maxPages:0,reason:'Understand the initial user, pain and decision first.'};
  if (!input.materialGap) return {action:'answer' as const,queries:[],maxQueries:0,maxPages:0,reason:'External evidence would not change this decision.'};
  if (input.localMarket && !input.region?.trim()) return {action:'ask_region' as const,queries:[],maxQueries:0,maxPages:0,reason:'Use a city or region before searching a local market.'};
  if (input.externalEvidence==='current') return {action:'reuse' as const,queries:[],maxQueries:0,maxPages:0,reason:'Reuse current source-backed findings.'};
  const scope=[input.user.trim(),input.problem.trim(),input.region?.trim()].filter(Boolean).join(' ');
  return {action:'research' as const,queries:[`${scope} recurring complaints workaround`,`${scope} alternatives pricing`,`${scope} community discussion`],maxQueries:3,maxPages:6,followUpBatches:1,reason:'One early pulse: inspect current public pain, workarounds, alternatives and spending. Follow up only for a material contradiction or gap.'};
}

export type MarketSignalKind = 'pain'|'frequency'|'workaround'|'spend'|'reach'|'growth'|'alternative'|'engagement';
export interface MarketSignal {
  kind: MarketSignalKind; segment: string; observation: string; sourceUrl: string;
  retrievedOn: string; independentSource: string; access: 'inspected'|'snippet'|'unavailable';
  directUser: boolean;
}
export interface OpportunityInput {
  segment: string; pain: string; productFit: string; founderAdvantage: string;
  signals: MarketSignal[];
}
const kinds: MarketSignalKind[]=['pain','frequency','workaround','spend','reach','growth','alternative','engagement'];
const nonempty=(s:unknown,max:number)=>typeof s==='string'&&!!s.trim()&&s.length<=max;
export function assessOpportunity(input: OpportunityInput) {
  if(!input||!nonempty(input.segment,160)||!nonempty(input.pain,300)||!nonempty(input.productFit,300)||!nonempty(input.founderAdvantage,300)||!Array.isArray(input.signals)||input.signals.length>12)throw new Error('Use a compact segment, pain, fit, advantage and up to twelve signals.');
  for(const s of input.signals){
    if(!s||!kinds.includes(s.kind)||!nonempty(s.segment,160)||!nonempty(s.observation,500)||!nonempty(s.independentSource,160)||!['inspected','snippet','unavailable'].includes(s.access)||typeof s.directUser!=='boolean'||!/^\d{4}-\d{2}-\d{2}$/.test(s.retrievedOn)||Number.isNaN(Date.parse(s.retrievedOn))||new Date(s.retrievedOn).toISOString().slice(0,10)!==s.retrievedOn)throw new Error('Each signal needs kind, segment, observation, independent source, access and retrieval date.');
    try{const u=new URL(s.sourceUrl);if(u.protocol!=='https:'||u.username||u.password)throw new Error();}catch{throw new Error('Each market signal needs a public HTTPS source URL.');}
  }
  const usable=input.signals.filter(s=>s.access==='inspected'&&s.segment.trim().toLowerCase()===input.segment.trim().toLowerCase());
  const by=(kind:MarketSignalKind)=>usable.filter(s=>s.kind===kind);
  const independent=[...new Set(usable.map(s=>s.independentSource))].length;
  const direct=usable.some(s=>s.directUser&&['pain','workaround','spend'].includes(s.kind));
  const pain=by('pain').length>0,frequency=by('frequency').length>0,spend=by('spend').length>0,workaround=by('workaround').length>0;
  const evidenceStrength=independent>=2&&direct&&(frequency||spend)?'strong':independent>=1&&pain?'tentative':'unestablished';
  return {
    segment:input.segment.trim(),pain:input.pain.trim(),productFit:input.productFit.trim(),founderAdvantage:input.founderAdvantage.trim(),
    observed:{pain,frequency,workaround,spend,reach:by('reach').length>0,growth:by('growth').length>0,alternatives:by('alternative').length>0,engagement:by('engagement').length>0},
    independentSources:independent,evidenceStrength,
    marketSize:'unknown' as const,
    judgment:evidenceStrength==='strong'?'Worth a small user test; this is still not market validation.':evidenceStrength==='tentative'?'A testable signal; seek direct behavior or spending before committing.':'Insufficient segment-specific evidence for an opportunity claim.',
    missing:[...(!pain?['pain']:[]),...(!frequency?['frequency']:[]),...(!spend?['spend']:[]),...(!workaround?['workaround']:[])],
    caveat:'Engagement, complaint volume and individual spending examples do not establish TAM, growth or willingness to pay. Snippets and unavailable sources are not observed evidence.',
  };
}
