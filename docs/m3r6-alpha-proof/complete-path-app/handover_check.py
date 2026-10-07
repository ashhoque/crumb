"""Bounded synthetic CSV handover checker. Python 3.11+, standard library only."""
import argparse
import csv
import io
from pathlib import Path
import shutil
import sys
import tempfile
import unicodedata

WORKSPACE = Path(__file__).resolve().parents[2]
MAX_BYTES = 1024 * 1024
MAX_RECORDS = 10_000
HEADER = ["task", "owner", "due_date"]
NO_FOLLOW_UP = ("No follow-up needed: no blank owner or due_date fields were found. "
                "This does not validate the values.\n")


class InvalidInput(ValueError):
    pass


def validate_quoting(text):
    """Reject quotes in unquoted fields, trailing quote junk and bare record CRs.

    csv.reader(strict=True) handles quoted values but accepts some malformed
    unquoted quotes, so check the small supported dialect before parsing.
    """
    state = "start"
    index = 0
    while index < len(text):
        char = text[index]
        if state == "quoted":
            if char == '"':
                if index + 1 < len(text) and text[index + 1] == '"':
                    index += 2
                    continue
                state = "closed"
        elif char in "\r\n":
            if char == "\r":
                if index + 1 >= len(text) or text[index + 1] != "\n":
                    raise InvalidInput("Unsupported bare CR record separator.")
                index += 1
            state = "start"
        elif char == ",":
            state = "start"
        elif char == '"':
            if state != "start":
                raise InvalidInput("Malformed CSV quoting.")
            state = "quoted"
        else:
            if state == "closed":
                raise InvalidInput("Unexpected text after a closing quote.")
            state = "plain"
        index += 1
    if state == "quoted":
        raise InvalidInput("Unclosed quoted field.")


def validate_field(value, number, field):
    if (value.startswith(("\t", "\r", "\n"))
            or value.lstrip().startswith(tuple("=+-@＝＋－＠"))):
        raise InvalidInput(f"Record {number}, field {field}: unsafe field prefix.")
    if any(unicodedata.category(char) in ("Cc", "Cf") and char not in "\r\n"
           for char in value):
        raise InvalidInput(f"Record {number}, field {field}: disallowed control character.")


def read_handover(source):
    with source.open("rb") as stream:
        raw = stream.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise InvalidInput("Input exceeds 1 MiB.")
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise InvalidInput("Input must be UTF-8 (optional BOM).") from None
    validate_quoting(text)
    previous_limit = csv.field_size_limit()
    csv.field_size_limit(MAX_BYTES)
    try:
        reader = csv.reader(io.StringIO(text, newline=""), strict=True)
        if next(reader, None) != HEADER:
            raise InvalidInput("Expected exact header: task,owner,due_date.")
        count = 0
        exceptions = []
        for row in reader:
            if not row:
                continue
            count += 1
            if count > MAX_RECORDS:
                raise InvalidInput("Input exceeds 10,000 data records.")
            if len(row) != 3:
                raise InvalidInput(f"Record {count}: expected three fields.")
            for field, value in zip(HEADER, row):
                validate_field(value, count, field)
            if not row[0].strip():
                raise InvalidInput(f"Record {count}: task must not be blank.")
            missing = [field for field, value in zip(HEADER[1:], row[1:])
                       if not value.strip()]
            if missing:
                exceptions.append([count, *row, ";".join(missing)])
        return count, exceptions
    except csv.Error:
        raise InvalidInput("Malformed CSV.") from None
    finally:
        csv.field_size_limit(previous_limit)


def visible(value):
    return value.replace("\\", "\\\\").replace("\r", "\\r").replace("\n", "\\n")


def follow_up(exceptions):
    if not exceptions:
        return NO_FOLLOW_UP
    lines = ["Subject: Handover details to confirm", "", "Hi,", "",
             "I found a few blank fields in the handover. Could you confirm the missing details below?"]
    for number, task, owner, due_date, missing in exceptions:
        lines.append(f"- Record {number}, {visible(task)}: {missing.replace(';', ', ')}")
    lines.extend(["", "If a field is intentionally blank, please let me know. Thanks.", ""])
    return "\n".join(lines)


def process(input_path, output_path):
    source = Path(input_path).resolve()
    destination = Path(output_path).resolve()
    if not source.is_relative_to(WORKSPACE) or not destination.is_relative_to(WORKSPACE):
        raise InvalidInput("Input and output must stay inside the disposable workspace.")
    if destination == source or destination in source.parents:
        raise InvalidInput("Output must be separate from input.")
    if destination.exists() or Path(output_path).is_symlink():
        raise InvalidInput("Output directory already exists; choose a new name.")
    count, exceptions = read_handover(source)
    destination.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=".handover-", dir=destination.parent))
    try:
        with (staging / "incomplete.csv").open("w", encoding="utf-8", newline="") as stream:
            writer = csv.writer(stream)
            writer.writerow(["row_number", *HEADER, "missing_fields"])
            writer.writerows(exceptions)
        (staging / "follow_up.txt").write_text(follow_up(exceptions), encoding="utf-8")
        # Windows rename refuses an existing destination, including an empty dir.
        if destination.exists():
            raise InvalidInput("Output directory appeared during processing; choose a new name.")
        staging.rename(destination)
    finally:
        if staging.exists():
            shutil.rmtree(staging)
    return count, len(exceptions), destination


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Check fictional handover CSVs locally; export exceptions and an unsent draft.",
        epilog="Exact task,owner,due_date header; UTF-8, LF/CRLF, <=1 MiB and <=10,000 records. "
        "Only whitespace-trimmed blanks count as missing; TBD/N/A/bad nonempty dates count as present. "
        "No person, calendar or overdue validation. Conservative formula/control rejection may reject "
        "legitimate text and is not universal spreadsheet protection. Synthetic data only; no sending.")
    parser.add_argument("--input", required=True, help="Supported synthetic CSV inside workspace")
    parser.add_argument("--out-dir", required=True, help="New directory inside workspace; never overwritten")
    args = parser.parse_args(argv)
    try:
        count, incomplete, destination = process(args.input, args.out_dir)
    except InvalidInput as error:
        print(f"Invalid input: {error}", file=sys.stderr)
        return 2
    except OSError:
        print("File operation failed; check paths and permissions. No final output was published.", file=sys.stderr)
        return 1
    print(f"Scanned: {count}; incomplete: {incomplete}")
    print(destination / "incomplete.csv")
    print(destination / "follow_up.txt")
    return 0


if __name__ == "__main__":
    sys.exit(main())
