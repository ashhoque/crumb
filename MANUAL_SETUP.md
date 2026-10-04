# Current Codex installation (M3-R5 Phase 2 blocked candidate)

The only discoverable Crumb skill is installed directly at
`C:\Users\Ash\.agents\skills\crumb\SKILL.md`; it is not a wrapper. Its
version-controlled source is `skill/crumb/SKILL.md` in the Crumb repository, with
specialist references alongside it. Repository-local skill entries and the old
`pruvity`, `pruvello` and `customer-evidence` aliases are archived in
`docs/legacy-skills/` and are not discoverable. Stable persistence identifiers
remain unchanged.

For the current candidate, use the pushed `m3-r5-phase1` branch in the canonical source
checkout `C:\Users\Ash\Documents\Codex\CEC`. Build with pinned Node 24.19.0,
run `node scripts/sync-global-skill.mjs --install`, then run it without arguments
to compare hashes. Installation also writes/checks `runtime.json` beside SKILL.md,
with the actual pinned Node and built Core CLI paths; never commit this local locator.
The installed read-only MCP points to that checkout's compiled
`dist/src/cli/mcp.js`. Run the live host acceptance against the installed global
skill. Phase 2 is BLOCKED on live review persistence and excessive runtime discovery.
The installed code is `0095123`; see M3_R5_PHASE2_REPORT.md. Do not merge until all
required revision acceptance checks pass. Preserve untracked GLOBAL_CRUMB_SETUP.md.

Codex also reads `C:\Users\Ash\.codex\AGENTS.md` at host level. Its scoped
Crumb entry rule makes every visible message, including progress, speak as Crumb
and directs the host to use a supplied skill path without a repository search.
The product method remains in the installed skill. A live disposable-host probe
is required after installation; source-string checks alone do not prove the
visible voice. See `scripts/verify-closeout-host.mjs` and M3_R3_REPORT.md.

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

