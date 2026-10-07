import contextlib
import csv
import hashlib
import io
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import handover_check as app


class Acceptance(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=app.WORKSPACE)
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root / "input.csv"
        self.output = self.root / "output"

    def data(self, text):
        self.source.write_bytes(text.encode("utf-8"))
        return self.source

    def run_data(self, text):
        self.data(text)
        return app.process(self.source, self.output)

    def exported(self):
        with (self.output / "incomplete.csv").open(encoding="utf-8", newline="") as stream:
            return list(csv.reader(stream))

    def rejected(self, text):
        self.data(text)
        before = self.source.read_bytes()
        with self.assertRaises(app.InvalidInput):
            app.process(self.source, self.output)
        self.assertFalse(self.output.exists())
        self.assertEqual(before, self.source.read_bytes())

    def test_supplied_fixture_exact_artifacts_and_source(self):
        source = app.WORKSPACE / "preparation/fixtures/handover.csv"
        before = hashlib.sha256(source.read_bytes()).digest()
        count, incomplete, _ = app.process(source, self.output)
        self.assertEqual((6, 4), (count, incomplete))
        rows = self.exported()[1:]
        self.assertEqual(["2", "3", "4", "5"], [r[0] for r in rows])
        self.assertEqual(["owner", "due_date", "owner;due_date", "owner"], [r[4] for r in rows])
        self.assertEqual("QA, mobile", rows[-1][1])
        self.assertTrue(rows[-1][2] and not rows[-1][2].strip())
        expected = ("Subject: Handover details to confirm\n\nHi,\n\n"
                    "I found a few blank fields in the handover. Could you confirm the missing details below?\n"
                    "- Record 2, Content migration: owner\n"
                    "- Record 3, Accessibility review: due_date\n"
                    "- Record 4, DNS handover: owner, due_date\n"
                    "- Record 5, QA, mobile: owner\n\n"
                    "If a field is intentionally blank, please let me know. Thanks.\n")
        self.assertEqual(expected, (self.output / "follow_up.txt").read_text(encoding="utf-8"))
        self.assertEqual(before, hashlib.sha256(source.read_bytes()).digest())

    def test_blanks_original_values_nonempty_limits_and_duplicates(self):
        count, incomplete, _ = self.run_data("task,owner,due_date\nA, ,\nA, ,\nB,TBD,bad-date\nC,N/A,N/A\n")
        self.assertEqual((4, 2), (count, incomplete))
        self.assertEqual([["1", "A", " ", "", "owner;due_date"],
                          ["2", "A", " ", "", "owner;due_date"]], self.exported()[1:])

    def test_bom_crlf_multiline_escaped_quotes_and_blank_records(self):
        self.run_data('\ufefftask,owner,due_date\r\n\r\n"QA, ""mobile""\r\nreview", ,2026-10-08\r\n\r\nB,X,\r\n')
        rows = self.exported()[1:]
        self.assertEqual(["1", "2"], [r[0] for r in rows])
        self.assertEqual('QA, "mobile"\r\nreview', rows[0][1])
        draft = (self.output / "follow_up.txt").read_text(encoding="utf-8")
        self.assertIn('QA, "mobile"\\r\\nreview: owner', draft)

    def test_header_only(self):
        self.assertEqual((0, 0), self.run_data("task,owner,due_date\n")[:2])
        self.assertEqual([["row_number", "task", "owner", "due_date", "missing_fields"]], self.exported())
        self.assertEqual(app.NO_FOLLOW_UP, (self.output / "follow_up.txt").read_text())

    def test_complete_input(self):
        self.assertEqual((1, 0), self.run_data("task,owner,due_date\nA,X,nonsense\n")[:2])
        self.assertEqual(app.NO_FOLLOW_UP, (self.output / "follow_up.txt").read_text())

    def test_invalid_headers(self):
        for header in ("", "task,owner\n", "owner,task,due_date\n", "task,owner,owner\n",
                       "task,owner,due_date,extra\n", "Task,owner,due_date\n", "\ntask,owner,due_date\n"):
            with self.subTest(header=header):
                self.rejected(header)

    def test_invalid_quotes_width_and_blank_task(self):
        for record in ('"unclosed,,\n', 'A"bad,,\n', '"A"junk,,\n', 'A,X\n', 'A,X,D,extra\n',
                       ',X,D\n', '   ,X,D\n', 'A,X,D\r'):
            with self.subTest(record=record):
                self.rejected("task,owner,due_date\n" + record)

    def test_invalid_utf8(self):
        self.source.write_bytes(b"task,owner,due_date\nA,\xff,\n")
        with self.assertRaises(app.InvalidInput):
            app.process(self.source, self.output)
        self.assertFalse(self.output.exists())

    def test_unsafe_prefix_in_every_field(self):
        for prefix in "=+-@＝＋－＠":
            for column in range(3):
                values = ["A", "X", "D"]
                values[column] = "  " + prefix + "danger"
                with self.subTest(prefix=prefix, column=column):
                    self.rejected("task,owner,due_date\n" + ",".join(values) + "\n")

    def test_controls_and_leading_line_breaks(self):
        for value in ("\tX", "A\tX", "A\x00X", "A\x1bX", "A\x7fX", "A\u202eX", "\nX", "\rX"):
            with self.subTest(value=repr(value)):
                self.rejected('task,owner,due_date\nA,"' + value + '",D\n')

    def test_record_boundary(self):
        self.assertEqual((10_000, 0), self.run_data("task,owner,due_date\n" + "A,X,D\n" * 10_000)[:2])
        other = self.root / "over"
        self.data("task,owner,due_date\n" + "A,X,D\n" * 10_001)
        with self.assertRaises(app.InvalidInput):
            app.process(self.source, other)
        self.assertFalse(other.exists())

    def test_byte_boundary_and_large_field(self):
        prefix = "task,owner,due_date\n"
        text = prefix + "A" * (app.MAX_BYTES - len(prefix) - len(",X,D\n")) + ",X,D\n"
        self.assertEqual(app.MAX_BYTES, len(text.encode()))
        self.assertEqual((1, 0), self.run_data(text)[:2])
        self.data(text + "\n")
        other = self.root / "over"
        with self.assertRaises(app.InvalidInput):
            app.process(self.source, other)
        self.assertFalse(other.exists())

    def test_existing_empty_directory_refused(self):
        self.data("task,owner,due_date\nA,,D\n")
        self.output.mkdir()
        with self.assertRaises(app.InvalidInput):
            app.process(self.source, self.output)
        self.assertEqual([], list(self.output.iterdir()))

    def test_path_escape_and_alias(self):
        self.data("task,owner,due_date\nA,,D\n")
        for output in (self.source, self.root, app.WORKSPACE.parent / "escaped-output"):
            with self.subTest(output=str(output)), self.assertRaises(app.InvalidInput):
                app.process(self.source, output)
        with self.assertRaises(app.InvalidInput):
            app.process(app.WORKSPACE.parent / "outside.csv", self.output)

    def test_write_failure_cleanup_and_source_preserved(self):
        self.data("task,owner,due_date\nA,,D\n")
        before = self.source.read_bytes()
        with patch.object(Path, "write_text", side_effect=PermissionError("injected write failure")):
            with self.assertRaises(OSError):
                app.process(self.source, self.output)
        self.assertFalse(self.output.exists())
        self.assertEqual([], list(self.root.glob(".handover-*")))
        self.assertEqual(before, self.source.read_bytes())

    def test_publish_failure_cleanup(self):
        self.data("task,owner,due_date\nA,,D\n")
        with patch.object(Path, "rename", side_effect=PermissionError("injected publish failure")):
            with self.assertRaises(OSError):
                app.process(self.source, self.output)
        self.assertFalse(self.output.exists())
        self.assertEqual([], list(self.root.glob(".handover-*")))

    def test_cli_exit_codes_and_no_record_echo(self):
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()) as error:
            self.data("task,owner,due_date\nA,=DO_NOT_ECHO,D\n")
            self.assertEqual(2, app.main(["--input", str(self.source), "--out-dir", str(self.output)]))
            self.assertNotIn("DO_NOT_ECHO", error.getvalue())
            self.assertEqual(1, app.main(["--input", str(self.root / "missing.csv"), "--out-dir", str(self.output)]))
            self.data("task,owner,due_date\nA,,D\n")
            self.assertEqual(0, app.main(["--input", str(self.source), "--out-dir", str(self.output)]))

    def test_actual_bad_invocation(self):
        result = subprocess.run([sys.executable, "-B", str(Path(app.__file__))], capture_output=True, text=True)
        self.assertEqual(2, result.returncode)
        self.assertIn("required", result.stderr)


if __name__ == "__main__":
    unittest.main()
