# Try Crumb (alpha)

Crumb is a Codex skill that helps clarify an idea, research alternatives, and choose
a small next step. This alpha uses the existing M1-R2 skill and local runtime.
It is not a standalone chatbot. Allow about 10–15 minutes for a first trial.

## 1. Get ready

You need Git, a signed-in Codex app or Codex CLI with repository skill support,
and **Node 24.19.0** with npm **9 or newer** (the development pin is npm 9.6.7).
Select the exact Node version in `.node-version`; other versions are rejected by
the existing runtime. If you use a version manager, install/select that version.
Otherwise get the matching installer from [Node releases](https://nodejs.org/en/download/archive).
Codex access/usage is provided by your own account; setup does not supply it.

In a terminal:

```sh
git clone https://github.com/ashhoque/crumb.git
cd crumb
npm run setup
```

Setup installs lockfile dependencies without package lifecycle scripts, builds
the existing runtime, and checks Node/SQLite. It needs npm registry access on first
install. It changes only this clone's ignored `node_modules/` and `dist/` folders;
it does not install a global skill, change PATH, or initialize your project.
Rerun the same command after pulling updates. The local runtime check does not
verify Codex discovery, research access, or conversational quality.

## 2. Open and use the skill

Open **the cloned `crumb` folder** as a project in Codex and start a new chat.
CLI users can run `codex` from that folder. Send:

```text
$crumb Run the discovery probe only.
```

Expected reply: `CRUMB_M1R2_SKILL_LOADED`, with pre-build evaluation available.
This probe should not create project data. Then try:

```text
$crumb Let's try a synthetic example. I want a personal tool to compare stocks,
because I keep forgetting why I preferred one over another. Help me clarify
the problem before deciding what to build.
```

Continue naturally. Try “View competitors”, “Why?”, or correct an assumption.
Look for a clearer problem, inspectable sources, and a next step that fits your goal.
Crumb should distinguish synthetic examples, real public findings, and unknowns.
Research depends on your host's available tools and permissions.

For your own existing project, keep this Codex chat open and explicitly name its
absolute folder, for example:

```text
$crumb Use my existing project at /absolute/path/to/my-project. Read its README
and relevant code, preserve its stack, and help me decide what matters next.
```

Replace the path (on Windows, use your actual `C:\...` folder). Crumb is scoped
to this clone; opening another repository alone does not install it there.
The host must have access to your selected folder; approve any required folder
access in Codex. Normal use can add an ignored `.customer-evidence/` workspace
and protective `.gitignore` rules in the selected target. Use a disposable folder
for a synthetic trial. Keep this clone while using Crumb; the skill relies on its runtime.

## 3. Send feedback

[Open alpha feedback](https://github.com/ashhoque/crumb/issues/new?template=alpha-feedback.yml).
A GitHub account is required. Include what you tried, expected, and got, plus
whether setup worked and whether the conversation helped. Run `git rev-parse --short HEAD`
to identify your checkout. A redacted excerpt or screenshot is optional.
If you cannot use GitHub, send those same details directly to the friend who invited you.
Do not attach credentials, customer notes, or `.customer-evidence/` databases.
Nothing is sent automatically; there is no telemetry or feedback upload.

## If something gets stuck

- Wrong Node: run `node --version`, select 24.19.0, and rerun setup in the same terminal.
- Install fails: check npm registry/network access and rerun setup; keep the error for feedback.
- Skill missing: confirm Codex opened this clone, start a fresh chat/reopen the project,
  and check `.agents/skills/crumb/SKILL.md` exists. As a fallback, ask Codex to read that
  file explicitly and use its instructions, keeping this clone as the installation root.
- Runtime trouble: `npm run crumb -- doctor` checks the local runtime again.
  This command is a diagnostic, not the conversational skill.

For developer verification, `npm run check` builds and runs the offline suite.
An optional `npm run check:host` probes the installed Codex CLI using your normal
account and may consume usage. The manual probe above is enough for a first trial.
The [milestone trial guide](M1_R2_TEST_GUIDE.md) has deeper scenarios.

Current limits: no raw confidential customer-data import, automated outreach,
spending, deployment, or second tracked build cycle. Public research and passing
tests do not establish customer demand. Build scope remains reviewable before execution.
