#!/usr/bin/env python
"""Validate the extracted pilgrim data against the JSON Schemas and run lint checks.

Usage: /Users/nicolaspettican/miniconda3/envs/py314/bin/python data/validate.py
Exit code 0 = all good; 1 = problems (printed).
"""
import json
import re
import sys
from pathlib import Path

import jsonschema

DATA = Path(__file__).resolve().parent
ROOT = DATA.parent
RAW = ROOT / "raw" / "extracted"

PLACE_SCHEMA = json.loads((DATA / "schema" / "place.schema.json").read_text())
OBS_SCHEMA = json.loads((DATA / "schema" / "observation.schema.json").read_text())

# Which emitted file maps to which raw source (for verbatim-quote checking).
SOURCE_FILES = {
    "faxian": RAW / "Faxien-Record-of-Buddhist-India.md",
    "xuanzang": RAW / "Great Tang Record of Western Regions - Xuensang.md",
    "yijing": RAW / "A Record of the Buddhist Religion - Ijing.md",
}

# Supplementary works: a `source.work`/`supplementarySources[].work` containing the
# key (substring match) is checked against this raw file instead of the pilgrim default.
WORK_FILES = {
    "Biography of Eminent Monks": RAW
    / "Chinese Monks in India: Biography of Eminent Monks Who Went to the Western World in Search of the Law During the Great T'ang Dynasty.md",
}

PLACE_FILES = ["faxian/places.json", "xuanzang/places.json", "yijing/places.json"]
OBS_FILES = ["faxian/observations.json", "xuanzang/observations.json", "yijing/observations.json"]


def norm(s: str) -> str:
    """Whitespace-normalise for forgiving verbatim matching (md line wraps differ)."""
    return re.sub(r"\s+", " ", s).strip()


def main() -> int:
    errors = []

    raw_text = {k: norm(p.read_text()) for k, p in SOURCE_FILES.items() if p.exists()}
    work_text = {k: norm(p.read_text()) for k, p in WORK_FILES.items() if p.exists()}

    def haystack_for(work, default):
        for key, text in work_text.items():
            if key in (work or ""):
                return text
        return default

    def check_quotes_and_hinayana(records, rel):
        blob = json.dumps(records, ensure_ascii=False)
        for bad in ("Hinayana", "Hīnayāna"):
            if bad in blob:
                errors.append(f"{rel}: forbidden string {bad!r} present (convert to Śrāvakayāna)")
        pilgrim_key = rel.split("/")[0]
        default = raw_text.get(pilgrim_key, "")
        for rec in records:
            sources = [rec.get("source", {})] + rec.get("supplementarySources", [])
            for src in sources:
                q = norm(src.get("quote", ""))
                haystack = haystack_for(src.get("work"), default)
                if q and haystack and q not in haystack:
                    errors.append(f"{rel}: quote not found verbatim in source: {q[:70]!r}")

    for rel in PLACE_FILES:
        p = DATA / rel
        if not p.exists():
            continue
        records = json.loads(p.read_text())
        try:
            jsonschema.validate(records, PLACE_SCHEMA)
        except jsonschema.ValidationError as e:
            errors.append(f"{rel}: schema error at {list(e.absolute_path)}: {e.message}")
        check_quotes_and_hinayana(records, rel)

        # sequence contiguity per pilgrim
        seqs = sorted(r["sequence"] for r in records)
        if seqs and seqs != list(range(seqs[0], seqs[0] + len(seqs))):
            errors.append(f"{rel}: sequence not contiguous/unique: {seqs}")
        # date.year present or null-with-basis
        for r in records:
            d = r.get("date", {})
            if d.get("year") is None and not d.get("basis"):
                errors.append(f"{rel}: {r['id']} has null date.year and no basis")

    for rel in OBS_FILES:
        p = DATA / rel
        if not p.exists():
            continue
        records = json.loads(p.read_text())
        try:
            jsonschema.validate(records, OBS_SCHEMA)
        except jsonschema.ValidationError as e:
            errors.append(f"{rel}: schema error at {list(e.absolute_path)}: {e.message}")
        check_quotes_and_hinayana(records, rel)

    if errors:
        print(f"FAIL — {len(errors)} problem(s):")
        for e in errors:
            print("  -", e)
        return 1
    print("OK — all present data files validate and pass lint checks.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
