# ADR 0004: one conversational test, reviewed state and honest receipts

Accepted for M1, 2026-09-23. Master §05 F01/F05/F06, §08–11, §15 M1.

The existing Codex host reasons from the founder's natural language and selected,
permitted artifacts. CEC has no embedded model, network call or second agent.
The skill invokes internal deterministic commands; founders do not fill JSON forms.
Show one concise proposal before asking for meaningful scope approval. Unknown
fields are nullable and labeled. Every recommendation in M1 is HYPOTHESIS-LED.

Use versioned JSON Schema and Ajv 8.20.0 for runtime contracts. This is the one new
direct runtime dependency; keep Node's argument parser. Reject unknown fields,
unbounded text, multiple journeys, more than three capabilities, spend and elevated
evidence labels. A schema validates structure, not the truth of a host's reasoning.

One editable draft is stored locally. A content digest binds approval to the exact
reviewed draft. Approval creates immutable foundation revision 1 and one cycle in
a transaction. Revisions of the draft invalidate old approvals; approved scope is
not silently overwritten. Additional cycles belong to M3. The host records the
founder's actual assent; a local API cannot independently authenticate a human.

Build receipts are append-only host reports with actual selected-file hashes,
explicit executed/not-run checks and consistent exit-code results. They never
change customer validation or release state. The host must run checks and cite
their real outputs; CEC does not claim to independently verify arbitrary reports.
No arbitrary commands are executed by orientation or receipt capture.

Schema version 0 metadata-only databases migrate atomically to version 1 when
workflow state is first saved. Refuse unknown schemas. Minimal local backups use
SQLite VACUUM INTO a new owned filename, then integrity-check and hash the copy.
Backups remain under ignored private storage; restore/export/delete workflows
remain M3. Synthetic data only until those data-rights/recovery checks pass.

On the prepared Windows machine, a local PowerShell launcher finds and verifies
the pinned runtime per invocation. It does not change global PATH or shell profiles.
The existing account's manually verified skill invocation is sufficient for M1;
do not relax sandbox protections or move credentials to repair a nested host probe.

References: [Ajv](https://ajv.js.org/guide/getting-started.html),
[Codex skills](https://learn.chatgpt.com/docs/build-skills).
