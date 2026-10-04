import type { SavedPrebuild } from '../domain/prebuild.js';
import { nextIdeStep } from '../domain/guide.js';
import { plain } from '../domain/conversation.js';
export function confirmedReply(s:SavedPrebuild):string {
  if(s.context.contractVersion!==2)return nextIdeStep(s.context).text;
  const c=s.context,last=c.ide.confirmations.at(-1);
  const name=last?.subject==='intention'&&c.preferredName?`, ${plain(c.preferredName.value)}`:'';
  const intention=c.intention.goal==='personal'?'That helps: usefulness to you matters more than proving a large market.':['solo_profit','bootstrapped'].includes(c.intention.goal)?'That helps: we should weigh willingness to pay alongside the time and support this will need.':'That gives us a direction to judge the opportunity against.';
  const ack=last?.subject==='intention'?`Got it${name}. ${intention}`:last?.subject==='user'?'Good, that gives us a tighter user to investigate.':last?.subject==='problem'?'That helps. We have a concrete pain to pressure-test now.':last?.subject==='evaluation'?'We have enough to make a deliberate decision, with the uncertainty still in view.':'Got it.';
  return ack+'\n\n'+nextIdeStep(c).text;
}
