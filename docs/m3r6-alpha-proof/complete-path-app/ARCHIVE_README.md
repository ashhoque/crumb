# Actual-host MVP proof archive

These are byte-identical application files delivered by the installed host in a
disposable, synthetic founder project. They are not Crumb domain logic and do not
claim customer validation, outreach, deployment or participant consent.

Original application:
`C:\Users\Ash\AppData\Local\Temp\crumb-closeout-gb7slj\alpha-completion\crumb-contexts\01a113e4-7fec-7091-8c45-c5c6357e8969`.

From this archive directory, with Python 3.11:

```powershell
python -B handover_check.py --input fixtures/handover.csv --out-dir output/new-run
python -B RUN_PROOF.py
```

Use a new output directory each time. The prototype intentionally confines paths
to its workspace (two parents above the application directory); it is a bounded
local experiment, not a portable production release. The archived README retains
the exact original project-relative instructions.

`RUN_PROOF.py` recreates that original layout in a new disposable directory, then
runs the unchanged 18 tests and checks actual CLI output. Running the archived
tests directly without that layout finds only 17 passing cases: the original
fixture-location case correctly fails because its project-relative file is absent.
The proof runner fixes packaging, not application logic or test expectations.

The six-record fixture must report four exceptions, source rows 2–5, with missing
fields `owner`, `due_date`, `owner;due_date`, `owner`. It writes an exceptions CSV
and a neutral text draft, preserves the input and refuses overwrites. The
independent result additionally checks quoted commas, whitespace and the explicit
cut: nonblank `TBD`/invalid date values are not inferred or rejected as missing.

`ARTIFACT_HASHES.json` binds the retained source/fixture bytes.
`INDEPENDENT_RESULT.json` records an independently executed CLI task, not a model
rating. `SAVED_BUILD_STATE.json` records the supported Core readback after actual
execution and founder stop. These records are evidence, never new authorization.
