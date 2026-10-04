# Development decisions and conversation evidence

This folder preserves the proposals and conversation evidence produced while
continuing the existing project. It accompanies the source, tests, contracts,
architecture decisions and milestone reports already in this repository.

## Current decision

**Focused M3-R1 PASS WITH WARNINGS — 298/298 passed.** Documented in
[the evaluation contract](M3_R1_EVALUATION_CONTRACT.md),
[inspected research](M3_R1_QUALITY_RESEARCH.md) and
[the manual trial](../../M3_R1_QUALITY_TEST_GUIDE.md).
See [final verification](M3_R1_QUALITY_VERIFICATION.json) and the
[executed stock rehearsal](M3_R1_QUALITY_STOCK_REHEARSAL.md). No later work started.

## Original M3-R1 delivery (historical)

**M3-R1 PASS WITH WARNINGS — 286/286 passed.** The current revision adds compact
Conversation Mode, natural confirmations, a verified portable Work handoff, six
Build Pack documents and approved stage progression with human checkpoints.
See [report](../../M3_R1_REPORT.md), [trial guide](../../M3_R1_TEST_GUIDE.md) and
[verification record](M3_R1_VERIFICATION.json). Same repository and prior work
preserved; no later revision/M4 or native cross-host transport was started.

## Previous decision (historical M3)

The founder approved M2 and authorized **M3 - Launch & Learn** on 26 September 2026. Continue the same repository and preserve all prior milestone evidence. M3 now passes 270/270 tests and all six synthetic end-to-end scenarios. See [M3 report](../../M3_REPORT.md), [trial guide](../../M3_TEST_GUIDE.md) and [scenario evidence](M3_SCENARIOS.md). Stop before M4. No autonomous outreach or Git push is authorized. Unscripted founder acceptance remains distinct from fixtures.

## Earlier checkpoint

On 23 September 2026, the founder approved **Crumb M1-R2 — Complete pre-build IDE
experience**, then requested that the existing code and documents be pushed to
`https://github.com/ashhoque/crumb.git` before implementation begins.

The initial Git checkpoint `a601e85` contains the implemented Pruvello M1-R
baseline and approved Crumb M1-R2 proposal. Its baseline was rechecked before
publishing: **83 tests passed, zero failed or skipped**. M1-R2 implementation
followed that push; see its report below for executed results and remaining limits.

## Documents

| Document | Purpose |
|---|---|
| [M1-R2 implementation report](../../M1_R2_REPORT.md) | Historical implementation, verification, acceptance coverage and limits |
| [M1-R2 source-backed research rehearsal](M1_R2_RESEARCH_REHEARSAL.md) | Actual public retrieval and local save/resume/master results for a synthetic stock founder |
| [M1-R2 independent conversations](M1_R2_INDEPENDENT_REHEARSAL.md) | Six independently conducted synthetic paths, observed errors and limitations |
| [Crumb M1-R2 proposal](CRUMB_M1_R2_PROPOSAL.md) | Approved next milestone: diagnosis, six conversations, sourced research example, acceptance requirements and proposed changes |
| [Proposed PLAN](PROPOSED_PLAN.md) | Review copy of the next implementation plan |
| [Proposed product specification](PROPOSED_PRODUCT_SPEC.md) | Review copy of the next master specification |
| [Pruvello continuation proposal](PRUVELLO_CONTINUATION_REVIEW.md) | Earlier approved proposal that led to the current M1-R baseline |
| [M1-R conversation rehearsal](M1_R_CONVERSATION_REHEARSAL.md) | Synthetic rehearsal evidence, with its limitations |
| [M1-R implementation report](../../M1_R_REPORT.md) | Recorded implementation results for the current baseline |

The proposal snapshots retain their original “awaiting approval” wording as
historical artifacts; the decision above records the subsequent approval. The
Crumb proposal's companion-document links were made relative for GitHub.

The active implementation documents remain [PRODUCT_SPEC.md](../../PRODUCT_SPEC.md),
[PLAN.md](../../PLAN.md) and [STATUS.md](../../STATUS.md). They reflect the approved
M1-R3 correction. Earlier M0, M1 and
M1-R reports retain their historical names and findings.

Private customer workspaces, environment files, credentials, installed packages,
build output, caches and machine-specific environment reports/helpers are not
part of the source repository. The existing ignore rules remain in place.
