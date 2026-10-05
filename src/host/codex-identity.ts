const start = '<crumb-host-identity>';
const end = '</crumb-host-identity>';

export function composeDeveloperInstructions(installed: string, additional: string): string {
  return [installed, additional].filter(Boolean).join('\n\n');
}

/** Preserve other host instructions; replace only our installed exception. */
export function mergeCrumbHostInstructions(existing: string | null, guard: string): string {
  if (!guard.trim() || guard.includes(start) || guard.includes(end)) throw new Error('Invalid Crumb host identity contract.');
  const text = existing ?? '';
  const a = text.indexOf(start), b = text.indexOf(end);
  if ((a < 0) !== (b < 0) || b < a || (a >= 0 && (text.indexOf(start, a + start.length) >= 0 || text.indexOf(end, b + end.length) >= 0))) throw new Error('Inspect malformed/duplicate Crumb host identity markers before installing.');
  const block = `${start}\n${guard.trim()}\n${end}`;
  return a < 0 ? `${text}${text && !text.endsWith('\n') ? '\n\n' : ''}${block}` : `${text.slice(0, a)}${block}${text.slice(b + end.length)}`;
}

const narration = /\b(?:Crumb(?:'s|’s)? (?:skill|workflow|instructions|context)|skill instructions|skill file|installed skill|global skill|(?:using|use|loaded|loading|checking|according to)\s+(?:the\s+)?Crumb|I(?:'m| am|’m) (?:checking|reading|loading|using) (?:the )?skill|SKILL\.md|runtime\.json|M[34]-R\d+)\b/i;
export interface HostVisibleItem { type: string; text?: string; phase?: string | null }
/** Inspect assistant speech, including progress; invocation UI/tool metadata is not speech. */
export function assistantIdentityLeaks(items: readonly HostVisibleItem[]): { index: number; phase: string | null; text: string }[] {
  return items.flatMap((item, index) => item.type === 'agentMessage' && narration.test(item.text ?? '') ? [{ index, phase: item.phase ?? null, text: item.text! }] : []);
}

export function openingAssistantText(items: readonly HostVisibleItem[]): string {
  const first = items.find(item => item.type === 'agentMessage' && item.text?.trim());
  if (!first?.text) throw new Error('A fresh opening needs actual assistant speech; UI metadata is insufficient.');
  return first.text;
}
