# M3 Launch & Learn report

**M3 PASS WITH WARNINGS - 26 September 2026.** Implemented in the same existing repository. The final full build/regression suite passed **270/270** with zero failures/skips, and all six required scenarios passed. M4 has not started.

## Implemented

- Reuse current confirmed IDE, habitat/first-user avenues, relevant research and the founder-reviewed completed MVP. Launch preparation checks selected files against the actual reviewed build.
- Persistent small Launch Pack with exact user/problem, existing routes and provenance, truthful draft invitation, one learning objective, core task and focused observations. The default is one user/pilot; exposure style/routes can be adjusted before feedback. No send capability was added.
- SQLite v4 append-only learning journal links the IDE basis, Act build, launch pack, notes imports, pseudonymous sessions/observations, synthesis and founder decision. Existing database backup includes it.
- Rough notes can be saved once and organized by the existing host. Exact quoted excerpts, generated IDs, duplicate-import checks, synthetic/live separation and source retention keep provenance visible.
- Separate opinions, reported/observed behavior, commitments, payments, repeated use, technical results, sent-outreach reports, conversations, silence, feature requests and unknowns. No response stays ambiguous; technical success and payment do not establish validation/market fit.
- Conservative synthesis preserves contradictions and KEEP / TEST / PARK, recommends one small next test, and routes material evidence back to Define/Evaluate/Intention. Accepted foundation revisions cannot bypass existing confirmations with the old basis or cosmetic text changes.
- Compact launch/learning views, short notes acknowledgements, optional private evidence, proactive next decisions and a refreshed Crumb skill. Approval records direction only; code still needs concrete Act scope approval.

## Verification actually run

- Pinned Node 24.19.0: node scripts/check.mjs before edits: 237/237 passed.
- Initial M3 targeted suite: 22/23; the failing test omitted existing-repository inspection fields and was corrected.
- First A-F plus targeted pass: 28/29; the different-pain fixture correctly hit the important-claim counterevidence guard. Added the missing assessment to the fixture, retaining the production guard.
- Complete integrated pass: 270/270 passed.
- Final node scripts/check.mjs after guard/UX review: 270/270 passed, 0 failed/cancelled/skipped, 64.432 seconds.
- The suite includes all existing M1-R3 and M2 regressions, 26 new M3 guard/evidence/storage tests, six end-to-end scenarios and one real CLI/PowerShell integration test.
- Actual fixture customer tests pass 4/4 per scenario. Existing-project builders deliberately fail an initial comparison test, record a partial result, repair it and pass; those expected child failures are not called success. Child checks are not added again to the 270 count.
- Offline guard inherited by the full test run; no external communication. Git whitespace and preservation checks are recorded in M3_VERIFICATION.json.

## Required scenario results

| Scenario | Actual outcome | Next direction | Result |
|---|---|---|---|
| A - Positive usage | There is a useful workflow signal here; it is still early evidence, not validation. | act | PASS |
| B - Mixed result | There is a useful workflow signal here; it is still early evidence, not validation. | act | PASS |
| C - Technically working, low-priority pain | The result is weaker than we hoped: the reported usage did not show a reason to change the current workflow. | evaluate | PASS |
| D - Different pain discovered | That is useful, even though it changes the problem more than the product. | define_problem | PASS |
| E - No outreach response | No replies is ambiguous. It does not establish that the pain is unimportant. | exposure | PASS |
| F - Stock MVP workflow usefulness, not investment performance | There is a useful workflow signal here; it is still early evidence, not validation. | act | PASS |

A/B/F retain useful comparison work and propose one small input-friction test, parking broader requests. C returns to Evaluate despite passing software tests and a compliment. D revises only the problem, reconfirms it, reviews Evaluation and explicitly reconfirms Act while retaining the original valid Intention/User receipts; its next single-capability proposal remains unapproved/unbuilt. E separates a founder-reported invitation from conversation/usage and keeps silence ambiguous. F uses the historical M1-R3 trader cohort and real M2 comparison implementation, with synthetic usage only and no investment-performance claim.

Every scenario stopped at a reviewed learning decision. M3 made no changes to the customer MVP or parked files. No outreach, deployment, payment integration or M4 work occurred. [Detailed scenarios and actual command logs](docs/development/M3_SCENARIOS.md) and [machine-readable evidence](docs/development/M3_SCENARIO_RESULTS.json) are retained.

## Files changed during M3

- `.agents/skills/crumb/references/act.md`
- `.agents/skills/crumb/references/local-tools.md`
- `.agents/skills/crumb/SKILL.md`
- `AGENTS.md`
- `cec.ps1`
- `docs/development/README.md`
- `PLAN.md`
- `PRODUCT_SPEC.md`
- `README.md`
- `scripts/verify-skill-host.mjs`
- `src/application/act.ts`
- `src/application/initialize.ts`
- `src/application/workflow.ts`
- `src/cli/act-render.ts`
- `src/cli/main.ts`
- `src/persistence/act-store.ts`
- `src/persistence/prebuild-store.ts`
- `src/persistence/workflow-store.ts`
- `STATUS.md`
- `tests/cli.test.ts`
- `tests/initialize.test.ts`

New implementation, test and documentation files:

- `.agents/skills/crumb/references/learn.md`
- `M3_TEST_GUIDE.md`
- `docs/development/M3_SCENARIOS.md`
- `docs/development/M3_SCENARIO_RESULTS.json`
- `src/application/learn.ts`
- `src/cli/learn-render.ts`
- `src/domain/learn.ts`
- `src/persistence/learn-store.ts`
- `tests/learn-cli.test.ts`
- `tests/learn-scenarios.test.ts`
- `tests/learn-scenarios.ts`
- `tests/learn.test.ts`
- `M3_REPORT.md`
- `docs/development/M3_VERIFICATION.json`

## Preservation

All 64 protected prior milestone reports/test guides/evidence, original master, fixtures, schemas, runtime pin and dependency files match the pre-M3 snapshot. M2_REPORT.md remains the historical approved checkpoint. Branch main and HEAD c218317a2b17d6f4a7194ef5c875b5d26ed48d48 are unchanged. No commit/push, re-scaffold, startup reset or groundwork rerun. Only disposable test projects execute fixture build stages.

## Known limitations and manual acceptance

- All user exposure and decisions in these scenarios are explicitly synthetic. They prove state/command behavior, not real usefulness, demand, payment or repeat use. Historical stock research was reused, not refreshed.
- The existing Codex host organizes notes and judges relevance. Exact excerpts and structural guards prevent absent-source records but cannot verify truth, automatically detect fabricated wording, or independently certify evidence classification.
- The core does not automatically redact arbitrary prose. The host/founder must minimize identity-bearing notes before storage. No raw customer files or private identities were imported in development.
- Default route invitations are drafts; current access/channel norms, any offer and channel-specific wording need founder/host review. No autonomous outreach is available.
- Free-running installed-host conversation quality and manual founder acceptance were not established by authored fixtures. The old host-probe limitation remains historical; the optional probe marker was updated but the authenticated host probe was not rerun.
- The core supplies conservative recommendations; semantic interpretation of underlying pain and a useful precise next change remain host judgment. Private raw notes stay out of routine build context; minimized findings are transferred through the existing IDE workflow.
- Bounded local pilot storage is intentional: 12k characters/import, 40 observations/import, 30 imports/200 observations/cycle and 300 KiB/cycle body. No CRM, telemetry ingestion or automatic research was added.

## Deferred and M4 recommendation

Deferred: billing/payment systems, free trials, hosting/backend, broad packaging, autonomous outreach, contact scraping, CRM, analytics platform, teams and enterprise features. None were built.

**Can M4 safely begin?** The verified M3 technical foundation is ready for a separately scoped and authorized M4 milestone. I recommend one unscripted founder trial first, because scripted evidence cannot certify the actual conversational experience. No current automated blocker remains.

**Exact next step:** follow [M3_TEST_GUIDE.md](M3_TEST_GUIDE.md) in normal Codex with a disposable synthetic project that already has confirmed IDE and a reviewed M2 MVP. Check launch context reuse, paste positive/mixed/no-response notes, challenge a recommendation and verify that it stops without sending or coding. If that experience is acceptable, explicitly authorize a concrete M4 scope. Work stops here.
