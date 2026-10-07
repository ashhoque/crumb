# Try Crumb (closed alpha on Windows)

Receive **setup.bat** and double-click it. Keep the window open through the five
installation stages. Codex CLI opens in that same window with `$crumb` already
activated in its first message. Tell Crumb what you want to work on.

## Already-installed prerequisites

Git, Node **24.19.0**, npm **9+**, and authenticated working **Codex CLI** must be
available on PATH. This branch pins Node exactly and uses its built-in SQLite.
Having only the desktop app without the `codex` command is insufficient. Missing
or incompatible prerequisites produce an error; setup does not install them or
change global runtimes. GitHub and npm registry access must work. If the repo is
private, Git authentication/access must already work without login prompts.

## Installation

Setup clones the latest `alpha-testing-layer` into the account's Windows local
application-data directory under `CrumbAlpha/runtime`. Clean existing installs
update by fast-forward fetch/merge. It runs the existing `npm run setup`: locked
dependencies with lifecycle scripts disabled, TypeScript build, and Node/SQLite
`doctor`. Detailed command output goes to `CrumbAlpha/setup.log`.

Only Crumb is installed in the OS account's global `.agents/skills/crumb`, with a
runtime locator and ownership hashes. Other skills are untouched. An unrelated
existing Crumb skill or modified owned files cause an error and are preserved.
Missing owned files and interrupted unmodified updates can be repaired by rerunning.
Concurrent installers are prevented. No administrator permissions are required.

**This M1-R2 branch has no required MCP servers.** Its skill invokes the local CLI;
no MCP service, credentials or registration are needed. Setup checks the copied
files, then starts the actual Codex app-server and requires the exact installed
skill to be enabled with `user` scope from a separate workspace. It also asks
Codex to parse its effective configuration. It prints **Crumb is ready!** only
when all installation checks pass, then launches Codex CLI with a Crumb welcome.

The initial workspace is `CrumbAlpha/workspace`, separate from the runtime source.
A process-local override trusts only this workspace for the launch. Normal tool
approval and sandbox settings remain in effect. Setup never rewrites `config.toml`.
Inherited `CODEX_HOME` remains in effect for configuration and authentication;
global skills use the OS home independently of `CODEX_HOME`. Codex may maintain
its own normal session files. See [official skill locations](https://learn.chatgpt.com/docs/build-skills)
and [CLI commands](https://learn.chatgpt.com/docs/developer-commands?surface=cli).

## Test and send feedback

Try an idea or a clearly labeled synthetic example. Ask “View competitors” or
“Why?”, correct an assumption, and check whether the next step fits your goal.
For an existing project, name its actual absolute folder and files Crumb may read.
Ordinary tool/folder permissions can still apply during use; installation does
not disable them. Keep the runtime folder while using the skill.

[Send alpha feedback](https://github.com/ashhoque/crumb/issues/new?template=alpha-feedback.yml)
or reply to your inviter. Include what you tried, expected and got. Errors stay
visible until acknowledged. After a network interruption, double-click setup again.
Nothing is sent automatically. Do not attach credentials or customer databases.

This branch retains M1-R2 limits: no raw confidential imports, automated outreach,
spending, deployment, or second tracked build cycle. Technical checks and public
research do not establish customer demand.

## Maintainer verification

`npm run check` runs offline regressions and installer file tests.
`node scripts/verify-alpha-install.mjs` probes native Codex in an isolated fixture
without copying authentication. This Windows Codex build uses the real OS home
even with HOME/USERPROFILE overrides, so the fixture proves **repo discovery**,
not global user discovery. Production installation still requires `user` discovery.
`scripts/verify-alpha-bootstrap.ps1` exercises the Windows bootstrap with synthetic
command adapters, not a live GitHub download or an interactive model response.
See [verification results](docs/ALPHA_INSTALLER_VERIFICATION.md).
