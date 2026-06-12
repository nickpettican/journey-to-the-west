#!/usr/bin/env python3
"""Restore modern IAST diacritics in the OCR text of the I-tsing Record.

The PDF text layer kept the circumflex long vowels (â î û) but lost Max
Müller's SBE *typographic italics*, which encoded Sanskrit consonants
(italic k=c, g=j, s=ś, n=ṇ/ṅ, r=ṛ, t/d=ṭ/ḍ; sh=ṣ, ksh=kṣ). Those italics
are gone from the OCR, so the restoration is necessarily *word-specific*:
we CANNOT apply blanket letter rules (a global sh→ṣ would hit "should",
ri→ṛ would hit "river"). So we do:

  1. SUBS  — an explicit, ordered (longest-first) list of distinctive
             Sanskrit stems / names, each carrying ONLY its consonant fix
             (circumflex vowels left intact for step 2). Matched
             case-insensitively, case-preserving.
  2. VOWELS — a global, always-safe map â→ā, î→ī, û→ū (uppercase too).
             Chinese ê and French é/è/ê are deliberately untouched.

Usage:
    python tools/iast_convert.py raw/extracted/ijing_parts/page_0040-0314.md
The original is backed up to <file>.orig and the file is rewritten in place.
A coverage report (replacement counts + residual suspicious tokens) is
printed to stderr so the SUBS list can be extended.
"""
import re
import sys
from pathlib import Path

# --- 1. Consonant restorations (vowels stay circumflex; step 2 handles them).
#     Ordered longest-first below via sort, so e.g. "Asangha" beats "sangh".
#     Each value encodes ONLY consonant changes. Inflections (plural s,
#     possessive 's, compounds) follow for free since we match substrings.
SUBS = {
    # --- s -> ś -----------------------------------------------------------
    "srîbhoga": "śrîbhoga", "srî-nâlanda": "śrî-Nâlanda", "srîkshatra": "śrîkshatra",
    "srî-kshatra": "śrî-kshatra", "srâvastî": "śrâvastî", "srî": "śrî",
    "sâstra": "śâstra", "-sâstra": "-śâstra", "sâkyamuni": "śâkyamuni",
    "sâkyakîrti": "śâkyakîrti", "sâkyadeva": "śâkyadeva", "sâkya": "śâkya",
    "vaisâlî": "vaiśâlî", "kâsyapa": "kâśyapa", "kâsikâ": "kâśikâ",
    "mahîsâsaka": "mahîśâsaka", "sîlâditya": "śîlâditya", "silâditya": "śîlâditya",
    "mahâsîla": "mahâśîla", "sîla": "śîla", "visvântara": "viśvântara",
    "asvaghosha": "aśvaghoṣa", "mangusrî": "mañjuśrî", "sramaner": "śramaṇer",
    "sikshamânâs": "śikṣamâṇâs", "asoka": "aśoka", "sâriputra": "śâriputra",
    "sârîputra": "śârîputra", "madhya-desa": "madhya-deśa", "madhyadesa": "madhyadeśa",
    "arya-desa": "ārya-deśa", "âryadesa": "âryadeśa", "nirdesa": "nirdeśa",
    "upadesana": "upadeśanā", "pratidesana": "pratideśanā",
    "âpattipratidesana": "âpattipratideśanā", "hitopadesa": "hitopadeśa",
    "nridesa": "nirdeśa", "desana": "deśanā", "desa": "deśa",
    "sushvâgata": "suṣvâgata", "sarvâstivâda": "sarvâstivâda",  # vowel only; keep for clarity
    "kâsî": "kâśî", "kâsi": "kâśi", "visâkha": "viśâkha", "santivâhana": "śântivâhana",
    "sântivâhana": "śântivâhana", "sâlivâhana": "śâlivâhana",
    # --- sh -> ṣ , ksh -> kṣ ----------------------------------------------
    "bhikshunî": "bhikṣuṇî", "bhikshuni": "bhikṣuṇî", "bhikshu": "bhikṣu",
    "sankakshikâ": "saṃkakṣikâ", "kakshikâ": "kakṣikâ", "kshatriya": "kṣatriya",
    "moksha": "mokṣa", "varsha": "varṣa", "purusha": "puruṣa", "kanishka": "kaniṣka",
    "bhaishagya": "bhaiṣajya", "vriksha": "vṛkṣa", "nishîdana": "niṣîdana",
    "kshamâ": "kṣamâ", "dakshin": "dakṣiṇ", "ashtadhâtu": "aṣṭadhâtu",
    "sanghâdisesha": "saṃghâdiseṣa", "poshadha": "poṣadha", "parishad": "pariṣad",
    "kâshâya": "kâṣâya",
    # residual ksh/sh Sanskrit terms (2nd pass)
    "dharmaraksha": "dharmarakṣa", "raksha": "rakṣa", "kshasa": "kṣasa",
    "kshatra": "kṣatra", "kshetra": "kṣetra", "kshobhya": "kṣobhya",
    "vaiseshika": "vaiśeṣika", "gyeshtha": "jyeṣṭha", "gyotish": "jyotiṣ",
    "sleshman": "śleṣman", "yaksh": "yakṣ", "bhâsh": "bhâṣ", "shtra": "ṣṭra",
    "kâshtha": "kâṣṭha", "paurusha": "pauruṣa", "vibhasha": "vibhāṣā",
    "srîkshatra": "śrîkṣatra", "srî-kshatra": "śrî-kṣatra",
    "srikshatra": "śrīkṣatra", "sri-kshatra": "śrī-kṣatra",
    "sarshapa": "sarṣapa", "nishidana": "niṣīdana",
    # --- g -> j -----------------------------------------------------------
    "yogana": "yojana", "nâgârguna": "nāgārjuna", "gambudvîpa": "jambudvîpa",
    "gambupâna": "jambupâna", "gambu": "jambu", "vagrâsana": "vajrâsana",
    "vagrakkhedikâ": "vajrakkhedikâ", "vagrapâni": "vajrapâni",
    "vagrasekhara": "vajraśekhara", "vagra": "vajra", "kânyakubga": "kānyakubja",
    "kubga": "kubja", "râgagriha": "rājagṛha", "râgagaha": "rājagaha",
    "kumâragîva": "kumārajîva", "gîmûtavâhana": "jîmûtavâhana",
    "gîvaka": "jîvaka", "gâtakamâlâ": "jâtakamâlâ", "gâtaka": "jâtaka",
    "gaina": "jaina", "gayâditya": "jayâditya", "kânyakubja": "kānyakubja",
    # --- k -> c -----------------------------------------------------------
    "âkârya": "âcârya", "kîna": "cîna", "trikîvara": "tricîvara",
    "mâtriketa": "mātṛceṭa", "kûrni": "cūrṇi", "kaitya": "caitya",
    "kandragupta": "candragupta", "katurvarga": "caturvarga",
    "katuddisasangha": "câturdiśasaṅgha",
    # --- n -> ṇ / ṅ / ṃ  (r/ri -> ṛ ; t/d -> ṭ/ḍ where word-specific) -----
    "nirvâna": "nirvâṇa", "nirvana": "nirvâṇa", "pânini": "pâṇiṇi",
    "pânin": "pâṇin", "pravârana": "pravâraṇa", "uttarâsanga": "uttarâsaṅga",
    "dhûtânga": "dhûtâṅga", "saddharmapundarîka": "saddharmapuṇḍarîka",
    "nairanganâ": "nairañjanâ", "sanghâtî": "saṅghâṭî", "sanghabhadra": "saṅghabhadra",
    "sanghabhedaka": "saṅghabhedaka", "sanghavarman": "saṅghavarman",
    "sanghârâma": "saṅghârâma", "sanghika": "sāṃghika", "asangha": "asaṅga",
    "sangha": "saṅgha", "sangh": "saṅgh", "pundarîka": "puṇḍarîka",
    # --- r/ri -> ṛ  (word-specific only) ----------------------------------
    "gridhrakûta": "gṛdhrakûṭa", "gridhra-kuta": "gṛdhra-kûṭa",
    "gridhrakula": "gṛdhrakûṭa", "gridhra": "gṛdhra", "mrigadâva": "mṛgadâva",
    "mriga": "mṛga", "bhartrihari": "bhartṛhari", "brihat": "bṛhat",
    "amrita": "amṛta", "krishna": "kṛṣṇa", "vritti": "vṛtti", "vrittisûtra": "vṛttisûtra",
    # --- t/d -> ṭ/ḍ  (word-specific) --------------------------------------
    "tripitaka": "tripiṭaka", "tipitaka": "tipiṭaka", "pitaka": "piṭaka",
    "pâtimokkha": "pāṭimokkha", "pâtidesaniyâ": "pāṭideśaniyâ",
    "kûta": "kûṭa", "stûpa": "stûpa", "ratnakûta": "ratnakûṭa",
    "sammitîya": "sammitîya", "ghantâ": "ghaṇṭâ",
    # --- whole names with multiple fixes ----------------------------------
    "mûlasarvâstivâda": "mūlasarvâstivâda",  # vowel only; consonants ok
    "mahâsanghika": "mahāsāṃghika", "mahâsanghikanikâya": "mahāsāṃghikanikâya",
    "sammatîya": "sammatîya", "nâlandâ": "nālandā", "nâlanda": "nālandā",
    "tâmralipti": "tāmraliptī", "îsânapura": "īśânapura", "îsvara": "īśvara",
    "kasmîra": "kaśmîra", "harîtî": "hārîtî", "mâthara": "māṭhara",
}

# Build an ordered list, longest key first, so specific entries win.
ORDERED = sorted(SUBS.items(), key=lambda kv: -len(kv[0]))


def apply_subs(text: str) -> tuple[str, dict]:
    counts = {}
    for frag, iast in ORDERED:
        pat = re.compile(re.escape(frag), re.IGNORECASE)

        def repl(m):
            s = m.group(0)
            if s.isupper() and len(s) > 1:
                return iast.upper()
            if s[0].isupper():
                return iast[0].upper() + iast[1:]
            return iast

        text, n = pat.subn(repl, text)
        if n:
            counts[frag] = n
    return text, counts


VOWELS = str.maketrans({"â": "ā", "î": "ī", "û": "ū", "Â": "Ā", "Î": "Ī", "Û": "Ū"})


def main() -> None:
    path = Path(sys.argv[1])
    raw = path.read_text(encoding="utf-8")

    converted, counts = apply_subs(raw)
    converted = converted.translate(VOWELS)

    backup = path.with_suffix(path.suffix + ".orig")
    if not backup.exists():
        backup.write_text(raw, encoding="utf-8")
    path.write_text(converted, encoding="utf-8")

    total = sum(counts.values())
    print(f"[iast] {total} consonant replacements across {len(counts)} terms.", file=sys.stderr)
    print(f"[iast] backup -> {backup}", file=sys.stderr)

    # Residual report: tokens that still look like un-restored Sanskrit
    # (contain sh/ksh, or circumflex left that the vowel map missed) so we
    # can extend SUBS. Exclude obvious English via a small stop set.
    STOP = {"should", "wish", "wishes", "wishing", "shadow", "worship", "shall",
            "wash", "washed", "washing", "short", "shoulder", "shoulders", "show",
            "shows", "shown", "showing", "ship", "she", "shore", "shoes", "shirt",
            "shape", "shell", "sheet", "fresh", "flesh", "finished", "established",
            "distinguish", "distinguished", "published", "accomplish",
            "accomplished", "shaved", "worshipping", "shih", "shan", "shang",
            "shi", "shu", "shê", "shêng", "fujishima"}
    residual = {}
    for tok in re.findall(r"[A-Za-zâîûĀ-ž]+", converted):
        low = tok.lower()
        if low in STOP:
            continue
        if re.search(r"ksh|sh", low) and not re.search(r"[ṣṅṇṃṛḍṭś/]", tok):
            residual[tok] = residual.get(tok, 0) + 1
    if residual:
        print("[iast] residual sh/ksh tokens to review:", file=sys.stderr)
        for tok, n in sorted(residual.items(), key=lambda kv: -kv[1])[:50]:
            print(f"        {n:4d}  {tok}", file=sys.stderr)


if __name__ == "__main__":
    main()
