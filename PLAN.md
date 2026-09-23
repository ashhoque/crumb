# Pruvello implementation plan

Authority: `PRODUCT_SPEC.md` and the user-approved Pruvello continuation proposal.
Active milestone: M1-R correction only. Earlier sections below are historical.
M0 was approved. M1's implementation passed its recorded checks but the user
rejected its UX/testing. M1_REPORT.md remains historical evidence, not acceptance.
The user approved the Pruvello correction on 2026-09-23. M1-R is implemented:
**M1-R PASS WITH WARNINGS**. User experience acceptance awaits the founder's trial.
M2 is not authorized or started.


## Pruvello M1-R correction — approved 2026-09-23

The stock-comparison trial generated features before establishing intention/problem
understanding. The prior technical pass remains valid; it is not UX acceptance.
The user approved the new proposal and implementation in this task. Final result:
83/83 tests; four independent agent conversation paths; all three skill entries
validated and discovered. See M1_R_REPORT.md. The founder UX trial remains separate.

- [x] Preserve the existing repository and capture a file-hash baseline.
- [x] Add v3 orientation drafts without proposed scope; retain v1/v2 state.
- [x] Separate brief evaluation from research availability and retain skipped goals.
- [x] Preserve Build now and scope-bound approval with stale-draft rejection.
- [x] Add display branding and Pruvello entry with legacy aliases.
- [x] Update the active master, conversation guide and four orientation fixtures.
- [x] Finish regression checks and conversation rehearsals; record actual limits.
- [x] Write M1_R_REPORT.md and update STATUS; stop before M2.

Forward roadmap: M2 deep Evaluate/research/competitors/users/master + red team;
M3 Act/staged MVP builds; M4 Launch & Learn; M5 evidence-earned improvements.
Recovery/privacy gates precede real data regardless of historical milestone numbers.
Billing and distribution remain unscheduled hypotheses.

## Initial repository map

The repository initially contains the master, groundwork instructions/report/snapshot,
the tested PowerShell environment helper, Git metadata, and an empty `.agents/skills`.
All five files are untracked; there are no commits, remotes, application sources,
README, AGENTS.md, manifests, lockfiles, tests, or existing implementation conventions.
Preserve these files byte-for-byte. The groundwork report is historical, not M0 status.

| Master area | M0 treatment |
| --- | --- |
| §08 Node 24, strict TypeScript, ESM | Pin tested runtime and local compiler/types; compile to ESM |
| §08 SQLite adapter | Small isolated `node:sqlite` adapter, tested with disposable synthetic databases |
| §09.3 storage, AC39/40 | Prototype initialization, Git-ignore verification, tracked-data refusal, path checks |
| §11 Codex integration | Repository-scoped foundation probe skill; verify actual discovery and invocation |
| §15 M0 exit, AC02/03 | Initialize empty and existing synthetic folders without business data or architecture changes |
| AC42 | Run deterministic tests with network transports disabled and verify the denial mechanism |
| F01–F08, §09 business entities | Deferred to their milestones; no domain schema or customer workflow in M0 |
| AC01/04–38/41/43–45 | Full product/release acceptance deferred; M0 does not claim these pass |

## M0 execution checklist

- [x] Read the full master and groundwork evidence; inspect the actual repository.
- [x] Select the existing Node v24.19.0/npm 9.6.7 environment.
- [x] Pin/install minimum dependencies and verify reproducible local installation.
- [x] Implement/test an empty local initializer and safe SQLite boundary.
- [x] Verify ignored private storage, tracked-data refusal and existing-file preservation.
- [x] Run compiler, runtime, SQLite and offline deterministic checks: 35 passed, 0 failed, 0 skipped.
- [x] Verify real repository-local discovery with installed Codex scanner in an isolated test profile.
- [x] Verify actual invocation with the existing Codex account: user reported the expected marker and workflow disclaimer from the manual desktop check on 2026-09-23.
- [x] Write ADRs, README, STATUS.md, MANUAL_SETUP.md and M0_REPORT.md with exact results.
- [x] Record the manual host result and stop after M0; M1 has not begun.

## Results and milestone boundary

Strict compilation/type checking, all 35 tests, an independent clean offline
`npm ci` plus the same 35 tests, unchanged lockfile, original-file hashes, skill
syntax validation and actual scanner discovery passed. The five original
groundwork files are byte-identical to the pre-M0 baseline.

The user reported the manual desktop response `CEC_M0_SKILL_LOADED` followed by
`The customer workflow is not implemented.` This closes the M0 invocation gate
with user-reported evidence; it was not independently observed by this task.
The automated host launcher still cannot start in this task's sandbox, so its
failure remains a warning. `MANUAL_SETUP.md` records the completed check.
The user subsequently approved M0 and authorized M1. No M0 manual action remains.

## Installation boundary

Development dependencies belong only in this CEC repository. The initializer must
not install packages, create Git repositories, execute target package scripts,
write Codex skills into customer repositories, read secrets or contact a network.
Only the target `.gitignore` and `.customer-evidence` foundation may change.

## M1 execution checklist

- [x] Read current PLAN and M0 report first, then inspect the master, code and tests.
- [x] Assess warnings: preserve global Node 18; add a local pinned-runtime launcher.
  The sandbox host restriction does not block the user's verified desktop workflow.
- [x] Add versioned JSON Schema contracts and the minimum validator dependency (Ajv 8.20.0).
- [x] Persist editable orientation, one immutable approved foundation/cycle and receipts.
- [x] Add concise known/assumed/unknown rendering, approval and bounded build handoff.
- [x] Preserve target architecture and Git/privacy boundaries; add minimal local backup.
- [x] Update the conversational skill and its focused internal-tool reference.
- [x] Exercise complete synthetic idea and unfinished-project paths with real edits/checks.
- [x] Measure questions, repeated context, corrections and manual tool use; report limits.
- [x] Run acceptance checks: 56/56 core and clean-install tests; 4 Python and 5 JavaScript
  rehearsal tests, two runnable demos, receipts, resume and verified backups.
- [x] Update STATUS and create M1_REPORT; stop before M2.

M1 covers F01, F05/F06's first cycle and master §15 M1. No research, Reach Pack,
customer-source import, second cycle, browser interface, distribution or payment.
The host reasons and implements; the local application validates/stores typed state.
Only synthetic data is authorized for this milestone. M2 requires a new instruction.

## M1 review outcome

No mandatory setup action remains. The local launcher removes the routine Node
selection step without modifying global tools. Nested authenticated host startup
remains sandbox-limited; the prior manual invocation and current scanner check are
recorded separately from the M1 scripted rehearsals. No new independent end-user
usability or customer-demand result is claimed. The user subsequently rejected
this experience; the M1-R revision supersedes the earlier M2 recommendation.

## M1-R revision

- [x] Review the existing implementation and approved conversation designs.
- [x] Rename the primary experience Pruvity; retain compatibility with saved M1 state.
- [x] Add lightweight Intention/Define and honest evaluation-preview contracts.
- [x] Implement summary-first responses, optional detail and Build now approval.
- [x] Revise the repository skill for all three founder entry paths.
- [x] Test fresh idea, existing/no users, and existing/reported feedback paths.
- [x] Verify preservation, privacy, approval, receipts, discovery and offline checks.
- [x] Report exact results, friction and remaining limits; stop before M2.

No deep-research engine, scraping, customer-source import, second cycle, hosted
service, dashboard, messaging, payments or extra coding-agent integration.

Final evidence: 71/71 tests in the repository and clean offline installation; three
scripted synthetic journeys with 4/5/5 actual application tests, runnable examples,
receipts, resumed context and verified backups. Default proposals: 70/75/78 words.
Pruvity and legacy alias validation passed; actual Codex repository discovery passed.
No dependencies added. Historical groundwork and M0/M1 reports remain unchanged.
Nested authenticated invocation is still sandbox-limited; no fresh independent
M1-R usability result is claimed. See M1-R_REPORT.md. Stop here; M2 is not started.

