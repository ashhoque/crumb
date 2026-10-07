# Local CSV handover checker

Runnable learning MVP. Synthetic local data only. No packages or services required.

From this directory in PowerShell:

```powershell
& 'C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' .\handover.mjs check .\fixtures\handover.csv --out .\trial-output
```

Choose a **new** output directory on each run; its parent must exist. The command writes `incomplete.csv` and `follow-up.txt`, prints counts, and leaves the input unchanged. Review the draft manually. Nothing is sent or uploaded. Help: `node handover.mjs --help`. Exit codes: 0 success/help, 1 processing error, 2 invalid usage.

Run tests with the same executable and `--test .\tests\handover.test.mjs`. Tests retain synthetic cases in fresh folders under `test-output/`.

Input is UTF-8 (optional BOM), at most 1 MiB and 5,000 data records, with exactly `task,owner,due_date` in any order. Header whitespace is trimmed; names are case-sensitive. Quoted commas, escaped quotes and embedded newlines work. Empty records are skipped; source_record still counts them. Nonempty records need three fields and a nonblank task. Original cell text is preserved; only blank detection trims whitespace. Duplicate task rows remain separate.

Only blank/whitespace owner or due_date flags. Nonblank TBD/N/A and invalid dates remain unflagged. This cannot establish accountability, deadlines, completion or handover readiness. All decoded cells with leading tab/CR/LF, or formula prefixes =,+,-,@ and their full-width forms after whitespace, are rejected before outputs. This conservative check can reject legitimate text; it is not universal spreadsheet protection. Existing output directories/files are refused. Handled write errors clean only this run's files; abrupt process termination or failed filesystem cleanup can leave files and is reported where possible.

## October 8 observation, prepared but not conducted

Use the fuller invitation, five past-behavior questions and blank record sheet in [FIRST-USER-OBSERVATION.md](../../FIRST-USER-OBSERVATION.md). Two colleagues are synthetic scenario assertions; actual fit, participation and consent remain unverified. No invitation has been sent.

Ask: “Identify what needs clarification and prepare a follow-up you would review before sharing.” Use fictional fixtures only. A uses the usual spreadsheet method on session-a first, then CLI on session-b. B uses CLI on session-a first, then spreadsheet on session-b. Time includes opening files and command setup. Do not coach; record interventions, misses, false positives, hesitation, draft edits, preference and specific intended next use. Never send the draft.

Facilitator answer key: session-a records 2,3,4,6; session-b records 1,3,4,6. Each has six tasks and four incomplete rows. Keep this key away from participants. Use fresh outputs such as `session-a-person-b` and `session-b-person-a`.

Success threshold: both complete unaided within five minutes with exact omissions; at least one is at least 25% faster than their usual method and chooses a specific plausible next use. Failure: incorrect/unsafe output, task coaching needed, or neither sees workflow advantage. If both prefer the spreadsheet, park the CLI. These are experiment rules, not forecasts. Synthetic correctness is established by software checks; usability, demand, repeat use and willingness to pay remain unproven. Stop at local MVP review.
