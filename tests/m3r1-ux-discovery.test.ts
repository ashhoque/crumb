import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { temporaryProject } from './helpers.js';
import { ideFixture, prepareIde } from './ide-fixtures.js';
import { readPrebuild, savePrebuild, transitionIde } from '../src/application/prebuild.js';
import { presentationText, validateIde, type IdeContext } from '../src/domain/ide.js';
import { discoveryScope, firstUserDiscoveryNotice } from '../src/domain/first-user-discovery.js';
import { nextIdeStep } from '../src/domain/guide.js';

const cli = fileURLToPath(new URL('../src/cli/main.js', import.meta.url));

test('M3-R1 ordinary IDE presentations stay natural while retaining the exact decision question', t => {
  const root = temporaryProject(t);
  let saved = savePrebuild(root, ideFixture());
  for (const subject of ['intention', 'user', 'problem'] as const) {
    const shown = transitionIde(root, { operation: 'present', subject, expectedVersion: saved.version });
    const text = presentationText(shown.context as IdeContext, subject);
    assert.doesNotMatch(text, /Executive summary|Yes ·|OPTIONAL_DETAIL|What would you like to do next/i);
    assert.match(text, /\?/);
    saved = transitionIde(root, { operation: 'confirm', expectedVersion: shown.version, presentationId: (shown.context as IdeContext).ide.presentation!.id, turnId: randomUUID(), quote: 'yup' });
  }
});

test('M3-R1 end-of-Evaluate guidance reuses routes, offers behavior interviews, then preserves Act', t => {
  const root = temporaryProject(t);
  const stock = JSON.parse(readFileSync(new URL('../../fixtures/m3r1-quality/stock.json', import.meta.url), 'utf8')) as IdeContext;
  const saved = prepareIde(root, 'evaluation', stock);
  const guide = nextIdeStep(saved.context);
  assert.equal(guide.kind, 'confirm');
  assert.equal(guide.subject, 'act');
  assert.match(guide.text, /r\/swingtrading|TradingView/i);
  assert.match(guide.text, /last time|recent|workflow/i);
  assert.match(guide.text, /Are you ready to commit a build cycle to this\?/);
  assert.doesNotMatch(guide.text, /Yes — let's build · Change the user · Change the problem · Review evaluation/);
  assert.equal((guide.text.match(/Are you ready to commit a build cycle to this\?/g) ?? []).length, 1);
});

test('M3-R1 asks one missing locality question before returning to the Act gate', t => {
  const root = temporaryProject(t);
  const c = ideFixture();
  c.discovery = { channels: 'both', region: null, outcome: 'not_run', runIds: [], limitation: 'Synthetic fixture needs a founder-supplied locality.' };
  prepareIde(root, 'evaluation', c);
  const guide = nextIdeStep(readPrebuild(root)!.context);
  assert.equal(guide.kind, 'question');
  assert.equal(guide.subject, null);
  assert.match(guide.text, /city or region/);
  assert.equal((guide.text.match(/\?/g) ?? []).length, 1);
  assert.doesNotMatch(guide.text, /Are you ready to commit/);
});

test('M3-R1 first-user cards keep observed names separate from fit inference and permission', t => {
  const c = ideFixture();
  c.firstUserCards = [{
    id: 'card-public-community', kind: 'community', displayName: 'r/swingtrading', subjectKey: 'scheduled shortlist traders',
    relationship: 'intended_user', observed: 'Public discussion describes scheduled screening and chart review.',
    fitInference: 'Could contain people close to the confirmed workflow.', uncertainty: 'Exact user fit and willingness are unknown.',
    sourceIds: [c.sources[0]!.id], route: 'Read current community rules before participating.', routeStatus: 'check_rules', firsthand: false, scopeKey:discoveryScope(c), usePermission:'permitted',
  }];
  assert.doesNotThrow(() => validateIde(c));
  assert.match(firstUserDiscoveryNotice(c), /r\/swingtrading/);
  assert.match(firstUserDiscoveryNotice(c), /No willingness or contact permission is inferred|rules still need checking/);
  const invalid = structuredClone(c) as IdeContext;
  invalid.firstUserCards![0]!.sourceIds = [];
  assert.throws(() => validateIde(invalid), /source references/);
});

test('M3-R1 installed CLI exposes a bounded discovery plan without claiming research receipts', t => {
  const root = temporaryProject(t);
  const saved = prepareIde(root, 'problem');
  const result = spawnSync(process.execPath, [cli, 'internal', 'discovery-plan', root], { encoding: 'utf8', windowsHide: true, timeout: 20_000 });
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout) as { bounds: { maxQueries: number; maxInspectedPages: number; reuseExisting: boolean }; routes: string[]; constraints: string[] };
  assert.deepEqual(plan.bounds, { maxQueries: 6, maxInspectedPages: 10, reuseExisting: true });
  assert.ok(plan.routes.some(route => /communities/i.test(route)));
  assert.ok(plan.routes.some(route => /named professionals|public handles/i.test(route)));
  assert.ok(plan.constraints.some(constraint => /permission/i.test(constraint)));
  assert.doesNotMatch(result.stdout, /research complete|contacts found|messages sent/i);
  assert.equal(saved.context.contractVersion, 2);
});
