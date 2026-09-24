# Development decisions and conversation evidence

This folder preserves the proposals and conversation evidence produced while
continuing the existing project. It accompanies the source, tests, contracts,
architecture decisions and milestone reports already in this repository.

## Current decision

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
| [M1-R2 implementation report](../../M1_R2_REPORT.md) | Current implementation, verification, acceptance coverage and limits |
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
M1-R2 work after the initial push. Earlier M0, M1 and
M1-R reports retain their historical names and findings.

Private customer workspaces, environment files, credentials, installed packages,
build output, caches and machine-specific environment reports/helpers are not
part of the source repository. The existing ignore rules remain in place.
