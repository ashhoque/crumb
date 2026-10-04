export interface ReplyInterpretation { meaning:'agreement'; explanation:string }

/** The conversational host supplies semantic judgment for replies outside the
 * conservative offline recognizer. It never replaces the current presentation,
 * source turn or prerequisite checks. No model/provider is embedded here. */
export function agreesWithPresentation(quote:string,interpretation?:ReplyInterpretation):boolean {
  const text=quote.trim().normalize('NFKC').replace(/[\u2018\u2019`]/g,"'").toLowerCase();
  if(!text||/^[\u0022\u201c\u201d]|\?/u.test(text)||/\b(maybe|probably|perhaps|guess|sort of|kind of|not|no|nope|except|unless|if|but|change|adjust|different|unsure|uncertain|partly|provided|assuming|wrong|disagree|wait|stop|hold|never|don't|cannot|can't)\b/u.test(text))return false;
  if(interpretation!==undefined){
    if(!interpretation||Object.keys(interpretation).some(k=>!['meaning','explanation'].includes(k))||interpretation.meaning!=='agreement'||typeof interpretation.explanation!=='string'||interpretation.explanation.trim().length<8||interpretation.explanation.length>1000)throw new Error('Explain the clear agreement with the current statement; do not infer assent from ambiguity.');
    return true;
  }
  return /^(yes|yup|yep|yeah|exactly|correct|that's right|that is right|sounds right|sounds good|looks good|that works|agreed|sure|let's do it|lets do it|go with that|let's build|let us build|i agree|i'm ready|i am ready|move to act|proceed with the build)\b/u.test(text);
}
