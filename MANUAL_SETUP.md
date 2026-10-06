# Current Codex installation

The sole active skill is `C:\Users\Ash\.agents\skills\crumb\SKILL.md`.
Canonical source is `skill/crumb/SKILL.md`; the installer uses an explicit active
reference allowlist. Historical skills/references live in `docs/legacy-skills/`
and are not runtime entries. Stable persistence identifiers remain unchanged.

Use the shipped `main` checkout at `C:\Users\Ash\Documents\Codex\CEC` for releases.
A development candidate is installed only for an authorized revision acceptance;
see STATUS.md for its exact state. Build with pinned Node 24.19.0, run
`node scripts/sync-global-skill.mjs --install`, then run without options to verify
all active file hashes, the generated runtime locator and native identity guard.
Preserve unrelated untracked GLOBAL_CRUMB_SETUP.md.

`runtime.json` contains exact pinned Node/Core paths and compact common operation
inputs. Read it once; reuse contracts. Progressive local-tools guidance covers
uncommon operations. The read-only MCP uses the same checkout's built CLI/MCP.
The installed scoped developer exception makes the first assistant message speak
as Crumb despite generic skill-announcement instructions. Detailed personality
remains canonical in SKILL.md. Clients replacing developer instructions must retain
this exception. Use real installed-host text acceptance; string guards alone do
not prove conversation behavior. Current authority is CURRENT_PRODUCT_AUTHORITY.md.

## Historical setup after M1-R2

Git is installed and authenticated, main tracks origin/main, and the existing
project is published at https://github.com/ashhoque/crumb. No download or terminal
setup remains for this machine. Crumb M1-R2 is implemented; use M1_R2_TEST_GUIDE.md.
Revised M2 has not begun. The M0 history below remains historical evidence.

## M0 host verification history

The user reported the requested manual desktop reply:

```text
CEC_M0_SKILL_LOADED
The customer workflow is not implemented.
```

That closed M0's invocation gate using user-reported evidence. The automated
authenticated launcher could not start in the sandbox (Windows access denial).
That environment limitation has not been represented as an automated pass.

The updated M1 skill was validated and discovered by the real repository scanner.
This task exercised both synthetic founder paths with actual implementation and
receipts. Those are scripted developer rehearsals, not an independent usability study.

## Historical supported entry (before M3-R5)

Open CEC as a Codex project and say `$crumb Let's try a synthetic example.`
The host prepares a unique temporary example and handles the internal commands.
The first response asks whether you are starting fresh or have a project in progress.
Known context prevents repeated onboarding. Normal action follows meaningful
evaluation; an explicit build request can bypass it after scope review. There
are no forms or founder-facing setup commands.

From a task outside this repository, explicitly load:
`C:\Users\Ash\Documents\Codex\CEC\.agents\skills\crumb\SKILL.md`.
The new skill is verified by the installed repository scanner. Its fresh interactive
invocation still needs your own trial; automated nested authenticated host startup
remains limited by the sandbox. This is a verification warning, not a required
machine configuration change. Do not weaken protections or copy credentials.
For another repository, explicitly load the Crumb skill and identify the target;
packaged skill installation is deferred. Do not copy secrets or host credentials.

On this machine `cec.ps1` selects verified Node 24 for CEC without replacing the
global Node 18 runtime. No shell-profile or PATH edit is required. Use the documented
direct pinned Node route for JSON stdin; a launcher pipeline lost input during rehearsal.

## Before real data or beta use

Keep using synthetic fixtures through the remaining privacy/recovery work.
Full recovery/data rights and model disclosure must precede real customer data;
clean-machine packaging and commercial work are deferred without a fixed milestone. No account, API key, payment setup or customer outreach is
needed to continue authorized development.

