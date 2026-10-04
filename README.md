# Crumb

**The business copilot for AI builders.**

Crumb helps clarify an idea or existing project, investigate the problem and
alternatives, then choose a considered next step. Current milestone:
**M3-R1 - Conversation Mode to Work/Build Mode**. See [status](STATUS.md),
[implementation report](M3_R1_REPORT.md) and [focused quality trial](M3_R1_QUALITY_TEST_GUIDE.md).
The focused correction strengthens research ownership, technical feasibility,
proactive first-user avenues and past-behavior interviews within the same architecture.
The existing project was preserved and pushed to GitHub before this work.
[Development decisions](docs/development/README.md) retain the approved proposal.

## Founder experience

In this repository's Codex project, invoke `$crumb` and speak naturally:

> $crumb Let's try a synthetic example. I want to compare stocks for myself,
> but I keep forgetting why I preferred one over another.

Crumb uses known context, clarifies your intention and narrows the problem before
recommending work. It investigates relevant competitors, manual and AI substitutes,
users' problem language, pricing, reported traction and limits, gaps and habitats.
A personal tool does not need a venture-scale business case. Skipped intention
remains unknown without repeated prompting. Existing code is preserved and read
within permission. Raw confidential customer-source import is outside this milestone.

Crumb explicitly confirms your Intention, initial User and Problem, then investigates
the opportunity. Research may send the conversation back to Define and reconfirm.
You review the evaluation before a concise commitment summary asks:
**Are you ready to commit a build cycle to this?** Clear natural agreement with
that current commitment saves a portable handoff. An early request cannot bypass this
guided workflow. The concrete implementation scope still requires approval.

Say **View competitors**, **View what users are saying**, **View market gaps**,
**View adjacent opportunities**, **View user habitats**, **View sources**, **Why?**,
**View technical evaluation**, **View first-user avenues**,
or **Open full research** when useful. Details are contextual and paginated.
**The extra detail is optional — you can continue without reading it.**
An optional opportunity brief retains research and challenges important claims.
Before Act it excludes solution scope; after Act a startup master may include it.
Skipping the document does not bypass confirmation. Founders do not fill JSON forms or run tools.

After explicit Act readiness, Crumb saves compact context and a Build Handoff.
Continue in the build-capable session with **Continue the Crumb build.** In ChatGPT
with verified shared Project files, the instruction is to open Work in that same
Project. This repository implements a portable text adapter, not native cloud sync.
It never claims to have opened another chat or moved local files automatically.

The build session verifies the handoff and permitted repository, then prepares all
six Build Pack documents before code. Review one journey, one to three capabilities,
KEEP / TEST / PARK, risks and the stage/checkpoint policy. After approval, Codex
edits and tests the authorized stage. Passing exits may advance within an approved
automatic policy; failures and human checkpoints stop it. The final MVP always
stops for your review. Technical success is not customer validation. Existing
M2 runs retain their original manual review policy.

Say **Adjust scope**, **View build plan**, **Pause**, or correct the understanding
at any point. Unknown customer tooling gets proportionate groundwork; existing
working setup is reused. Crumb keeps the customer's stack and prior work.

The only active `$crumb` skill is installed globally. Its version-controlled
source lives in `skill/crumb/`; the old aliases are archived and do not shadow
it in this repository. It never silently installs an app stack into a customer
project. See [current setup](MANUAL_SETUP.md) for installation and hash checks.

## Development

On the prepared Windows machine:

```powershell
.\cec.ps1 check
.\cec.ps1 doctor
```

The launcher selects Node **24.19.0** without changing global PATH or profiles.
`CEC_NODE` can point to that pinned executable. A fresh checkout needs Node
**24.19.0** and npm **9.6.7** in its terminal, then:

```powershell
npm ci --ignore-scripts
.\cec.ps1 check
```

Enter-CECEnvironment.ps1 is an optional untracked helper. Strict TypeScript compiles
to ESM, with built-in SQLite and Ajv. No new dependency, model SDK, backend, crawler
or ORM was introduced. Tests block Node network transports, including CLI children;
this is not OS-level isolation. The fresh-project integration fixture uses Python
3.11+ (CEC_TEST_PYTHON can select it); no extra Python packages are required.
Research uses permitted host tools separately.

Public operations: `doctor`, historical synthetic `demo fresh|existing|feedback`,
`init [folder]`, `status [folder]`, `backup create [folder]`.
The [tool reference](skill/crumb/references/local-tools.md) documents internal
contracts. Use direct pinned Node with UTF-8 JSON input for host integration;
the launcher also forwards stdin for current IDE and Act operations.

## Storage and approval boundaries

Setup adds ignore protection and a private `.customer-evidence/` workspace while
preserving target code, manifests and instructions. It verifies the Git index and
effective ignores, refuses tracked private data and linked/colliding paths, and
never automatically untracks files or changes Git trust settings.

Append-only v2 prebuild revisions are limited to 300 KiB (legacy v1: 256 KiB).
V5 actions reference the exact context and explicit Act receipt. Material changes
invalidate dependent confirmations and pending scope; old records remain intact.
Previous approved work and documents remain in history. Selected code hashes are
rechecked at approval. The core validates consistency, not research truth, user
identity, consent or arbitrary host execution claims; it is not an agent sandbox.

SQLite v3 adds an append-only Act journal alongside earlier cycles and IDE records.
Fresh SQLite backups include research and approved history and verify integrity
and a digest. Logical context recovery cannot overwrite history or restore a cycle.
Same-disk copies do not protect against disk loss. Broader real-customer data import,
deletion and recovery gates remain future work. No outreach, spending, deployment,
automatic outcome ingestion is included. M3 adds a v4 append-only learning journal,
founder-pasted minimized notes, existing-route launch packs and reviewed next
decisions. It sends nothing and builds no automatic feedback features. Customer build
pack files are separate from the database backup and use the project file-backup
process. New approved Act runs preserve earlier history.

## Authority and branding

[PRODUCT_SPEC.md](PRODUCT_SPEC.md) is the active v0.11 master. Historical reports
and CEC_MASTER_SPEC_v0.5.md retain their original findings. Display identity lives
in `src/domain/brand.ts`; package, private paths, old schemas and saved hashes keep
their compatibility identifiers.
