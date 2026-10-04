import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from ready import readiness


class ReadinessTests(unittest.TestCase):
    def test_complete_cli_journey(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "jobs.json"
            jobs = [{"client": "North", "required": ["Statement", "Receipts"], "received": [" statement "]},
                    {"client": "South", "required": ["Statement"], "received": ["statement"]}]
            path.write_text(json.dumps(jobs), encoding="utf-8")
            result = subprocess.run([sys.executable, "ready.py", str(path)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout), {"ready": ["South"], "waiting": [{"client": "North", "missing": ["Receipts"]}]})
            self.assertEqual(json.loads(path.read_text()), jobs)

    def test_invalid_cli_input_has_useful_failure(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "broken.json"
            path.write_text("not json", encoding="utf-8")
            result = subprocess.run([sys.executable, "ready.py", str(path)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 2)
            self.assertEqual(result.stdout, "")
            self.assertIn("Cannot check readiness", result.stderr)

    def test_no_false_readiness_from_missing_requirements(self):
        for jobs in [[], {}, [{"client": "A", "required": [], "received": []}],
                     [{"client": "A", "required": ["Doc"], "received": [False]}]]:
            with self.assertRaises(ValueError):
                readiness(jobs)

    def test_duplicate_clients_rejected(self):
        with self.assertRaisesRegex(ValueError, "once"):
            readiness([{"client": "A", "required": ["Doc"], "received": []},
                       {"client": "a", "required": ["Doc"], "received": []}])


if __name__ == "__main__":
    unittest.main()
