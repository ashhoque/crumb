# CEC M0 report

**M0 PASS WITH WARNINGS**

Date: 2026-09-23. The technical foundation passes. The user confirmed the required
manual desktop skill invocation with the expected marker and workflow disclaimer.
This closes the final M0 gate using user-reported evidence. The automated host
launcher still cannot start inside this task's Windows sandbox and remains a
warning. No M1 work was started.

## What existed before

The full 1,785-line master, groundwork report, environment snapshot and existing
helper were read before implementation. The repository contained five untracked
files: `CEC_MASTER_SPEC_v0.5.md`, `GROUNDWORK.md`, `GROUNDWORK_REPORT.md`,
`ENVIRONMENT_SNAPSHOT.json`, and `Enter-CECEnvironment.ps1`; plus Git metadata and
an empty `.agents/skills/` directory. There were no commits, remotes, source files,
AGENTS.md, PLAN.md, README, package files, lockfiles, tests or existing skills.

The five original files retain their pre-M0 SHA-256 hashes. No original working
code or architecture existed to replace. No commit, push, Git remote, global
runtime upgrade or persistent Git trust setting was created.

## What changed

1. Added the minimum strict TypeScript/ESM build and Node test infrastructure.
   Node is pinned to the actually tested 24.19.0. The compiler and Node types are
   exact development dependencies, with an integrity-bearing npm lockfile.
2. Added a small isolated `node:sqlite` adapter. Connections enable foreign keys,
   WAL, a 5-second busy timeout and full synchronous writes; extension loading is
   disabled. Transactions commit or roll back, reject nesting and reject returned
   asynchronous operations. This is a synchronous, trusted internal adapter.
3. Added an M0 initializer. It targets an existing folder and changes only its
   `.gitignore` protection and `.customer-evidence/cec.sqlite` foundation. It
   creates an application identifier/version, with **no business tables or private
   customer records**. Repeat initialization is idempotent.
4. Added privacy checks: inspect the actual Git index, stop on tracked private
   paths, verify effective ignores, preserve existing ignore bytes, and reject
   linked/ambiguous paths or unrecognized storage. Protection precedes opening an
   existing SQLite database too, because WAL may need sidecar files.
5. Added minimal `init` and read-only `doctor` prototype commands. The initializer
   does not install packages into target folders, create Git repositories, run
   target package scripts, load `.env`, or fetch anything.
6. Added a repository-local M0 probe skill and an opt-in host verification script.
   The skill explicitly says the customer workflow is not implemented.
7. Added `PLAN.md`, `AGENTS.md`, README, three ADRs, `STATUS.md` and
   `MANUAL_SETUP.md`. The plan maps the repository to the master and keeps M1–M5
   deferred.

The machine-specific groundwork report/snapshot/helper are intentionally ignored
from Git while remaining unchanged on disk. Build output, dependency directories,
private storage and local test/cache artifacts are also ignored. npm cache writes
are repository-local; lifecycle install scripts and update notices are disabled.

## Files added

No pre-existing file was edited. The complete set of new maintained files is:

| Group | Paths |
| --- | --- |
| Repository configuration | `.gitignore`, `.node-version`, `.npmrc`, `package.json`, `package-lock.json`, `tsconfig.json` |
| Instructions/status | `AGENTS.md`, `PLAN.md`, `README.md`, `STATUS.md`, `MANUAL_SETUP.md`, `M0_REPORT.md` |
| Decisions | `docs/adr/0001-runtime-and-dependencies.md`, `docs/adr/0002-sqlite-and-private-storage.md`, `docs/adr/0003-codex-skill-boundary.md` |
| Skill | `.agents/skills/customer-evidence/SKILL.md` |
| Foundation | `src/application/runtime.ts`, `src/application/initialize.ts`, `src/persistence/sqlite.ts`, `src/privacy/storage.ts`, `src/cli/main.ts` |
| Development checks | `scripts/build.mjs`, `scripts/check.mjs`, `scripts/test.mjs`, `scripts/offline-guard.mjs`, `scripts/verify-skill-host.mjs` |
| Tests | `tests/helpers.ts`, `tests/initialize.test.ts`, `tests/sqlite.test.ts`, `tests/cli.test.ts`, `tests/offline.test.ts` |

Generated, ignored files include `node_modules/`, `dist/`, and `.m0-local/`.
Disposable test targets/databases were created under the OS temporary directory
and removed by the tests. Additional diagnostic evidence, isolated Codex test
state and the independent clean-install copy remain in the task's scratch `work/`
directory, outside the CEC repository. No actual `.customer-evidence/` directory
was initialized in the development repository.

## Dependencies added and why

| Package | Exact version | Purpose |
| --- | --- | --- |
| TypeScript | 5.9.3 | Local portable compiler, strict checking and ESM output; no package dependencies |
| @types/node | 24.13.6 | Types for the selected Node major, including built-in SQLite and test APIs |
| undici-types | 7.18.2 | Type-only transitive dependency of @types/node, fixed by the lockfile |

All three are development-only. **There are zero production npm dependencies.**
Packages came from the official npm registry; the lockfile records each resolved
URL and integrity value. A clean `npm ci --offline --ignore-scripts` reconstructed
the installation from the populated cache without changing the lockfile.

The registry also offered TypeScript 7.0.2 with native platform compiler packages.
ADR 0001 chooses the sufficient dependency-free JavaScript compiler for this M0.
Commander and a JSON Schema validator are deferred until real commands/contracts
need them. No database binding, ORM, frontend package, cloud SDK or global package
was installed.

For the official skill validator only, a PyYAML 6.0.3 wheel was downloaded from
official PyPI and SHA-256 verified. It was placed on one validation process's
import path; it was **not installed** into Python, the project or any global
environment. Both available Python runtimes initially lacked that validator
dependency. This temporary support artifact is outside the repository.

## Executed checks and exact results

| Check | Exact result |
| --- | --- |
| Strict type check (`tsc --noEmit`) | Exit 0, PASS |
| Root build and deterministic suite (`npm run check` equivalent using the selected Node) | Exit 0; **35 passed, 0 failed, 0 skipped** |
| Independent clean installation (`npm ci --offline --ignore-scripts`) | Exit 0; 3 locked packages installed; PASS |
| Build and suite in clean copy | Exit 0; **35 passed, 0 failed, 0 skipped** |
| Lockfile before/after clean installation | Byte-identical; PASS |
| Dependency tree (`npm ls --all --json`) | Exit 0; exactly the packages above; PASS |
| Built `doctor` | Exit 0; actual Node 24.19.0, SQLite 3.53.3, win32/x64; PASS |
| Original-file preservation | All 5 pre-M0 SHA-256 values unchanged; PASS |
| Actual repository ignore checks | 7 paths checked: private DB/WAL/SHM/backup, local host receipt, dependency file and machine snapshot; all ignored; PASS |
| Official skill validator | Exit 0: `Skill is valid!`; PASS |
| Actual installed Codex scanner, isolated test profile | Exit 0; exact repository skill path, `scope: repo`, `enabled: true`; PASS |
| Normal host launcher (`npm run check:host`) | Exit 1; host exits before responding; home directory unavailable |
| Existing-profile host launch after permission grants | Exit 1; `Error: Access is denied. (os error 5)` |
| Actual skill invocation | PASS by user-reported manual desktop check on 2026-09-23: `CEC_M0_SKILL_LOADED` followed by `The customer workflow is not implemented.`; not independently observed by this task |
| Node 18 CLI negative probe | Blocked by sandbox `EPERM` during Node's path resolution, before CEC loaded; **not credited as a runtime-guard pass**. Unit tests for runtime rejection passed. |

The manual result closes the required invocation gate. The failed automated host
receipts remain unchanged; the desktop result is recorded separately in
`MANUAL_SETUP.md` and the consolidated check results. This follow-up changed
documentation and evidence only, so the already-passing code suite was not rerun.

The 35 deterministic tests comprise:

- **20 initialization/privacy tests:** empty and existing folders, idempotence,
  preservation of source/manifest/instructions/staged index, CRLF/BOM ignore
  prefixes, tracked private files/databases, ignore negations, nested projects,
  unknown storage, path collisions, invalid ignore encoding, junctions/linked
  ancestors, hard links, foreign/future database versions, orphaned sidecars,
  invalid targets, and bare Git repositories.
- **9 SQLite tests:** file-backed open/version/close, foreign-key enforcement,
  STRICT types, commit and rollback durability across reopening, WAL/SHM creation
  and cleanup, parameterized Unicode/emoji and SQL-like text, FTS5, read-only
  connections/disabled extensions, and rejected nested/asynchronous transactions.
- **4 CLI/runtime tests:** truthful diagnostics without storage writes, paths with
  spaces/Unicode, invalid input without mutations, and unverified-runtime rejection.
- **2 offline/ESM tests:** actual rejection of socket/HTTPS/DNS/fetch attempts by
  the test guard, plus built-in SHA-256/UUID and compiled ESM execution.

The suite's Node network transports are disabled in both test and CLI child
processes; deliberate connection attempts verify that the guard is active.
This is a real runtime restriction for these deterministic tests, **not a claim
of OS firewall isolation** or containment of arbitrary native programs.

## Environment conflicts and resolved failures

- Git initially reported different ownership between Codex's online/offline
  sandbox accounts. Read-only project inspections used `-c safe.directory=` for
  this exact known repository only. No global trust setting was changed. Product
  initialization deliberately refuses unverifiable Git state.
- Git still warns that the user-level ignore file is inaccessible; repository
  ignore behavior was tested directly and passed.
- The first npm check encountered an inaccessible user cache. `.npmrc` now keeps
  cache writes in ignored `.m0-local/npm-cache` and disables update notices.
  The check runner uses the same Node executable throughout; the final check and
  clean-install suite passed.
- The skill validator initially failed because PyYAML was missing; the isolated,
  checksum-verified wheel allowed the unchanged official validator to pass.
- Normal Codex bootstrap could not resolve its home. Explicitly selecting the
  existing profile produced Windows access denial; targeted and profile access
  grants did not resolve it. The isolated unauthenticated profile successfully
  exercised the actual scanner, without copying credentials or creating a login.

## Deviations and deliberate deferrals

- Only required portions of the illustrative repository layout were created.
  There are no empty workflow/domain/commercial/research scaffolds.
- The canonical skill is in `.agents/skills/`, the actual supported discovery
  location, rather than a duplicated top-level `skills/` directory (ADR 0003).
- The initial CLI uses the Node argument parser; a dedicated parser and schema
  library are not justified by the two M0 prototype commands (ADR 0001).
- The M0 SQLite file has identity/version metadata only. Business entities,
  migrations, customer content and backup/restore are deferred.
- The invocation requirement was completed through a user-reported manual desktop
  check. Automated authenticated invocation remains unavailable in this sandbox;
  syntax validation and scanner discovery are recorded as separate checks.

No dashboard, hosted service, cloud sync, payment, outreach sender, CRM, email,
vector search, multi-agent system, additional host integration, or M1 feature was
implemented. Full product acceptance AC01/04–38/41/43–45 remains untested/deferred;
only the M0 foundation portions of AC02/03/39/40/42 are covered.

## Unresolved risks and M1 recommendation

**M1 can safely begin within its specified scope when separately authorized.**
All required M0 checks now have passing results, with actual invocation supported
by the user's manual report rather than an independently observed automated turn.
No M0 manual action remains. `MANUAL_SETUP.md` records the exact response and keeps
the procedure available for future checks. M1 has not been authorized or started.

Non-blocking limits: this is one tested Windows machine; the Node 24 binary is
Codex-managed while fresh shells default to Node 18. Other OSes, network/shared
filesystems, concurrent initialization, encryption, complete recovery and beta
distribution have not been established. Same-user filesystem races are not a
security boundary. Real founder/customer material must wait for the later
privacy and recovery requirements.

## Technical references

- [TypeScript's Node module modes](https://www.typescriptlang.org/tsconfig/module.html)
- [Node 24 SQLite documentation](https://nodejs.org/docs/latest-v24.x/api/sqlite.html)
- [Codex local skill discovery](https://learn.chatgpt.com/docs/build-skills)
- [Codex app-server skill discovery/invocation API](https://learn.chatgpt.com/docs/app-server)
- [Codex state-location settings](https://learn.chatgpt.com/docs/config-file/environment-variables)

Stopped after M0. M1 is not started.
