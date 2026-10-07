# Try the local checker

Double-click ../checker.html and choose sample.csv. It should show 4 checked lines and 3 incomplete lines: record 2 missing garment size; record 3 missing thread colour; record 4 missing both. Record 4 intentionally contains HTML-like text to verify it is displayed safely as text. This is fictional practice data, not customer evidence.

Next choose malformed.csv: the check should stop, and the old results should disappear. empty.csv should say there are no order lines. Clear check removes the selection and result.

For Friday, choose the shop's export locally. Resolve missing details through the existing office process, then re-export and check again. No source edits, upload, storage, external assets or server. Filled values and quantity are unchecked; a clean result is not a production approval. Supported: UTF-8 comma-delimited CSV, exact four headers, fewer than 100 order records, under 2 MB. Additional columns are allowed but every record must match its header count. Completely blank records are rejected as structurally invalid rather than silently skipped.

Developer verification uses Node 24 built-ins only: node checker.test.cjs and node browser-check.cjs. The browser check launches an isolated headless Windows Edge process, selects fictional files through its file input and closes that process; no office terminal is needed.
