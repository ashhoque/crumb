# Pruvity M1-R report

**M1-R PASS WITH WARNINGS**

Date: 2026-09-23. Pruvity is implemented as **the business copilot for AI builders**.
The approved revised flows replace the rejected M1 UX. All implementation checks
passed, including three synthetic journeys with actual code/test results. A fresh
interactive founder trial is still needed for UX acceptance. M2 has not begun.

Recommended next action: try the short conversational prompt in M1-R_TEST_GUIDE.md.
The detail below is optional—you can continue without reading it.

## What existed and what changed

The repository contained the completed M0 foundation and M1 prototype: pinned Node
24.19.0, strict TypeScript/ESM, a small SQLite adapter, guarded local storage, draft
approval, receipts, backups, a Codex skill, two synthetic scenarios and 56 tests.
The files were untracked, with no committed baseline. A 53-file SHA-256 inventory
was captured before editing. The five original groundwork files, original master,
and historical M0/M1 reports remain unchanged. The earlier M1 pass does not imply
the user accepted its experience; PLAN and STATUS now explicitly record rejection.

The revised journey is:

1. Ask fresh or existing once, unless the opening/saved context already answers it.
2. Establish intention in one lightweight interaction or accept unknown/skip.
3. Draft the problem from the founder's words and permitted relevant files, for
   correction. Existing applications retain their stack and working code.
4. Show a short Executive Summary, one next action and the complete small capability
   scope. Reasoning, definition, evidence, research, competitors, sources and checks
   are optional actions, with bounded pages or escaped collapsible details.
5. Build now approves the displayed build scope. Missing evidence never requires
   research first; the host reduces scope. Changed scope needs a new review.
6. Codex implements the approved slice, runs checks, records actual results and a
   verified backup, and resumes using saved context. Code success does not prove demand.

New version-2 draft contracts retain intention, suspected consequence, supplied
founder-reported feedback, evaluation availability and the short reviewed brief.
Version-1 drafts/cycles still load and approved snapshots remain immutable. No
database migration or private-storage rename was needed. Approval and receipt
contracts remain version 1. The legacy storage/launcher names and CEC directory
are retained for compatibility; the primary product/skill name is Pruvity.

New drafts enforce two to five summary sentences and a 120-word complete default
response ceiling without truncating capabilities. The host fixes its own oversized
draft. Optional detail is paginated to at most 250 words per page. The skill uses
the approved message budgets; these are guidelines for conversational replies,
not an independent guarantee of every future model response.

Evaluation is a preview contract only: not_run, requested, available, unavailable.
Available content must be explicitly synthetic fixtures with source/date/limitations.
Disclosed metrics, public proxies and public observations have separate types;
there is no private-revenue type. No research has been run for the three journeys.
View research does not start research or approve scope. Source structure is checked;
the application cannot authenticate the truth of host-supplied prose.

The primary `.agents/skills/pruvity` entry is discoverable; `$customer-evidence`
remains a thin compatibility alias. A small demo helper creates unique OS-temporary
synthetic examples, allowing the skill to handle setup without founder CLI commands.
It cannot target or overwrite an existing repository. Temporary demos are disposable.

## Commands and checks actually executed

Commands below used the pinned Node executable through the launcher or directly.
Full exact executable paths, arguments and exit codes are in M1-R_CHECK_RESULTS.json.

| Check / command | Exact final result |
| --- | --- |
| TypeScript `tsc --noEmit` | PASS, exit 0 |
| `cec.ps1 check` / `node scripts/check.mjs` | PASS: 71 passed, 0 failed, 0 skipped |
| Separate clean `npm ci --offline --ignore-scripts` with prepared cache | PASS, exit 0, 8 locked packages |
| Clean-copy build and same suite | PASS: 71 passed, 0 failed, 0 skipped |
| Root and clean lockfiles after install | PASS, unchanged by installation |
| `npm ls --all --json` and comparison with M1 lock | PASS; all dependency versions/integrities unchanged |
| `cec.ps1 doctor` | PASS; Pruvity M1-R, Node 24.19.0, SQLite 3.53.3, win32/x64 |
| Actual Codex `skills/list`, isolated profile, force reload | PASS; pruvity, exact repo path, scope repo, enabled true |
| Official skill validator, primary and legacy alias | PASS / PASS, both exit 0 |
| Five original groundwork-file hashes | PASS, all unchanged |
| Historical M0/M1 reports and unchanged storage/adapter/backup/launcher files | PASS |
| Actual Git ignores: database, WAL, backup, local cache and machine snapshot | PASS, all five ignored |
| Three `demo` CLI branches followed by complete workflows | PASS, unique temporary targets; no founder project overwritten |
| Synthetic fresh implementation: `node --test --test-reporter=tap` | PASS, 4 tests; `node demo.mjs` exit 0 |
| Existing/no-users implementation: same Node test command | PASS, 5 tests; invoice report command exit 0 |
| Existing/reported-feedback implementation: same Node test command | PASS, 5 tests; invoice report command exit 0 |
| Both existing applications' five original files | PASS, all hashes unchanged |
| All three approvals, receipts, resumed context and SQLite backups | PASS; validation remains not_established |
| Fresh authenticated nested M1-R invocation | NOT VERIFIED; existing sandbox startup limitation, not retried with credentials |

The 71 tests retain the 56 foundation/M1 checks and add 15 M1-R checks covering
entry paths, disposable demos, budgets, omitted goals, all goal categories,
feedback provenance, all evaluation states, source/date limitations, optional
pagination, escaped details, legacy snapshots, stale approval and real CLI detail
actions. Suites and rehearsals disabled Node network transports, including CLI
children; this does not claim operating-system firewall isolation.

During revision, the initial suite passed 54/56: two assertions still expected
the rejected M1 layout and always-visible acceptance detail. They were replaced
with checks for visible capabilities and optional acceptance detail. Final suites
passed. An empty-input Git-ignore harness invocation returned exit 1; the actual
five-path check passed and the redundant harness invocation was removed. These
were not left as unresolved product failures or credited as passing checks.

## Three complete rehearsals and friction

These are scripted synthetic founder inputs followed by actual fixture edits,
commands, receipts, resume and backups performed by this Codex task. They are not
independent founder usability sessions or separately authenticated model turns.

| Measurement | Fresh idea | Existing/no users | Existing/feedback |
| --- | --- | --- | --- |
| Entry question | 1 | 1 | 1 |
| Additional business questions | 1 | 1 | 0 |
| File-permission requests | 0 | 1 | 1 |
| Repeated context questions | 0 | 0 | 0 |
| Scope approvals | 1 | 1 | 1 |
| Manual founder CLI commands | 0 | 0 | 0 |
| Default proposal words | 70 | 75 | 78 |
| Requested detail words | 102 | 160 | 196 |
| Completion response words | 62 | 62 | 62 |
| Actual application tests passed | 4 | 5 | 5 |

The existing/no-users permission and intention requests were combined in one
reply. These staged rehearsals start with no opening context, so the entry question
is appropriate; the skill skips it if already answered. Fresh builds a required/
received-items checklist. Both existing scenarios reuse the invoice total and add
oldest-first overdue selection/reporting, leaving reminders, CRM and payments parked.
Feedback remains founder-reported; oldest-first usefulness remains a hypothesis.

Lower word-budget bounds are targets, not reasons to pad a sufficient response.
The default proposals were shorter than the proposed 80–120-word range. Research
detail was only 102 words because no findings exist. Human reading time, time to
useful action, actual product adoption and creator support minutes were not measured.

Known friction: another repository needs an explicit skill path until packaging;
already-open tasks may need that path to load the new name. Optional long sections
require More detail. A fresh demo is needed to try another completed cycle. Demo
folders are temporary. IDEAL reasoning is model-driven; tests cannot guarantee all
future replies avoid unnecessary questions or faithfully follow the budget.

## Example actual default proposal

```text
Executive Summary
You want a profitable solo business helping agencies collect client files. Project managers and email workarounds are assumptions; the buyer and pain frequency remain unknown.

Recommended next action: Build a tiny missing-items checklist.
Scope: Accept required and received item lists; Show missing items.
Local only; no spending, sending or deployment.

The detail below is optional—you can continue without reading it.
Build now | Correct my understanding | Why?
```

M1-R_EXAMPLES.md contains the three executed scripted conversations, including
optional detail and actual result summaries.

## Dependencies and files changed

No new dependency or global prerequisite was installed. The clean validation copy
installed the same eight locked packages. Ajv 8.20.0, TypeScript 5.9.3 and Node types
24.13.6 remain unchanged. Package name/version changed to pruvity / 0.1.0-m1r.
The existing verified PyYAML wheel was used only on the validator process import
path; nothing was installed into global Python. ADR 0005 records the decisions.

| Change | Files |
| --- | --- |
| New paths | `src/application/demo.ts`, `src/domain/conversation.ts`, `contracts/m1r.schema.json`, `tests/m1r.test.ts` |
| New fixtures | `fixtures/m1r/fresh.json`, `existing.json`, `feedback.json` |
| New skill paths | `.agents/skills/pruvity/SKILL.md`, `references/local-tools.md`, `references/conversations.md` |
| New documents | `docs/adr/0005-pruvity-conversation-revision.md`, `M1-R_REPORT.md`, `M1-R_TEST_GUIDE.md` |
| Modified code/tests | `src/domain/contracts.ts`, `src/application/workflow.ts`, `src/cli/main.ts`, `src/cli/render.ts`, `tests/workflow.test.ts`, `scripts/verify-skill-host.mjs` |
| Modified metadata/docs | `package.json`, `package-lock.json`, `AGENTS.md`, `PLAN.md`, `README.md`, `STATUS.md`, `MANUAL_SETUP.md` |
| Legacy compatibility | `.agents/skills/customer-evidence/SKILL.md` replaced with alias; its local-tools reference moved to the new skill |

That is 13 added paths, 14 modified paths and one old reference path removed by the
move. Generated dist, the clean validation installation, scratch logs and temporary
synthetic apps are excluded. No commit, remote, push, global PATH or Git trust change.

## Deviations, remaining limits and recommendation

The user's approved Pruvity/IDEAL revision supersedes the master's CEC brand and old
response format. Internal legacy names remain to preserve existing state. M1-R adds
only the evaluation UX/contracts, not the full E stage. Prior feedback can be supplied
in the conversation as a synthetic report; there is no customer-source import.

The authenticated nested-host sandbox limitation remains. M0's earlier manually
reported legacy marker proves only that historical invocation, not the revised UX.
The current installed scanner passed; a fresh interactive Pruvity session is not
independently verified. No sandbox protection or authentication files were changed.

Other inherited limits: synthetic data only, one approved cycle, one tested Windows
environment, Codex-managed pinned runtime, trusted host reports, single-user filesystem
races, same-disk backups and no complete recovery/export/delete or real-data privacy
gate yet. Global Node 18 remains intact; the local launcher selects Node 24. Other
OSes and clean-machine distribution remain untested.

Deferred: deep research, scraping, Reach Packs, real evidence import, additional cycles,
dashboard, hosted services, sync, email, autonomous outreach, payments, CRM, vector
search, multi-agent systems and additional coding-agent integrations.

**Recommendation:** accept the revised experience through your own synthetic trial
before authorizing M2. The technical foundation passes; UX acceptance must not be
inferred from tests. No mandatory machine setup remains. Stop after M1-R.
