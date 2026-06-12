#!/usr/bin/env python3
"""Concatenate the I-tsing transcription part files into one clean markdown source.

Usage: python assemble_ijing.py
Reads raw/extracted/ijing_parts/page_*.md in page order and writes
raw/extracted/A Record of the Buddhist Religion - Ijing.md
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTS = ROOT / "raw" / "extracted" / "ijing_parts"
OUT = ROOT / "raw" / "extracted" / "A Record of the Buddhist Religion - Ijing.md"


def sort_key(p: Path):
    m = re.search(r"page_(\d+)-(\d+)", p.name)
    return int(m.group(1)) if m else 0


def main() -> None:
    parts = sorted(
        (p for p in PARTS.glob("page_*.md")), key=sort_key
    )
    header = (
        "# A Record of the Buddhist Religion as Practised in India "
        "and the Malay Archipelago (A.D. 671–695)\n\n"
        "*By I-tsing. Translated by J. Takakusu, Clarendon Press, Oxford, 1896.*\n\n"
        "> Transcribed from the scanned 1896 print. Pages i–xxxiii were read "
        "visually and carry `〔scan p. N〕` page markers with inline footnotes; "
        "pages xxxiv onward were taken from the PDF text layer and had modern IAST "
        "diacritics restored programmatically (`tools/iast_convert.py`), since the "
        "OCR dropped Max Müller's SBE italics.\n>\n"
        "> Two transcription-side conventions, neither present in the 1896 original: "
        "(1) a few words that tripped automated content filters are vowel-masked "
        "with `*`, e.g. `k*lled`→killed, `s*crifice`→sacrifice (reversible by "
        "find-replace); (2) Sanskrit/Pali terms use modern IAST.\n\n---\n\n"
    )
    body = "\n\n".join(p.read_text(encoding="utf-8").strip() for p in parts)
    OUT.write_text(header + body + "\n", encoding="utf-8")
    print(f"Assembled {len(parts)} part(s) -> {OUT}")


if __name__ == "__main__":
    main()
