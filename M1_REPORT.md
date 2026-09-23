# CEC M1 report

**M1 PASS WITH WARNINGS**

Date: 2026-09-23. M0 was approved and M1 authorized by the user. M1 is complete;
M2 has not started. No mandatory setup action remains for the synthetic workflow.
This is a tested development slice, not evidence of real founder adoption or demand.

## What existed and what changed

The current PLAN and M0 report were read first, followed by the master, repository
instructions, source, tests, package/lock files and skill. M0 already supplied a
strict TypeScript/ESM build, metadata-only guarded initialization, isolated SQLite
adapter, 35 tests and a repository skill probe. Those foundations were extended.
The master and all five original groundwork artifacts retain their original hashes.

M1 adds a conversational orientation-to-build path, versioned runtime contracts,
an editable draft, immutable foundation revision 1 / one approved cycle, compact
rendering and handoff, actual BuildReceipt capture and verified minimal local backup.
It preserves the existing stack and repository conventions. No hosted service,
additional coding agent, research engine, customer-source workflow or M2 feature
was introduced. No commit, push, global runtime replacement or Git trust change
was performed. No private workspace was created in the CEC development repository.

## Implemented user journey

1. The founder invokes the skill with an idea or existing project folder. CEC first
   retrieves compact current context, so a return visit does not restart onboarding.
2. The host uses the opening message and, if permitted, at most six small selected
   artifacts. It asks only material missing questions, at most three together.
   Unknown/skipped answers remain null/unknown instead of becoming invented facts.
3. The host saves and shows one hypothesis-led next test: one user journey, up to
   three capabilities, one critical unknown, Keep / Test / Park, technical acceptance,
   learning acceptance, a next check and zero cash spend. No business-plan form,
   startup score, automatic pivot or required interview-before-code is introduced.
4. The founder reviews or corrects it naturally. Approval binds to the exact draft
   version and project digest. A changed draft cannot reuse an old approval.
   Approved foundation/cycle records are immutable; M1 permits one approved cycle.
5. Codex retrieves the concise approved handoff and implements in the target
   repository, following its instructions and preserving its architecture.
6. The host records actual changed paths, checks, exit codes, output, run instructions
   and gaps. The application verifies result consistency and current selected-file
   hashes. It does not execute source instructions or silently run target scripts.
7. A new local SQLite backup includes committed WAL state, is integrity-checked and
   hashed. Reopening context shows the approved scope and latest receipt. Release,
   customer exposure and validation stay separate from code success.

The model provides reasoning; the local application validates and preserves state.
The founder never needs to compose the internal JSON requests. The application
trusts the host's report of human assent and executed checks; it cannot independently
authenticate a person or prove arbitrary host prose true.

## M0 warnings assessed

**Routine Node selection is resolved for the tested workflow.** A fresh shell still
reports Node 18.17.0, while the new local cec.ps1 launcher selects and verifies Node
24.19.0. The default runtime for other projects is preserved. No profile or global
PATH edit was needed. The launcher fails clearly if the pinned binary moves.

**Nested authenticated host startup remains a non-blocking sandbox limitation.**
The user already confirmed M0's actual desktop invocation. The revised M1 skill
passes the official validator and the actual repository scanner. This Codex task
used its instructions to implement both synthetic scenarios. No credentials were
read/copied and no sandbox protections were weakened. A fresh independent M1
desktop conversation was not separately observed or claimed.

## Commands and exact results

All CEC Node commands below used the pinned 24.19.0 executable. Full invocation
arguments, check outputs and receipts are retained in M1_CHECK_RESULTS.json.

| Executed check | Result |
| --- | --- |
| TypeScript compiler --noEmit | PASS, exit 0 |
| node scripts/check.mjs (build + offline suite) | PASS, exit 0; **56 passed, 0 failed, 0 skipped** |
| Independent npm ci --offline --ignore-scripts with populated local cache | PASS, exit 0; 8 locked packages |
| Clean-copy node scripts/check.mjs | PASS, exit 0; **56 passed, 0 failed, 0 skipped** |
| Lockfile hashes before/after clean install | PASS, byte-identical |
| npm ls --all --json | PASS, exit 0, exact dependency tree |
| Fresh-shell cec.ps1 doctor | PASS; Node 24.19.0, SQLite 3.53.3, win32/x64 |
| Fresh PowerShell command invocation with Unicode JSON stdin | PASS; accented and Japanese text preserved |
| Official quick_validate.py on the updated skill | PASS, exit 0: Skill is valid! |
| Installed Codex app-server skills/list, isolated unauthenticated profile | PASS; exact repository path, enabled=true, scope=repo |
| Idea fixture: python -m unittest -v | PASS, exit 0; 4 tests |
| Idea fixture: python handoff.py with sample-note.json on stdin | PASS, exit 0; runnable handoff text |
| Existing fixture: node --test | PASS, exit 0; 5 tests, including the original total test |
| Existing fixture: node report.mjs sample-invoices.json 2026-09-23 | PASS, exit 0; expected overdue order |
| Both actual receipts, separate-process resume and verified backups | PASS |
| Existing app's 5 selected original files | PASS; all hashes unchanged after implementation |
| Actual Git ignore checks for synthetic DB and backup | PASS |
| Original 5 groundwork/master/helper files | PASS; all hashes unchanged |

The 56 core tests comprise the 35 foundation regressions plus 21 M1 checks. They
cover unknowns, contracts/scope limits, stale and wrong-project approval, immutable
records, permission/bounded reads, artifact drift, existing-file preservation,
untrusted inputs, approval-before-handoff, failed/not-run receipt consistency,
separate validation state, learning-only preparation, WAL backup integrity, linked
backup refusal, migration refusal on unknown data, CLI/resume and Windows transport.
Node network transports are disabled and deliberately tested for denial. This is
not OS firewall isolation of native programs.

### Failures found and resolved

- Strict compilation initially rejected a number/bigint filesystem-size union;
  the size conversion was made explicit and final strict checks pass.
- The fresh Windows launcher test exposed pipeline binding and Unicode corruption.
  Input handling was fixed and the supported invocation is PowerShell command mode
  or direct Node. Windows pwsh -File can decode redirected input before a script
  executes; it is explicitly excluded from the UTF-8 internal transport contract.
- A PowerShell metadata-edit attempt could not parse the lockfile's empty root key.
  The lockfile was reconstructed from the installed exact integrity entries, then
  verified by a clean npm ci and unchanged lockfile hashes.
- The first offline clean install failed ENOTCACHED because original M0 development
  tarballs lived in a different scratch cache. The three exact official-registry
  tarballs were added to the project-local cache. A fresh clean copy then installed
  fully offline and passed all 56 tests. No dependency versions were changed to fix it.

## Synthetic complete-path rehearsals

These were scripted founder roles carried out by this implementing Codex task,
not independent participants or a blinded evaluation. Founder messages and scope
assents are labeled synthetic in fixtures/m1/scenarios.md. The host actually wrote
the implementations after recording those scoped synthetic approvals; checks ran
against the resulting files. Structured helper calls handled persistence, not an
autonomous model backend. No fictional customer response was supplied.

**Idea / no code / no customer evidence:** a small manufacturer's shift supervisor
needs a readable machine-stoppage handoff. Buyer and workaround were skipped.
CEC kept the problem as an assumption and selected two capabilities: validate a
note and render its next action. Codex wrote a dependency-free Python formatter,
four passing tests and a runnable synthetic note. No interviews were forced.

**Unfinished B2B application / no customer evidence:** a JavaScript invoice tracker
already totals unpaid invoices. Five named artifacts were explicitly permitted in
the opening message. CEC retained the working total and chose an overdue oldest-first
review. Codex added a separate module, local report command and tests. Existing
app.mjs, app.test.mjs, package.json, README.md and AGENTS.md remain byte-identical.
The CEC TypeScript stack was not copied into this application.

Both persisted implementation=completed while release=not_released,
customerExposure=not_recorded and customerValidation=not_established. These are
technical results only. Actual customer behavior is still unknown.

## Friction measured

| Measure | Idea | Existing application |
| --- | ---: | ---: |
| Additional material questions | 0 | 0 |
| Requests to repeat startup context | 0 | 0 |
| Scope approval turns | 1 | 1 |
| Extra artifact permission turns | 0 (no artifact reads) | 0 (permission in opening) |
| Founder-operated internal CLI commands | 0 | 0 |
| Scenario implementation corrections after its first check | 0 | 0 |
| Initial application calls through approved handoff | 1.04 s | 1.80 s |
| Resume application call | 0.28 s | 0.45 s |
| Resume context bytes | 3,464 | 4,438 |
| First response: explicit lines | 19 | 19 |
| Approximate display lines at 100 columns | 21 | 22 |

The prompts supplied sufficient context, so zero extra questions was appropriate.
These figures do not predict an unfamiliar founder's question count. Timings cover
local application work with scripted inputs; they exclude reasoning, human reading,
approval latency, implementation and creator setup. Real time-to-useful-action and
creator support minutes are **not measured**. No product usability gate is claimed.

An observed friction issue was the detailed first review: about 30/32 display lines
at 100 columns. A concise default summary reduced this to 21/22 while retaining every
capability and both acceptance categories; full basis remains available. Narrower
terminals can still wrap. Setup in another project still requires explicit skill
loading/target identification until later packaging; this was not hidden in the
friction totals. Windows host adapters must use the tested UTF-8 invocation path.

## Example first-session output

This is the actual final compact renderer output for the idea fixture:

```text
NEXT TEST
Turn one machine-stoppage note into a clear next-shift handoff.
For: Shift supervisors at small manufacturers [founder statement]

WHY THIS — HYPOTHESIS-LED
Current project: No code yet [founder statement]
Problem: The next shift may not know the next action after a machine stoppage [assumption]
Critical unknown: Can a supervisor act on a short handoff without the author explaining it?

DO NOW
After approval, build a local text formatter using one synthetic note.
Keep: Dependency-free local Python
Test (2/3): Validate machine, problem and next action; Render one concise handoff
Park: Accounts; Messaging and integrations; Dashboards
Technical checks: A complete note renders its machine, problem and next action; Missing required fields fail clearly

OBSERVE: Later, a relevant supervisor can explain the next action without coaching; difficulty is a valid negative result
Next check: Review after one supervised demonstration; no customer exposure has occurred. Spend: $0.
Code passing is not demand. Approve this scope, change it, show basis, or stop.
```

M1_EXAMPLES.md also contains the existing-project first session and the real demo
outputs. IDs and approval digests remain internal rather than founder-facing.

## Dependencies and design decisions

Added **Ajv 8.20.0**, the single direct runtime dependency, for versioned JSON Schema
validation (master §08.2). Its locked transitive packages are fast-deep-equal 3.1.3,
fast-uri 3.1.8, json-schema-traverse 1.0.0 and require-from-string 2.0.2. TypeScript
5.9.3, @types/node 24.13.6 and undici-types 7.18.2 are unchanged development packages.
All dependency tarballs use the official npm registry and integrity-bearing lockfile;
lifecycle scripts were disabled. No global package was installed. The existing
checksum-verified temporary PyYAML wheel was reused for the skill validator only.

ADR 0004 records conversation/state separation, reviewed scope, honest receipts,
the guarded schema-0 -> schema-1 migration, minimal SQLite backup and local launcher.
Node's small built-in argument parser remains sufficient. The canonical skill stays
at its actually tested .agents/skills path. Only M1-required layout was created.

## Files changed

The following maintained files were added or modified relative to the pre-M1 hash
inventory. Generated dist, node_modules, local caches and synthetic rehearsal
workspaces are excluded. Rehearsal applications live in the task's scratch work
directory; they are fixture implementations, not extra CEC product features.

| Change | File |
| --- | --- |
| added | `.agents/skills/customer-evidence/references/local-tools.md` |
| added | `cec.ps1` |
| added | `contracts/m1.schema.json` |
| added | `docs/adr/0004-m1-conversation-and-state.md` |
| added | `fixtures/m1/existing.json` |
| added | `fixtures/m1/idea.json` |
| added | `fixtures/m1/scenarios.md` |
| added | `fixtures/m1/unfinished/AGENTS.md` |
| added | `fixtures/m1/unfinished/app.mjs` |
| added | `fixtures/m1/unfinished/app.test.mjs` |
| added | `fixtures/m1/unfinished/package.json` |
| added | `fixtures/m1/unfinished/README.md` |
| added | `M1_REPORT.md` |
| added | `src/application/backup.ts` |
| added | `src/application/workflow.ts` |
| added | `src/cli/render.ts` |
| added | `src/domain/contracts.ts` |
| added | `src/persistence/workflow-store.ts` |
| added | `src/privacy/artifacts.ts` |
| added | `tests/workflow.test.ts` |
| modified | `.agents/skills/customer-evidence/SKILL.md` |
| modified | `AGENTS.md` |
| modified | `MANUAL_SETUP.md` |
| modified | `package-lock.json` |
| modified | `package.json` |
| modified | `PLAN.md` |
| modified | `README.md` |
| modified | `scripts/build.mjs` |
| modified | `src/application/initialize.ts` |
| modified | `src/cli/main.ts` |
| modified | `STATUS.md` |
| modified | `tests/cli.test.ts` |
| modified | `tests/initialize.test.ts` |

## Deferred work, unresolved limits and M2 recommendation

**M2 may begin as the next development milestone when explicitly authorized.**
No M1 manual action is required. The implemented synthetic path meets the M1 exit
from orientation through approved scope to actual implementation receipt and backup.
Keep the next milestone focused on its specified research/reach/interview loop.

Still deferred: research engine and research-informed basis; Reach Packs; customer
notes/quotes; real feedback/outcomes; adjacent-market comparison; a second cycle;
full restore/export/delete; model privacy disclosure and real-data recovery; trial,
payments, beta packaging; browser UI, services, sync, email, autonomous outreach,
vector search, multi-agent systems and additional coding-agent integrations.

Remaining limits: one tested Windows environment; Codex-managed runtime location;
repository-local skill installation; nested authenticated-host sandbox failure;
host-reported approval/execution; single-user filesystem race limits; local backups
on the same disk; no independently measured founder usability or customer demand.
Use synthetic fixtures until the later privacy/recovery gates are verified.

Stopped after M1. M2 has not begun.
