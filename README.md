# Crumb

**The business copilot for AI builders.**

## Try the alpha

With Git, Codex, and Node **24.19.0** with npm **9+** installed:

```sh
git clone https://github.com/ashhoque/crumb.git
cd crumb
npm run setup
```

Open the cloned folder in Codex, start a new chat, and send
`$crumb Run the discovery probe only.` Then follow the short
[alpha tester guide](ALPHA_TESTING.md) for a first conversation and
[feedback](https://github.com/ashhoque/crumb/issues/new?template=alpha-feedback.yml).
The setup command builds the existing skill runtime; it does not install globally.

Crumb helps clarify an idea or existing project, investigate the problem and
alternatives, then choose a considered next step. Current milestone:
**M1-R2 — Complete pre-build IDE experience**. See [status](STATUS.md),
[implementation report](M1_R2_REPORT.md) and [trial guide](M1_R2_TEST_GUIDE.md).
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

Normal next choices follow meaningful evaluation: explore recent user behavior,
shape a small MVP, consider a relevant adjacent opportunity, or open the research.
An explicit request to build bypasses unfinished research. The concrete scope still
needs approval; approval already given for that scope is reused. Context saves and
research do not need build approval.

Say **View competitors**, **View what users are saying**, **View market gaps**,
**View adjacent opportunities**, **View user habitats**, **View sources**, **Why?**,
or **Open full research** when useful. Details are contextual and paginated.
**The extra detail below is optional—you can continue without reading it.**
An optional startup master retains research and challenges important claims;
skipping it does not prevent building. Founders do not fill JSON forms or run tools.

After a reviewed first build, the host runs checks, records a receipt and verifies
a backup. Research can continue after that cycle. A second tracked cycle and the
staged builder remain future M2. Ordinary coding and a reviewed portable handoff
remain available without resetting history. Public research and passing code are
not customer validation.

`$pruvello`, `$pruvity` and `$customer-evidence` forward to Crumb. The skill is
repository-scoped; another task can explicitly read this SKILL.md and target the
selected project. It never silently installs a skill or app stack into that project.

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
this is not OS-level isolation. Research uses permitted host tools separately.

Public operations: `doctor`, historical synthetic `demo fresh|existing|feedback`,
`init [folder]`, `status [folder]`, `backup create [folder]`.
The [tool reference](.agents/skills/crumb/references/local-tools.md) documents internal
contracts. Use direct pinned Node with UTF-8 JSON input for host integration;
a launcher pipeline previously lost input during rehearsal.

## Storage and approval boundaries

Setup adds ignore protection and a private `.customer-evidence/` workspace while
preserving target code, manifests and instructions. It verifies the Git index and
effective ignores, refuses tracked private data and linked/colliding paths, and
never automatically untracks files or changes Git trust settings.

Append-only pre-build revisions are limited to 256 KiB each and coexist with
unchanged approved cycles. V4 actions reference exact context hashes. Corrections
invalidate pending scope; material changes retire an unchanged startup master.
Previous approved work and documents remain in history. Selected code hashes are
rechecked at approval. The core validates consistency, not research truth, user
identity, consent or arbitrary host execution claims; it is not an agent sandbox.

Fresh SQLite backups include research and approved history and verify integrity
and a digest. Logical context recovery cannot overwrite history or restore a cycle.
Same-disk copies do not protect against disk loss. Broader real-customer data import,
deletion and recovery gates remain future work. No outreach, spending, deployment,
automatic outcome ingestion or second tracked cycle is included. M2 needs separate
authorization.

## Authority and branding

[PRODUCT_SPEC.md](PRODUCT_SPEC.md) is the active v0.7 master. Historical reports
and CEC_MASTER_SPEC_v0.5.md retain their original findings. Display identity lives
in `src/domain/brand.ts`; package, private paths, old schemas and saved hashes keep
their compatibility identifiers.
