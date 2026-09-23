import { cpSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireTestedRuntime } from './runtime.js';

/** Disposable synthetic demo only; never infer or mutate a founder repository. */
export function prepareDemo(scenario: string): { target: string; scenario: string; synthetic: true } {
  requireTestedRuntime();
  if (!['fresh', 'existing', 'feedback'].includes(scenario)) throw new Error('Choose a synthetic fresh, existing or feedback demo.');
  const target = mkdtempSync(join(tmpdir(), 'pruvity-m1r-'));
  if (scenario !== 'fresh') cpSync(fileURLToPath(new URL('../../../fixtures/m1/unfinished/', import.meta.url)), target, { recursive: true, errorOnExist: true, force: false });
  return { target, scenario, synthetic: true };
}
