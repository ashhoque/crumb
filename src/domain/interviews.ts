import type { AnyPrebuild } from './ide.js';
import { plain } from './conversation.js';

export const interviewSource='https://www.ycombinator.com/blog/startup-school-week-1-recap-kevin-hale-and-eric-migicovsky/';
/** The five concepts stay fixed; the confirmed job provides the context.
 * Extra host-written product/purchase questions cannot replace the framework. */
export function problemInterview(c:AnyPrebuild):string[] {
  const job=plain(c.definition.job.text??c.definition.problem.text??'the confirmed workflow').replace(/[.!?]+$/u,'');
  return [
    `Let's learn about their experience with: ${job}. Talk about their life and listen; this is not a product pitch.`,
    '1. Thinking about that work, which part causes you the most trouble?\n2. Take me through the most recent occasion when you ran into it.\n3. What made that particular occasion difficult?\n4. Which approaches have you already tried, if any?\n5. Where did those approaches let you down?',
    'Follow their answer, one question at a time. If timing is unclear, ask how often it happened recently. If the consequence is unclear, ask what happened afterward. If a workaround is mentioned, ask what it cost in time or effort and who else was involved.',
    `Adapted from Eric Migicovsky's YC user-interview guidance: ${interviewSource}. A guide is not a sent invitation, completed interview or customer validation.`,
  ];
}

export function interviewFollowUp(answer:string):string {
  if(/\b(spreadsheet|manual|workaround|tried|tool|software)\b/i.test(answer))return 'What happened when you tried that on the most recent occasion?';
  if(/\b(team|colleague|manager|buyer)\b/i.test(answer))return 'Who else was involved that time, and what did they do?';
  if(/\b(hours?|minutes?|cost|delay|lost)\b/i.test(answer))return 'What happened because of that on the most recent occasion?';
  return 'Can you walk me through the most recent occasion, from the moment it started?';
}
