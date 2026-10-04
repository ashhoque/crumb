/** Founder-controlled route selection and drafts; no outreach side effect. */
export interface HabitatOption {
  name:string; sourceUrl:string; observed:string; participation:'allowed'|'check_rules'|'restricted';
  role:'research'|'acquisition'|'both'; fit:'high'|'medium'|'low';
}
export interface FirstUserInput {
  user:string; pain:string; market:'local_smb'|'distributed'; region?:string|null;
  habitats:HabitatOption[];
}
const short=(x:unknown,n:number)=>typeof x==='string'&&!!x.trim()&&x.length<=n;
export function planFirstUsers(input:FirstUserInput){
  if(!input||!short(input.user,200)||!short(input.pain,300)||!['local_smb','distributed'].includes(input.market)||!Array.isArray(input.habitats)||input.habitats.length>8||input.region!=null&&(typeof input.region!=='string'||input.region.length>120))throw new Error('Use one user, pain, market and up to eight source-backed habitats.');
  if(input.market==='local_smb'&&!input.region?.trim())return {action:'ask_region' as const,reason:'Which city or region should we use?',research:[],acquisition:[],candidateTarget:0};
  for(const h of input.habitats){
    if(!h||!short(h.name,160)||!short(h.observed,500)||!['allowed','check_rules','restricted'].includes(h.participation)||!['research','acquisition','both'].includes(h.role)||!['high','medium','low'].includes(h.fit))throw new Error('Habitat needs an observed route, fit and participation status.');
    try{const u=new URL(h.sourceUrl);if(u.protocol!=='https:'||u.username||u.password)throw new Error();}catch{throw new Error('Habitat needs a public HTTPS source.');}
  }
  const ranked=[...input.habitats].sort((a,b)=>({high:0,medium:1,low:2}[a.fit]-{high:0,medium:1,low:2}[b.fit]));
  const research=ranked.filter(h=>h.role!=='acquisition').slice(0,2).map(h=>({name:h.name,sourceUrl:h.sourceUrl,observed:h.observed}));
  const acquisition=ranked.filter(h=>h.role!=='research'&&h.participation!=='restricted').slice(0,2).map(h=>({name:h.name,sourceUrl:h.sourceUrl,observed:h.observed,participation:h.participation}));
  return {action:'discover' as const,reason:input.market==='local_smb'?'Start with nearby businesses and local associations that match the workflow.':'Start with the specific online communities and public routes where this role already discusses the workflow.',research,acquisition,candidateTarget:acquisition.length?5:0,bounds:{maxQueries:6,maxPages:10,maxCandidateReview:20},outreach:'draft_only_requires_explicit_approval' as const};
}

export interface OutreachDraftInput {audience:string; observedContext:string; ask:string; channel:'email'|'dm'|'call'|'voicemail'|'interview'|'beta'; sourceUrl:string; routeReviewed:boolean;}
export function prepareOutreach(input:OutreachDraftInput){
  if(!input||!short(input.audience,160)||!short(input.observedContext,300)||!short(input.ask,220)||!['email','dm','call','voicemail','interview','beta'].includes(input.channel)||typeof input.routeReviewed!=='boolean')throw new Error('Outreach needs a specific audience, observed context, one ask and channel.');
  try{const u=new URL(input.sourceUrl);if(u.protocol!=='https:'||u.username||u.password)throw new Error();}catch{throw new Error('Use an observed public route source.');}
  const context=input.observedContext.trim(),ask=input.ask.trim();
  if(/[!?].*[!?]/.test(ask))throw new Error('Make one simple ask.');
  const body=`Hi — I noticed ${context}. I’m exploring this workflow with ${input.audience.trim()} and would value your perspective. ${ask}${/[?.!]$/.test(ask)?'':'?'} No pressure either way.`;
  return {channel:input.channel,body,sourceUrl:input.sourceUrl,routeStatus:input.routeReviewed?'reviewed':'check_rules',status:'draft_only' as const,sendAllowed:false,requires:'Founder approval before any external message. Check route and community rules first.'};
}

export function validationAsset(painKnown:boolean,productBuilt:boolean,fastLearning:boolean){
  if(!painKnown)return {recommendation:'Clarify a real pain and user before making a concept.',permission:'no_build_authorized' as const};
  return {recommendation:fastLearning?productBuilt?'Try a pain-first landing page or small observed walkthrough with an honest current-capability description.':'Offer a pain-first mockup or concierge test labeled as a concept.':'Use one relevant conversation before building an asset.',permission:'draft_only_until_act' as const};
}

export interface FirstUserOutcome {kind:'contacted'|'replied'|'ignored'|'conversation'|'pilot'|'declined'; audience:string; channel:string; observation:string;}
export function learnFirstUsers(outcomes:FirstUserOutcome[]){
  if(!Array.isArray(outcomes)||outcomes.length>20||outcomes.some(o=>!o||!['contacted','replied','ignored','conversation','pilot','declined'].includes(o.kind)||!short(o.audience,120)||!short(o.channel,80)||!short(o.observation,300)))throw new Error('Use up to twenty observed, attributed first-user outcomes.');
  const counts=Object.fromEntries(['contacted','replied','ignored','conversation','pilot','declined'].map(k=>[k,outcomes.filter(o=>o.kind===k).length]));
  const engaged=outcomes.filter(o=>['conversation','pilot'].includes(o.kind));
  const next=engaged.length?'Ask what happened in the real workflow and whether the old workaround changed. Revisit the ICP only from that evidence.':outcomes.some(o=>o.kind==='ignored')?'Silence is ambiguous. Check route, message, timing and trust; try one small channel or invitation change.':'Choose one specific, permitted route and invite a relevant person to discuss a recent task.';
  return {counts,validation:'not_established' as const,segmentSignal:engaged.length?Array.from(new Set(engaged.map(o=>o.audience))):[],next,limits:'Contact, reply, silence and conversation do not establish product use, payment or market fit. Founder-reported outcomes are not independently verified.'};
}
