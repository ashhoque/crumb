# Closed-alpha installer verification — 2026-10-07

Implemented on `alpha-testing-layer`, preserving this branch's M1-R2 runtime.
Distributable: repository-root `setup.bat`. It embeds its bootstrap PowerShell;
all runtime scripts, skill content and dependencies are retrieved automatically.
No prerequisite installers, new runtime dependency, MCP server or config rewrite.

## Executed on native Windows

- Existing `npm run setup`, using already-installed pinned Node 24.19.0:
  exit 0. Actual `npm ci --ignore-scripts --include=dev` installed 8 packages,
  TypeScript build passed, doctor reported Windows x64 and SQLite 3.53.3.
- Pinned Node `scripts/check.mjs`: exit 0, **147/147 tests passed**. Covers all
  existing regressions plus fresh/repeat global skill file placement, runtime
  locator, byte-preserved Codex config/other skills, collision and junction refusal.
- Windows PowerShell `scripts/verify-alpha-bootstrap.ps1`: exit 0, **9 scenarios
  passed**: fresh, repeat, failed download, failed dependencies, failed verification,
  dirty runtime, launch error, wrong Node, missing prerequisite. Runs actual
  cmd.exe and Windows PowerShell with a copied standalone batch file in a path
  containing spaces. Git/npm/Node/Codex are synthetic command adapters. Verifies
  fail-fast behavior, no premature readiness/launch, initial `$crumb` prompt and
  workspace arguments. This is not a real remote install or interactive launch.
- Pinned Node `scripts/verify-alpha-install.mjs`: exit 0. Actual installed Codex
  app-server initialized, parsed isolated config, discovered the copied enabled
  skill with **repo** scope, and preserved the test config bytes after repeat
  installation. No model turn, authentication copying or private data access.
- Embedded PowerShell syntax parsing: passed. `git diff --check`: passed.

## Limits and earlier failures

No end-to-end double-click installation under a separate real Windows account or
interactive authenticated Codex welcome was executed. Global **file placement**
was tested in synthetic homes; actual discovery with `user` scope for the newly
installed skill remains unverified in a clean account. The production installer
requires that check and refuses to print readiness if it fails.

This Codex build derives user skills from the OS account home even when HOME and
USERPROFILE are overridden. The isolated native discovery test therefore uses
repo scope; it is deliberately not claimed as global discovery. The maintainer's
existing global Crumb skill was preserved. This branch has **no required MCP**,
so an MCP connectivity pass is inapplicable; the real local runtime doctor passed.

The first regression attempt picked up ignored dist output from a newer branch;
a clean generated build removed that contamination. Sandbox fixture permissions
blocked subsequent tests, and using fixture temp paths under this repository made
a non-Git-folder assertion fail. Final suite passed outside the sandbox using
ordinary temporary directories outside the Git checkout. These failed runs are
not represented as successful checks.

The prerequisites include this architecture's exact Node 24.19.0 pin and a Codex
CLI on PATH. A working older Node or desktop-only Codex does not satisfy them.
Installer stops with a clear error rather than installing/upgrading prerequisites.
GitHub/npm connectivity, pre-existing authentication and ordinary Codex runtime
permissions still apply. User edits and unrelated pre-existing Crumb installations
are preserved by refusal rather than silently overwritten.

Additional native shim probe: pinned Node scripts/verify-alpha-install.mjs --shim, exit 0. A PowerShell shim in a path with spaces successfully started the real Codex app-server; the isolated fixture still had repo scope.

Final launch verification: native Codex accepted the actual process-local trust
override through its config layers in a path with spaces and dots. The launcher
uses direct Node argv to the executable or official npm JS entry, avoiding legacy
PowerShell quote loss. A native subprocess test preserved the exact workspace,
TOML override and `$crumb` prompt through a synthetic npm entry point. After atomic
skill/manifest replacement and missing-file repair checks were added, the focused
installer/setup tests passed 7/7 (exit 0). The full suite had passed 147/147 before
that final atomic-copy adjustment. No interactive authenticated welcome is claimed.
Post-publication fresh download proof: actual GitHub clone of alpha-testing-layer
at adc7fee into a disposable path with spaces, followed by the published npm setup:
exit 0. setup.bat, install-alpha.mjs and launch-alpha.mjs were retrieved from GitHub;
locked dependency install, TypeScript build and Windows SQLite doctor passed in
that fresh clone. This still excludes global skill registration and interactive
Codex launch under a separate real account.
Distribution follow-up: anonymous HTTPS Git access to the alpha branch failed
with Git requesting a username. Receiving setup.bat alone therefore does not
provide repository access. A minimal 74,895-byte runtime ZIP was prepared outside
the repository: only src, contracts, the Crumb skill, four setup/launch scripts,
Node pin, TypeScript config, package manifest and lockfile. Extraction followed
by actual npm setup/build/SQLite doctor passed on Windows (exit 0). This package
has not been made public. Anonymous distribution requires approval to publish
this bounded runtime artifact, or granting each tester access to the source repo.
Removed --depth=1 from update fetch so later commits retain ancestry for the
existing fast-forward merge. All nine native synthetic bootstrap checks passed.
