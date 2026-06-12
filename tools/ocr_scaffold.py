#!/usr/bin/env python3
"""Dump the embedded OCR text layer for a page range, as a transcription scaffold.

Usage: python ocr_scaffold.py <start_page> <end_page>   # 1-based, inclusive
The output is the raw (messy) OCR layer — used only as a speed aid alongside
the rendered page images during careful visual transcription.
"""
import sys
import pymupdf

PDF = "raw/pdfs/(new) A Record of the Buddhist Religion - Ijing.pdf"


def main() -> None:
    start, end = int(sys.argv[1]), int(sys.argv[2])
    doc = pymupdf.open(PDF)
    for i in range(start - 1, min(end, doc.page_count)):
        print(f"\n========== OCR SCAFFOLD — page {i + 1} ==========")
        t = doc[i].get_text("text").strip()
        print(t if t else "(no text layer — pure image)")
    doc.close()


if __name__ == "__main__":
    main()
