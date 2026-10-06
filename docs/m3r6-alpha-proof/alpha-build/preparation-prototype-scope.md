# Exact proposed local prototype scope
Prepared 2026-10-06. Design and build brief only; no authorization or implementation.

Promise: On one local browser, enter a synthetic revision-specific proof reference, record one approve/reject decision with a required note, and correctly identify proofs still awaiting a decision.

Three capabilities:
1. Enter one proof reference per record. Required trimmed text, 1–120 characters, including a fictional job/revision such as DEMO-101-v1. Maximum 20 records. Reject exact trimmed duplicates. Reference is plain text, never a fetched or clickable PDF URL.
2. Approve or reject a pending record with a required trimmed note, 1–500 characters. Show selected reference in the decision action. Save reference, status, note and informational device-clock timestamp together. Pending becomes Approved or Rejected once; disable repeat decisions, editing and reopening. Both outcomes remain inspectable in All records.
3. Outstanding view shows only Pending records, with count and honest empty state. All records shows Pending, Approved and Rejected using text labels. Rejected means changes needed; it is no longer awaiting this decision and never authorizes production.

Support required for the loop:
- Visible “Local learning prototype — synthetic data only; decisions do not authorize printing.”
- Keyboard-usable labeled controls and visible field errors.
- Browser storage persistence on one stable loopback origin; reload retains state.
- Storage denied, full or malformed: visible blocking error, no false success and no silent reset.
- Confirmed Reset demo clears only this app's own storage key. No general browser storage clearing.
- Single tab/profile/device supported; no multi-tab synchronization promise.
- Synthetic sample references may be included in test instructions, not imported customer data.

Cuts: PDF upload, hosting, fetching, previews, annotation and file verification; accounts and authenticated identity; customer links or remote collaboration; messages and reminders; payments; deployment; real customer data; integrations; version chains; decision edits; production release; exports, analytics and AI.

Technical proposal: plain HTML/CSS/JavaScript; browser localStorage; small static server using pinned Node standard library, bound to 127.0.0.1 only. No package installation, paid service, external assets or outbound application requests. Use text-safe rendering, fixed static routes, and synthetic input only. A loopback server avoids relying on undefined file-URL storage behavior.

Proposed future product files, exclusively inside this disposable project:
- prototype/index.html
- prototype/styles.css
- prototype/app.js
- prototype/server.cjs
- prototype/README.md
- focused local verification files under prototype/tests/ only if needed to verify storage and state failures.

No changes to other projects, external accounts, deployments or messages. Preparation documents and conversation notes are not product code.

Options considered: synthetic status table is a credible lower-effort baseline; hosted proofing already exists but falls outside local-only scope. Local prototype is recommended to test interactive clarity and failure handling without external services.

Limits: local storage is not a durable, tamper-proof approval ledger; device timestamps and actors are not verified. A reference is not a viewable proof. Passing tasks is not evidence of reduced chasing, fewer reprints, remote usability, retention, demand or willingness to pay.

After a separate exact approval and the required review checks, work should stop at a runnable local prototype and verified test pack. Do not extend into hosting, customers or commercialization. If the narrow loop cannot be ready for 2026-10-07, use the synthetic table session; do not remove error handling to meet the date.
