# Pruvello

**The business copilot for AI builders.**

Clarify an idea or existing project's problem, then choose a small test or Build now.
Implement its approved scope in Codex and retain what the checks actually proved.
M1-R uses a short Executive Summary, one useful next action and optional detail.
This is a development prototype for **synthetic examples only**, not a beta for
real founder/customer notes. See STATUS.md and M1_R_REPORT.md for current results.

The next milestone is the approved **Crumb M1-R2** correction. This initial Git
checkpoint preserves the existing implementation before that work starts. See
[development decisions and proposals](docs/development/README.md).

## Founder experience

In this repository's Codex project, invoke `$pruvello` and speak naturally:

> $pruvello Let's try a synthetic example. Start with the first interaction.

The first interaction asks whether you are starting fresh or already have a project.
For a demo, the skill prepares a disposable synthetic example for you; no manual
CLI or copying files. Choose fresh, existing/no users, or supply synthetic pilot
feedback for the existing project. The temporary example can be cleared by the OS.

IDEAL means Intention, Define the Problem, Evaluate the Problem, Act / Build, Launch
& Learn. It guides the conversation without forcing stages. State your goal once,
or skip it. Existing projects start with permitted relevant files and a drafted
understanding for correction. Unknown buyer, missing evidence and skipped research
do not block a small build.

Replies start with a short Executive Summary and one recommended action, normally
under 120 words. Every capability stays visible before approval. Say **Build now**
to approve that displayed build scope, **Correct my understanding** to revise it,
or **Why?**, **View research**, **View evidence**, **View competitors**, **View sources**
for optional detail. The detail below is optional—you can continue without reading it.
Research is a preview only; nothing is searched in M1-R. Supplied feedback remains
founder-reported, with sources/limitations separate from solution validation.

After approval, Codex implements only that slice, runs real checks, records a receipt
and creates a local backup. View checks shows actual results and planned criteria
separately. Returning to the same target reuses saved context. You can stop business
guidance and continue ordinary coding at any time.

Orientation can now be saved before any build is proposed. The default first value is a clearer problem and a brief evaluation; Build now remains available at every stage.

The founder does not fill JSON forms or operate the internal CLI. All M1-R proposals
remain HYPOTHESIS-LED. Passing tests means code worked in those checks; it does not
prove demand, release, customer exposure or validation.

The skill is currently discoverable in this repository (still stored in the CEC folder).
The old `$pruvity` and `$customer-evidence` names forward to Pruvello for compatibility. For a different project,
the host can explicitly load this same SKILL.md and target that project's folder,
or work from the CEC task with the target path. A packaged per-project installation
experience is deferred; no skill is silently copied into a customer's repository.

## Development on the prepared Windows machine

```powershell
.\cec.ps1 check
.\cec.ps1 doctor
```

The local launcher selects and verifies Node **24.19.0** for each invocation, even
when a fresh shell defaults to Node 18. It changes no global PATH, profile or
installed runtime. An optional CEC_NODE environment variable can name the pinned
executable on another machine. If the Codex-managed binary moves or changes version,
the launcher stops rather than silently using a different runtime.

After a fresh checkout, install the exact lockfile dependencies once:

```powershell
npm ci --ignore-scripts
.\cec.ps1 check
```

Run the install with Node **24.19.0** and npm **9.6.7** available in that terminal.
The existing machine's optional `Enter-CECEnvironment.ps1` helper is not included
in Git; a fresh checkout does not require that helper. Node's test runner
executes compiled strict TypeScript/ESM tests with Node network transports disabled,
including CLI children. This is not a claim of OS-level network isolation. Ajv is
the sole direct runtime dependency; there is no model SDK, service or database ORM.

Public local operations are `doctor`, `demo fresh|existing|feedback`, `init [folder]`, `status [folder]` and
`backup create [folder]`. In normal use the skill performs operations when needed.
Internal operations use versioned JSON contracts and stdin; see the skill's
local-tool reference when developing the host integration. Send JSON input directly
to the verified Node entry point; one launcher pipeline lost input during rehearsal.
The skill handles this internally. `pwsh -File` can decode input before the script.

## Storage and approval boundaries

The only target setup changes are additive ignore protection and the private
`.customer-evidence/` workspace. Useful target code, architecture, package files,
README and AGENTS.md remain under the founder's control. Orientation never executes
target scripts, installs dependencies or reads `.env`/credentials. Actual approved
implementation is performed by Codex under the target's existing instructions.

CEC checks the Git index and effective ignores before private storage is opened.
Already tracked private data, linked paths, collisions, unsupported schemas or
unverifiable Git ownership stop with remediation. CEC never automatically untracks
files or changes Git trust settings. Existing ignore bytes are preserved.

A metadata-only M0 workspace migrates atomically on its first saved draft. Draft
revisions invalidate older approval digests. One founder-approved cycle is immutable;
receipts append without overwriting earlier results. Approval and check execution
are reported by the trusted host; CEC verifies consistency and file hashes, not
the truth of arbitrary host statements. It is not a coding-agent sandbox.

`backup create` writes a new SQLite snapshot under ignored private storage, includes
committed WAL content, verifies database integrity and returns its SHA-256. It never
overwrites live data. Copies on the same disk do not protect against disk loss.
Full restore/export/delete and real-data recovery/privacy gates must pass before retaining real customer notes; these are deferred beyond synthetic M1-R.

No research engine, Reach Pack, notes import, second cycle, dashboard, cloud service,
email, autonomous outreach, payment, numerical score or automatic pivot is included.
M2 requires separate authorization.

## Current development reference

PRODUCT_SPEC.md is the active v0.6 master; CEC_MASTER_SPEC_v0.5.md is historical.
M1_R_REPORT.md covers the Pruvello correction; M1-R_REPORT.md covers the earlier
Pruvity revision. Runtime display identity lives in src/domain/brand.ts. Stable
package/storage/schema identifiers deliberately retain compatibility names.

