# Local CSV handover checker

Python 3.11+ standard library only. Use fictional data only. The tool checks blank owner/due_date fields, exports incomplete records and writes one neutral, unsent follow-up. No accounts, network, AI, integrations or sending.

From the disposable project root, run (choose a new output name every time):

```powershell
& C:\Python311\python.exe crumb-contexts/01a113e4-7fec-7091-8c45-c5c6357e8969/handover_check.py --input preparation/fixtures/handover.csv --out-dir output/try-001
Get-Content output/try-001/incomplete.csv
Get-Content output/try-001/follow_up.txt
```

The supplied fixture should scan 6 records and export records 2, 3, 4 and 5. Review both files before using the draft. To try a bad input without changing the fixture, run the command again with the same output directory: it must refuse to overwrite it.

Run the focused acceptance checks from this folder:

```powershell
& C:\Python311\python.exe -B -m unittest discover -s tests -v
```

Supported CSV: UTF-8, optional BOM; comma delimiter; LF/CRLF; exact ordered header `task,owner,due_date`; three fields per record. Quoted commas, doubled quotes and multiline values are supported. Empty physical records are skipped. Blank tasks, bad quoting, unsupported headers and invalid encoding fail the entire input. Limits: 1 MiB and 10,000 data records, with no truncation.

Missing means empty after Python whitespace trimming, for owner/due_date only. Original values stay intact in the CSV export. `TBD`, `N/A` and malformed nonempty dates count as present. No person/date correctness or overdue validation. Row numbers count logical data records, not physical lines; duplicates remain distinct.

The synthetic pilot rejects fields with first non-whitespace character `= + - @ ＝ ＋ － ＠`, leading tab/CR/LF, or disallowed controls. CR/LF are allowed inside quoted values after other text and are escaped visibly in the draft. This conservative rejection can reject legitimate text; it does not promise universal spreadsheet safety. Nothing evaluates source values.

Both paths must resolve inside this disposable workspace. Output must be a new directory, separate from input. All input is validated before writing; both artifacts are staged and the directory is exposed only on success. Input is untouched. No overwrite option. Exit 0 means processing succeeded (including incomplete rows); 2 means invalid invocation/input; 1 means file/permission/write failure. Zero exceptions produce a header-only CSV and an explicit no-follow-up message that does not validate values.

The October 8 observation plan is at `../../preparation/OCTOBER-8-TEST.md`. Compare against each colleague's usual method, include startup time, record assistance and exact exceptions, and leave the follow-up unsent. Technical correctness does not establish demand, repeat use or willingness to pay.
