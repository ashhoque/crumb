# October 8 first-user observation

Status: prepared, not conducted. The local MVP is runnable in `crumb-contexts/01a11409-cba8-7a70-b920-9dd26c59e8f8/`; 11 acceptance tests passed and the actual known-fixture command accepted six tasks, exported exactly records 2,3,4,6 and produced the expected neutral draft without changing input. Two fitting colleagues are available according to the supplied synthetic scenario; attendance, consent, fit and actual behavior have not been verified. No invitations sent. Software checks are not participant observations.

Purpose: learn whether the local blank-owner/date checker improves a technical agency delivery manager's handover review compared with their normal spreadsheet approach. Use only fictional records. A completed synthetic task establishes usability, not real client outcomes, demand, retention or payment.

## Invitation draft

Could I observe how you review a short fictional agency handover on October 8? About 20 minutes, with no client data. I want to understand your current approach and where it gets awkward. There is nothing to buy, and honest criticism is useful.

## Before showing the tool

Confirm their role and whether they actually receive CSV task handovers; record relationship bias. Ask about past work without private names or documents:

1. What is the hardest part of receiving a handover?
2. Tell me about the last time you encountered that.
3. Why was it difficult?
4. What did you try?
5. What did you dislike about those approaches?

Keep actual answers separate from the supplied scenario. Do not pitch the checker during these questions.

## Observation task

Use the verified fictional datasets in the app's `fixtures/` folder. Each has six tasks and four incomplete records. Colleague A reviews session-a with their normal spreadsheet method first, then session-b with the CLI. Colleague B reviews session-a with the CLI first, then session-b with the spreadsheet. Give the same instruction: 'Identify what needs clarification and prepare a follow-up you would review before sharing.'

Run instructions and limitations are in the app's README.md. Use a fresh output directory for each participant/task. Facilitator-only answer keys: session-a records 2,3,4,6; session-b records 1,3,4,6. Keep answer keys and known-fixture outputs out of participant view. Record role fit and voluntary agreement before observation. No private data or sending.

Time includes opening files, reading instructions and starting the command. Do not coach; if intervention is needed, record it. Observe omissions found, false positives, exported record indices, draft accuracy, edits, hesitation and assistance. No sending. Check the input remains unchanged.

Ask which specific future handover they would choose this approach for, and why. A stated next-use choice is intention; it is not observed reuse.

## Record sheet

| Observation | Colleague A | Colleague B |
|---|---|---|
| Role and fit to CSV handover work | Pending | Pending |
| Relationship to founder | Pending | Pending |
| Recent firsthand example (minimized) | Pending | Pending |
| Order and dataset IDs | Pending | Pending |
| Normal-method elapsed time | Pending | Pending |
| CLI elapsed time, including setup | Pending | Pending |
| Missing rows found / false positives | Pending | Pending |
| Export correctness / draft edits | Pending | Pending |
| Hesitation and assistance | Pending | Pending |
| Preferred approach and reason | Pending | Pending |
| Specific proposed next use | Pending | Pending |

## Decision rules

Proposed success: both independently identify all four omissions, export and review the draft within five minutes without task coaching; at least one is at least 25% faster than their normal approach and chooses a specific plausible next use. These thresholds are choices, not predictions.

Failure: any missed/extra record or misleading/unsafe draft; task coaching needed; neither sees an advantage over their spreadsheet. Repair correctness before further exposure. If both prefer their existing method, park the standalone CLI rather than add features.

If the app is unavailable on October 8, run only the past-behavior discussion and manual/spreadsheet task. Label that a discovery session, not a prototype test. No actual session results exist yet.
