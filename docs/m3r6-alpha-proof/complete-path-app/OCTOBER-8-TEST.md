# October 8, 2026 observation and runnable acceptance specification

Runnable local MVP completed and technically checked on October 6, 2026 (local date). The founder explicitly authorized the unchanged local scope: synthetic data only; no sending, deployment or extra features. The 18-test acceptance suite passed and the real synthetic fixture command succeeded. Founder review of the actual build remains pending. The October 8 colleague observation is prepared, not executed; no participation, invitation, usability result or demand is claimed. All input data is fictional.

## Executed technical acceptance and rerun commands

Run from the project root:

```powershell
& C:\Python311\python.exe -B -m unittest discover -s crumb-contexts/01a113e4-7fec-7091-8c45-c5c6357e8969/tests -t crumb-contexts/01a113e4-7fec-7091-8c45-c5c6357e8969 -v
& C:\Python311\python.exe -B crumb-contexts/01a113e4-7fec-7091-8c45-c5c6357e8969/handover_check.py --input preparation/fixtures/handover.csv --out-dir output/observation-rehearsal-001
Get-Content output/smoke-001/incomplete.csv
Get-Content output/smoke-001/follow_up.txt
```

Observed smoke result: exit 0; 6 records scanned, 4 incomplete. Exception record indexes 2, 3, 4, 5 only. Missing fields respectively owner, due_date, owner;due_date, owner. Spaces in record 5 owner and the comma in its task were preserved. Records 1 and 6 were absent. Both artifacts were inspected, and the draft matched the neutral example in MVP-PLAN.md with no invented recipient or deadline. Source SHA-256 was unchanged: `1f4f08167c691329e8ef51172cbf710c8ee04fe5d7951dcd34d77007434949be`. Existing results are in output/smoke-001; choose a new output directory for every rerun.

The executed focused suite covers:

1. Main fixture gives the exact exception set and reasons; duplicates remain distinct records.
2. Empty strings and whitespace-only values flag correctly; nonempty `TBD`/`N/A`/invalid date do not. Blank task fails the whole file.
3. Quoted commas, escaped quotes, quoted multiline fields, BOM, CRLF and LF parse; record numbering counts records, not lines; output round-trips through CSV reader.
4. Header-only/all-complete input emits no chase, header-only exceptions and the explicit limitation message.
5. Wrong/missing/duplicate/extra/reordered headers, invalid UTF-8, bad quotes and wrong-width records fail with no published output directory.
6. Formula-leading/unsafe control fields fail without executing content or publishing artifacts. No claiming that quoted CSV alone makes formulas safe.
7. 1 MiB and 10,000-record boundaries accept at the limit and reject over the limit; no silent truncation.
8. Existing output directories, input aliasing, workspace escape and output write failure leave input unchanged and publish no partial final output.

No need for integrations, load benchmarks or AI evaluations for this local experiment. Accuracy and safe failure are the essential engineering gates.

## Colleague session — 25 minutes each

Invite draft, founder-controlled and unsent: “Could I observe how you review a fictional task handover on October 8? I’m testing a small local checker, not evaluating your work. We’ll compare it with your usual approach. No client data, accounts or messages are involved; it should take about 25 minutes.” Availability is reported, participation is not yet observed.

Before showing the tool, use these five questions with no solution pitch:

1. What's the hardest part of managing a handover?
2. When did you last encounter that problem?
3. Why was that instance hard?
4. What did you try?
5. What did you dislike about those approaches?

Record answers as colleague reports, with dates and relationship bias, not verified outcomes. Ask for no client names, files or confidential specifics.

Task prompt: “Review this fictional handover, identify which tasks need clarification, and prepare an unsent follow-up.” Give only README and fixture. Observe their existing method and the approved app on matched fixtures; colleague A uses manual method first, colleague B app first. Equivalent fixtures reduce memorization but this tiny comparison cannot support a statistically reliable savings claim. Let each choose their existing spreadsheet/editor; never require creating an account. Include command/setup time.

Measure start-to-reviewed-draft time; exact rows found/missed/extra; help requests; command errors; hesitations; interpretation of missing_fields; changes needed to make the draft usable. Don't coach until they ask; log every intervention. Then ask which method they would use next time and why, and request a concrete next-use situation rather than a compliment.

Precommitted learning signal: both colleagues independently identify all 4 exceptions with no false positives, export successfully and produce a draft requiring no factual correction, in at most 5 minutes including startup. At least one shows a clear workflow advantage (less time or fewer mistakes versus their baseline) and names a specific next handover where they would try it. These are experiment thresholds, not proven savings or demand.

Failure/decision: any missed/extra row or unsafe output blocks using that build. If both prefer their spreadsheet/template or neither has a concrete next-use situation, park the standalone checker and investigate prevention in their existing workflow. If accuracy passes but startup blocks them, test a simpler entry point before adding features. Mixed evidence justifies one targeted revision and retest, not a commercial launch.

Session results can establish supported-input usability, comprehension and a possible workflow advantage. They cannot establish real-client reliability, repeat use, retention, willingness to pay, market size or demand. A later voluntary repeat use would be stronger evidence and requires its own agreed data boundaries. No real client import is authorized here.

## Blank observation record

Participant: [anonymous A/B]; date: [ ]; fit and relationship: [ ]; order: [ ]

Last encounter report: [ ]; usual workaround: [ ]; reported frequency/consequence: [ ]

Baseline time/errors: [ ]; app time/errors: [ ]; assistance: [ ]; draft edits: [ ]

Exact exception set: [ ]; preference and reason: [ ]; concrete next-use situation: [ ]

Interpretation and limitation: [ ]; decision: keep / targeted retest / park [ ]

## If the runnable app is unavailable

Use the same fictional handover to observe the existing spreadsheet/editor workflow and review the neutral draft as a concept. Record this explicitly as a manual/concept session. Do not report CLI usability, successful application exports or passing app checks. Keep all invitation and participation decisions founder-controlled; no invitation has been sent and no session has occurred.
