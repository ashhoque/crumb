# CEC DEVELOPMENT GROUNDWORK
## Environment preparation before M0

This document is executed BEFORE `CEC_MASTER_SPEC_v0.5.md`.

Its only purpose is to make this computer ready for development of the
Customer Evidence Copilot MVP.

DO NOT begin implementing the MVP.
DO NOT begin M0.
DO NOT scaffold product features.

Complete the environment checks, install/fix safe prerequisites where
necessary, produce the readiness report, and then stop.

---

# 1. Objective

Prepare this machine so that the next Codex session can immediately begin
M0 from `CEC_MASTER_SPEC_v0.5.md`.

The intended development baseline is:

- Existing working Codex environment
- Git
- Node.js 24.x LTS
- npm or the package manager already used by the repository
- TypeScript dependencies installed locally later by the project
- Node built-in test runner
- Local SQLite through `node:sqlite` if the required spike passes
- Repository-local Codex instructions and skills
- No Docker requirement
- No PostgreSQL
- No Redis
- No vector database
- No hosted AI backend
- No cloud database
- No payment integration
- No external API keys for this groundwork

Do not install software merely because it might be useful later.

---

# 2. Execution permission

You are authorized to perform routine, reversible development-environment
checks and installs needed by this document.

Proceed automatically when the operation is:

- free;
- from an official or already trusted package source;
- directly required for this development environment;
- reversible;
- non-destructive;
- does not require credentials;
- does not require purchasing or activating a service;
- does not overwrite existing project configuration.

Do not repeatedly ask me for confirmation for ordinary checks, temporary
test files, version checks, or user-scoped prerequisite installation.

STOP and ask me before:

- using sudo/admin privileges;
- uninstalling software;
- replacing an existing major runtime;
- changing my shell profile substantially;
- deleting existing files;
- overwriting AGENTS.md or project configuration;
- signing into an account;
- creating a paid account;
- purchasing anything;
- activating billing;
- creating API keys;
- sending data to an external service;
- pushing to a Git remote;
- changing system security settings.

Never pipe an unreviewed remote installer directly into a shell.

Prefer official package managers, existing version managers, or
checksum-verified official downloads.

---

# 3. Inspect the machine first

Determine and record:

- Operating system and version
- CPU architecture
- Current shell
- Current working directory
- Available disk space
- Whether the filesystem appears local or network/shared/cloud-synchronized
- Available package managers
- Available runtime/version managers

Then inspect:

- Git version and location
- Node version and location
- npm version and location
- Any existing pnpm/yarn/bun installation
- Whether Codex is currently capable of shell commands and file edits
- Codex CLI version if the CLI is actually installed
- Presence of `AGENTS.md`
- Presence of `.agents/skills/`
- Presence of package.json and lockfiles
- Git repository status
- Git working-tree changes
- Existing Node version files such as `.nvmrc`, `.node-version`, or similar

Do not read `.env`, credentials, authentication files, SSH private keys,
browser profiles, or secret stores for this check.

Never print tokens or secrets into the report.

---

# 4. Find the CEC development root

Locate:

`CEC_MASTER_SPEC_v0.5.md`

Treat the directory containing the intended CEC source repository as the
development root.

If the master exists but there is no source repository yet, determine whether
this directory is clearly dedicated to CEC.

If it is clearly a dedicated empty/new CEC folder, local `git init` is allowed.

Do not:

- create a remote repository;
- push anything;
- make an automatic baseline commit;
- overwrite an existing repository;
- initialize Git inside another Git repository accidentally.

If repository ownership is ambiguous, stop and ask me which directory should
be the CEC development root.

---

# 5. Install only missing baseline prerequisites

## Git

If Git is already installed and working, keep it.

If Git is missing, use the safest normal installation method already available
on this operating system.

Prefer an existing OS package manager.

If installation requires administrator privileges or a GUI confirmation,
pause once and tell me exactly what approval is required.

After installation verify:

`git --version`

Do not configure a remote automatically.

## Node.js

CEC development targets Node.js 24.x LTS.

First inspect the currently installed version.

If a working Node 24.x installation already exists, keep it.

If another Node major is installed, do not uninstall it.

Prefer this order:

1. an existing Node version manager;
2. an existing trusted OS package manager capable of installing Node 24;
3. an official Node.js binary/installer from the official Node distribution,
   verifying its checksum where practical.

Install Node 24 alongside another major when reasonably possible rather than
destroying the existing environment.

After installation verify:

`node --version`
`npm --version`

Record the exact versions.

Do not globally install TypeScript, Commander, Ajv, React, Vite, SQLite npm
bindings, or other CEC dependencies during groundwork.

Those are project dependencies and must be reviewed and locked during the
appropriate implementation milestone.

---

# 6. Determine the project package manager

If an existing repository contains a lockfile, preserve its package manager.

Examples:

`package-lock.json` -> npm
`pnpm-lock.yaml` -> pnpm
`yarn.lock` -> yarn

Do not replace an existing package manager merely from preference.

If this is a new CEC repository with no package manager yet, use npm as the
baseline unless the master or an existing repository instruction says
otherwise.

Do not generate the production lockfile during groundwork unless required to
repair an already-existing project installation.

---

# 7. Verify Node itself

Run a temporary Node smoke test without modifying the product repository.

Verify:

- ESM execution works;
- Node built-in modules load;
- filesystem read/write works in a temporary directory;
- SHA-256 hashing works;
- random UUID generation works;
- Node's built-in test runner executes a trivial passing test.

Delete disposable temporary test files afterward.

Do not report success unless the commands actually ran successfully.

---

# 8. Perform the critical `node:sqlite` spike

This check is mandatory because CEC intends to use local SQLite if the
actual supported environment can handle the required behavior.

Use a disposable database in the operating system temporary directory.

Verify, using the actual Node runtime:

1. `node:sqlite` imports successfully.
2. A file-backed database opens.
3. Foreign-key constraints function.
4. A STRICT table can be created.
5. A transaction can commit.
6. A transaction can roll back.
7. WAL journal mode works for the temporary file database.
8. Parameterized statements work.
9. Unicode works correctly, including emoji and non-ASCII text.
10. An FTS5 virtual table can be created and searched.
11. The database closes cleanly.
12. Temporary DB/WAL/SHM files can be cleaned up.

Also record the SQLite version exposed by the runtime where possible.

If any required behavior fails:

DO NOT silently substitute another database library.

Record the exact failure in the groundwork report.

M0 will decide whether an adapter such as another SQLite package is justified.

---

# 9. Repository safety checks

Inspect without destroying anything.

Confirm:

- the development root is writable;
- existing files can be read;
- existing Git changes remain untouched;
- AGENTS.md is preserved;
- README files are preserved;
- existing package configuration is preserved;
- no automatic reformatting has occurred;
- no dependency upgrade has occurred merely because a newer version exists.

Check whether the project is located on an unusual shared/network filesystem.

If so, flag this because the planned SQLite development workflow assumes a
normal local filesystem.

Do not move the project automatically.

---

# 10. Codex repository-readiness check

Verify that repository-local instructions can be supported.

Check whether these locations can exist without collisions:

`AGENTS.md`

`.agents/skills/`

Do not create the full CEC skill yet.

Do not overwrite an existing skill.

If these paths already exist, inventory their names and report conflicts.

If Codex is being used through a working environment that can already edit
files and execute commands in this workspace, that is sufficient for
groundwork.

Do not install a second Codex interface merely because the Codex CLI binary is
absent.

If no working Codex execution environment actually has filesystem/shell access,
report that as a blocker.

---

# 11. Network/download readiness

Only test what is necessary for dependency installation.

Confirm that official package/download sources required by the selected
installation method can be reached.

Do not:

- create accounts;
- create API keys;
- configure Stripe;
- configure Lemon Squeezy;
- configure Reddit;
- configure email;
- configure cloud databases;
- configure deployment providers.

None of those are prerequisites for beginning M0.

---

# 12. Things that should NOT be installed

Do not install these merely for anticipated future use:

- Docker
- PostgreSQL
- Redis
- MongoDB
- a vector database
- Kubernetes
- Electron
- Next.js
- a cloud SDK
- Stripe SDK
- Lemon Squeezy SDK
- Reddit API libraries
- email infrastructure
- analytics infrastructure
- Playwright
- multiple coding-agent hosts
- a second model provider
- global TypeScript tooling
- global frontend frameworks

If M0 later proves one of these is genuinely required, that decision happens
there with justification.

---

# 13. Create the readiness artifacts

At the CEC development root create:

`GROUNDWORK_REPORT.md`

and

`ENVIRONMENT_SNAPSHOT.json`

The JSON snapshot must contain only non-secret technical information.

Include:

- date/time;
- OS;
- architecture;
- shell;
- Git version;
- Node version;
- npm version;
- selected package manager;
- Codex environment type/version when determinable;
- repository root;
- whether Git is initialized;
- whether the working tree was already dirty;
- node:sqlite import result;
- SQLite version where available;
- STRICT result;
- foreign-key result;
- WAL result;
- transaction result;
- Unicode result;
- FTS5 result;
- built-in test-runner result;
- filesystem readiness;
- skill-path readiness;
- blockers;
- manual actions still required.

Do not include:

- tokens;
- cookies;
- SSH material;
- API keys;
- environment-variable values;
- payment credentials;
- unrelated usernames/passwords.

---

# 14. Readiness classification

Use exactly one final state.

## READY

Use only when:

- Git is available.
- Node 24.x works.
- npm/package manager works.
- The workspace is writable.
- The master specification is present.
- Repository state has been preserved.
- The Node smoke test passes.
- The required node:sqlite spike passes.
- Codex can operate on the workspace.
- No unresolved prerequisite blocks M0.

## READY WITH WARNING

Use when M0 can safely begin but there is a non-blocking issue that must be
tracked.

## NOT READY

Use when a prerequisite prevents safe M0 development.

Explain the smallest action necessary to fix it.

---

# 15. Final response

When finished, tell me only:

GROUNDWORK STATUS: READY / READY WITH WARNING / NOT READY

Then provide:

Environment:
- OS
- Git
- Node
- npm/package manager
- Codex
- SQLite

Installed or changed:
- exact changes you made

Checks passed:
- concise summary

Warnings/blockers:
- concise summary

Manual action needed from me:
- only actions Codex genuinely cannot safely complete itself

Files created:
- GROUNDWORK_REPORT.md
- ENVIRONMENT_SNAPSHOT.json

Next step:
- "Ready to begin M0 from CEC_MASTER_SPEC_v0.5.md"
  OR
- the exact blocker preventing M0.

STOP after this report.

Do not begin M0 automatically.
Do not implement CEC features.
