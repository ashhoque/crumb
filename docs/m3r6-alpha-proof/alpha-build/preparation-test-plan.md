# Runnable test plan — 2026-10-07
Prepared 2026-10-06. Prototype does not exist yet. The commands below are the proposed launch contract after separately authorized implementation, not a claim of a successful run.

## Local launch
From <USER>\AppData\Local\Temp\<DISPOSABLE>\alpha-build:
```powershell
& '<USER>\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\prototype\server.cjs'
```
Open http://127.0.0.1:4173 in a normal browser profile. Keep this exact origin and a single tab. Stop with Ctrl+C. If port occupied, report it and stop; do not expose a network listener. Server must serve only fixed prototype assets. No install, sign-up or internet required.

## Acceptance checks before sessions
All are planned, not performed:
- Blank/whitespace/overlong references and duplicate reference show errors and do not add records; record 21 is rejected.
- Create DEMO-101-v1, DEMO-102-v1, DEMO-103-v1: outstanding count is 3.
- Approve DEMO-101-v1 with “Layout matches the fictional brief”: pending count 2; retained note/reference correct.
- Reject DEMO-102-v1 with “Change the fictional heading”: pending count 1; All records shows Rejected and note. Only DEMO-103-v1 is outstanding.
- Blank/overlong decision note and double-click cannot create or overwrite a decision. Reference and completed decision cannot be edited.
- Reload preserves the three states on the same origin.
- Render synthetic markup-like reference as literal text, never executable HTML.
- Simulate blocked/full storage and malformed app-owned storage: visible failure, no saved-success claim, no silently discarded state. Reset requires confirmation and clears only the app-owned key.
- Keyboard completes the core loop; labels and errors identify the relevant field.
- Verify loopback-only binding and no app-initiated external requests/assets.
Any unsafe state, wrong reference or false-success failure blocks colleague sessions. Record actual results and changes after implementation.

## Two separate colleague sessions, 25 minutes each
Relationship bias disclosed; confirm participant personally handles print proofs. If neither fits, retain results only as interface rehearsals.

0–8 minutes, neutral past-behavior questions:
1. What is the hardest part of handling proof approvals?
2. Tell me about the last time you encountered it.
3. Why was that hard?
4. What have you tried?
5. What do you dislike about those solutions?
Listen without pitching. Ask concrete follow-ups about normal volume, time and waiting only when useful. Do not ask for customer names, files, emails or identifiable job records.

8–15 minutes, synthetic tasks with no coaching:
- “Enter DEMO-101-v1 and leave it awaiting a decision.”
- “Enter DEMO-102-v1; approve it with the note ‘Layout matches the fictional brief.’”
- “Enter DEMO-103-v1; reject it with ‘Change the fictional heading.’”
- “Show what still needs an approval decision. Explain what rejected means and whether anything here releases a real print job.”
Start timer at first task. Record completion time, wrong-reference decisions, hesitation, requests for help and meaning of each status. Founder simulates both roles; no remote customer is being tested.

15–21 minutes, baseline:
Repeat equivalent tasks with a plain table:
| Reference | Status | Note |
|---|---|---|
| DEMO-201-v1 | Pending | |
| DEMO-202-v1 | Approved | Layout matches the fictional brief |
| DEMO-203-v1 | Rejected | Change the fictional heading |

Reverse prototype/table order for the second participant to reduce order bias. Ask where either would fit in current work, what extra entry it creates, and what would make them keep using their existing method. Preference is opinion, not commitment.

21–25 minutes: ask for a concrete potential next use using made-up references only. Do not solicit real customer data or claim an actual pilot is booked.

## Decision rules
Interface success: both fitting colleagues finish create/approve/reject and identify pending versus rejected without coaching within five minutes; zero wrong-reference decisions or production-authority confusion.
Workflow signal: at least one describes a recent comparable problem and concrete useful placement. This supports another bounded test, not commercial GO.
Repair: any reference/status confusion or false save blocks further use until corrected.
Park commercial build: neither describes a recent problem or an advantage over the table/current workflow. Customer waiting may require a different later experiment; do not add messaging without approval.
No-shows and non-fitting colleagues are coverage gaps, not negative demand evidence.
Later validation must observe actual customer participation, repeat use and buyer commitment under a separately approved scope.

## Notes sheet
| Participant alias | Fits role? | Relationship | Recent task summary, anonymized | Current workaround | Prototype time | Coaching/errors/hesitation | Table comparison | Concrete next use stated | Interpretation |
|---|---|---|---|---|---|---|---|---|---|
| Colleague A | | colleague | | | | | | | |
| Colleague B | | colleague | | | | | | | |

Keep statements, observed behavior and interpretation separate. Record no fabricated quotes or outcomes. No real customer identifiers or proof files.
