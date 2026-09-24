# ADR 0007 — Pre-build research beside immutable build history

Status: accepted for founder-approved M1-R2, 23 September 2026.

The previous orientation preview could recommend a build before meaningful
investigation. Saving more understanding also depended on an action draft, and
an approved first cycle prevented continued business-context revisions.

Keep the existing SQLite database, project identity, historic schemas and approved
cycle bytes. Add an append-only prebuild_revisions table under user_version 2.
Each revision has a neutral strict contract, project-bound version/hash, bounded
source/claim/research records, and a short conversation brief. A read-only resume
does not create a workspace. Context can continue after an old approved cycle.

Research is performed by the permitted host. Core code makes no network calls.
Dates, URLs, access mode, provenance, budgets and source relationships make the
host's report inspectable; the core does not authenticate sources, identities,
relevance, consent, research execution or the truth of host reasoning. Synthetic
scenarios and actual sources remain distinguishable. Keep raw confidential
customer-source import outside this milestone.

Normal v4 action drafts reference a ready evaluation. An explicit build request
can bypass research using its retained founder quote. Both use existing concrete
scope approval, actual file checks, receipts and backup. Reference/version drift,
intention changes, synthetic relabelling and lost selected-file hashes are rejected.
An unapproved legacy proposal cannot bypass newer context; already-approved legacy
cycles remain unchanged. No second tracked cycle is introduced.

Material context changes retire an unchanged startup master in the new revision.
The prior document remains in immutable history. A refreshed master and its red
team are host-reviewed content, not mechanically proven business conclusions.
Wording-only brief/name edits do not retire the master. Any context revision
invalidates a pending action's old reference, conservatively requiring review.

Backups include the new table and pass SQLite integrity checks. A hash-checked
logical context export can recover into an empty context store, with selected-file
hash checks. It cannot overwrite history or restore a cycle. Full real-customer
data import/deletion and broader recovery guarantees remain future work.

Branding is display configuration. The package name, private directory, database
name and historical contract identifiers intentionally retain their existing values.
