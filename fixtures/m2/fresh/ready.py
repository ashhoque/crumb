"""Local client-readiness check. Standard library only; no retained customer data."""
import json
import sys


def readiness(jobs):
    if not isinstance(jobs, list) or not jobs:
        raise ValueError("Provide a non-empty list of client jobs.")
    ready, waiting, clients = [], [], set()
    for job in jobs:
        if not isinstance(job, dict) or not isinstance(job.get("client"), str) or not job["client"].strip():
            raise ValueError("Every job needs a client name.")
        client = job["client"].strip()
        if client.casefold() in clients:
            raise ValueError("Use each client name once.")
        clients.add(client.casefold())
        for key in ("required", "received"):
            values = job.get(key)
            if not isinstance(values, list) or any(not isinstance(x, str) or not x.strip() for x in values):
                raise ValueError(f"{client}: {key} must be a list of non-empty document names.")
        if not job["required"]:
            raise ValueError(f"{client}: specify at least one required document before declaring readiness.")
        received = {x.strip().casefold() for x in job["received"]}
        required = dict((x.strip().casefold(), x.strip()) for x in job["required"])
        missing = [label for key, label in required.items() if key not in received]
        if missing:
            waiting.append({"client": client, "missing": missing})
        else:
            ready.append(client)
    return {"ready": ready, "waiting": waiting}


def main():
    try:
        if len(sys.argv) != 2:
            raise ValueError("Usage: python ready.py jobs.json")
        with open(sys.argv[1], encoding="utf-8") as source:
            result = readiness(json.load(source))
        print(json.dumps(result))
        return 0
    except (OSError, ValueError) as error:
        print(f"Cannot check readiness: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
