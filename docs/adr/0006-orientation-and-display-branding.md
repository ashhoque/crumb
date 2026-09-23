# ADR 0006: save orientation before proposing an action

Accepted 2026-09-23 after approval of the Pruvello continuation proposal.

The stock-comparison trial produced three features while intention remained unknown.
The old skill guidance alone did not prevent this; both prior draft contracts also
required an action proposal before saving context. Preserve that working action
pipeline, but allow early understanding to exist independently.

Version 3 adds orientation/proposal phases, intention disposition, a context-based
assessment, explicit question slots, and the recorded reason for proposing an action.
Orientation has null proposal and decision, can be reviewed/resumed and cannot be
approved for implementation. An explicit build request bypasses context prerequisites;
otherwise supplied/skipped intention, a defined problem and an assessment precede
an action recommendation. This is a host-reported boundary, not authentication of
human intent or proof of the model's reasoning. Semantic quality requires conversation
rehearsals as well as structural tests.

The existing JSON body can retain this version without changing SQLite tables.
V1/v2 contracts and immutable approved snapshots remain unchanged. Draft corrections
still use optimistic versions and scope hashes. One approved cycle, actual receipts,
offline core and guarded backups remain the milestone limit.

Runtime display identity lives in src/domain/brand.ts. The primary Pruvello skill
has one maintained set of references; Pruvity and customer-evidence are forwarding
aliases. Keep the private directory, database, package identity, launcher and old
schema IDs as compatibility names. The new schema uses a neutral URN. Documentation
and skill metadata are the small remaining explicit rename checklist.

PRODUCT_SPEC.md is the active v0.6 master; the original v0.5 and earlier milestone
reports remain historical evidence. No dependency or database migration is added.
Live research, real customer-source imports, subsequent cycles and M2 are deferred.
