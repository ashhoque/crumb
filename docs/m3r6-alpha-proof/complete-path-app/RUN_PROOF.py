"""Recreate the delivered layout without altering archived application bytes."""
import csv
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

archive = Path(__file__).resolve().parent
project = Path(tempfile.mkdtemp(prefix="crumb-archived-mvp-"))
app = project / "crumb-contexts" / "synthetic-review"
(app / "tests").mkdir(parents=True)
(project / "preparation" / "fixtures").mkdir(parents=True)
for name in ("handover_check.py", "README.md", "tests/test_handover_check.py"):
    shutil.copyfile(archive / name, app / name)
shutil.copyfile(archive / "fixtures/handover.csv", project / "preparation/fixtures/handover.csv")
subprocess.run([sys.executable, "-B", "-m", "unittest", "discover", "-s", "tests", "-v"], cwd=app, check=True)
output = project / "output" / "independent-run"
subprocess.run([sys.executable, "-B", str(app / "handover_check.py"), "--input", "preparation/fixtures/handover.csv", "--out-dir", str(output)], cwd=project, check=True)
with (output / "incomplete.csv").open(encoding="utf-8", newline="") as file:
    rows = list(csv.reader(file))[1:]
assert [row[0] for row in rows] == ["2", "3", "4", "5"]
assert [row[4] for row in rows] == ["owner", "due_date", "owner;due_date", "owner"]
print(f"Verified actual archived CLI task; retained disposable project: {project}")
