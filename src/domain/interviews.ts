import type { AnyPrebuild } from './ide.js';
import { plain } from './conversation.js';

export const interviewSource='https://www.ycombinator.com/blog/startup-school-week-1-recap-kevin-hale-and-eric-migicovsky/';
/** The five concepts stay fixed; the confirmed job provides the context.
 * Extra host-written product/purchase questions cannot replace the framework. */
export function problemInterview(c:AnyPrebuild):string[] {
  const job=plain(c.definition.job.text??c.definition.problem.text??'the confirmed workflow').replace(/[.!?]+$/u,'');
  return [
    `Let's learn about their experience with: ${job}. Talk about their life and listen; this is not a product pitch.`,
    `1. What is the hardest part about ${job}?\n2. When was the last time you encountered this issue?\n3. Why was this problem hard?\n4. What, if anything, have you done to solve it?\n5. What don't you love about the solutions you tried?`,
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
