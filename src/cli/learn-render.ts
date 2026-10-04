import type { SavedLearn } from '../domain/learn.js';
import { OPTIONAL_DETAIL } from '../domain/conversation.js';
const clean=(s:string)=>{const text=s.replace(/[\r\n]+/g,' ').trim();return text.length>240?text.slice(0,237)+'...':text;};
export function renderLearnSummary(s:SavedLearn):string {
  const r=s.record,l=r.learning,synthetic=r.synthetic?'Synthetic product-test fixture. ':'';
  if(r.status==='paused')return 'Paused. The evidence and parked work are preserved; we can resume when you are ready.';
  if(!l&&r.imports.length)return 'Notes saved. I will separate what people said from what they did, keep conflicting accounts, and identify the smallest useful next step. The original notes remain available as optional detail.';
  if(l){
    const observations=r.observations.filter(o=>['observed_behavior','repeated_use'].includes(o.kind));
    const findings=observations.slice(0,l.contradictions.length?2:3).map(o=>'- Reported observation: '+clean(o.excerpt));
    if(l.contradictions.length)findings.push('- '+clean(l.contradictions[0]!));
    return `Executive summary\n${synthetic}${l.summary} ${l.recommendation}\n\nWhat we learned\n${findings.join('\n')||'- Observed usage is still unknown.'}\n\nWhat I would leave parked\n${l.park.slice(0,2).map(x=>'- '+clean(x)).join('\n')||'- Additional capabilities until the core outcome is clearer.'}\n\nNext\n${r.status==='decided'?'Direction recorded. Stop here; new code still requires reviewed scope and approval.':r.status==='collecting'?'The recommendation is challenged. Paste the missing or corrected observation; we will reassess it.':'Approve next direction | Review evidence | Challenge recommendation'}\n\n${OPTIONAL_DETAIL}\nView evidence | View sessions | View contradictions | View feature requests | View sources\nTechnical success is not customer validation.`;
  }
  return `Executive summary\n${synthetic}The reviewed MVP is for ${clean(r.pack.who)}. I would start with one relevant user through ${clean(r.pack.routes[0]?.where??'a confirmed route once the missing habitat context is restored')}, using the task we already built. Watch whether they reach the core result without coaching; no message has been sent.\n\nNext\nReview the first-user launch pack, then paste what happened.\n\n${OPTIONAL_DETAIL}\nView launch pack | View routes | View MVP limitations`;
}
