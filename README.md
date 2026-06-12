# Journeys to the West

An interactive map and timeline of the journeys of three Chinese Buddhist pilgrims —
**Faxian** (399–414 CE), **Xuanzang** (629–645 CE) and **Yijing** (671–695 CE) —
across the Indian subcontinent, built from their own travel records. It visualises
the religious landscape of their era (which yāna and which school flourished where),
each pilgrim's route, and the stories they recorded at every place.

Built with SvelteKit (Svelte 5), MapLibre GL, D3 and GSAP. Deployed as a fully
static site to GitHub Pages.

## Quick start

```sh
npm install
npm run dev        # regenerates the data, then starts the dev server
```

Requires Node 22+. The data pipeline runs automatically before `dev` and `build`,
so the only command you normally need is `npm run dev`.

## The golden rule: where data lives

There are **three layers** of data, and only the middle one is yours to edit:

```
raw/extracted/*.md          the translated source texts (never edited)
        │
        │  hand extraction (with verbatim quotes), validated by data/validate.py
        ▼
data/                       ★ THE SOURCE OF TRUTH — edit here ★
  faxian/places.json          one entry per pilgrim-per-place
  xuanzang/places.json
  yijing/places.json
  yijing/observations.json    Yijing's regional school-dominance claims
  canonical/places.json       cross-pilgrim reconciliation (one record per real place)
  pilgrims.json               the three pilgrims + their source works
  labels.json                 ASCII keys ↔ diacritic display labels
  regions.source.json         fuzzy testimony-region definitions
  schema/*.schema.json        JSON Schemas the data must validate against
        │
        │  scripts/build-data.mjs  (runs on every `npm run dev` / `npm run build`)
        ▼
static/data/                GENERATED — never edit, it is overwritten every build
  places-{pilgrim}.geojson    map pins (lean properties)
  routes.geojson              route lines (firsthand stops only)
  details.json                full place entries for the detail panels
  journeys/{pilgrim}.json     scrollytelling chapters and story cards
  regions.geojson             testimony zones
  observations.json, pilgrims.json
src/lib/data/labels.ts      GENERATED — labels/names only, never edit
```

**If you edit anything under `static/data/` (or `src/lib/data/labels.ts`), the
pipeline will silently revert it** the next time `dev` or `build` runs — that is
why a change made there "comes back". Make the change in `data/` instead and it
will flow everywhere: map bubbles, detail panels, witness columns, story cards.

### Worked example: change Nālandā's monastery count

The "Monasteries: 1" shown for Xuanzang at Nālandā comes from
`data/xuanzang/places.json`, entry `xuanzang-082-nalanda`:

```json
"monasteries": { "count": 1, "text": "a single walled complex of monasteries built by six successive kings", "approx": false }
```

Change `count` there (keeping `text` as the pilgrim's wording that justifies it),
then:

```sh
/Users/nicolaspettican/miniconda3/envs/py314/bin/python data/validate.py
npm run build:data    # or just `npm run dev`, which runs it for you
```

The site never shows a bare invented number: detail panels display the count
**with** the original phrase, so keep the two consistent.

## Editing and adding data

### The honesty rules (non-negotiable)

1. **Never fabricate.** Every place entry carries a `source.quote` taken
   *verbatim* from the raw text — `data/validate.py` literally checks that the
   quote appears in the corresponding file under `raw/extracted/`.
2. Numbers, schools and yānas must be supported by the text. Where the pilgrim
   is silent, the data says `null` / `unknown` — the UI renders that honestly.
3. Derived or interpretive values are kept separate and flagged
   (`sectDerived`, `monksEstimated`) — see `scripts/build-data.mjs` and
   `src/lib/data/monkEstimates.js`.
4. The word "Hinayana" is forbidden in the data (use `Sravakayana` /
   display "Śrāvakayāna"); the validator enforces this too.
5. Log every data change with a one-line entry in `data/EXTRACTION_PROGRESS.md`.

Read `data/EXTRACTION_GUIDE.md` before doing any substantial extraction work —
it defines the entry shape, id conventions (`{pilgrim}-{NNN}-{slug}`), `ref`
formats per translation, and the hard rules above.

### Editing an existing entry

1. Find the entry in `data/{pilgrim}/places.json` (ids are
   `faxian-…`/`xuanzang-…`/`yijing-…`; grep for the place name).
2. Edit the field. Common ones:
   - `monks` / `monasteries`: `{ "count": int|null, "text": "pilgrim's phrase"|null, "approx": bool }`
   - `yana`: array of `"Mahāyāna" | "Śrāvakayāna" | "Vajrayana" | "non-Buddhist" | "unknown"`
   - `sect`: array of ASCII school keys (e.g. `"Sarvastivada"` — labels in `data/labels.json`)
   - `features`, `anecdotes`, `activity`, `scholarlyNotes`
3. If you changed `yana`/`sect`, mirror it in the matching `visitedBy` record in
   `data/canonical/places.json` (and `reconciledYana`/`reconciledSect` if it
   changes the reconciled picture).
4. Validate, rebuild, eyeball the page:
   ```sh
   /Users/nicolaspettican/miniconda3/envs/py314/bin/python data/validate.py
   npm run dev
   ```

### Adding a new place

1. Append an entry to the pilgrim's `places.json` with the next `sequence`
   number (the validator requires the sequence to be contiguous) and an id of
   the form `yijing-014-some-slug`. Copy a neighbouring entry as a template —
   the schema (`data/schema/place.schema.json`) is strict:
   `additionalProperties: false`, all fields required except `supplementarySources`.
2. Set `firsthand: false` if the pilgrim only reports the place — hearsay
   renders as a hollow marker and is **excluded from the route line**.
3. Add a matching canonical record in `data/canonical/places.json`
   (`canonicalId`, coordinates + `geoConfidence`, `visitedBy` pointing at the
   new `placeId`). The place page `/places/{canonicalId}` is prerendered from this.
4. If the new `sequence` falls outside the pilgrim's chapter ranges in
   `journeyDefs` (`scripts/build-data.mjs`), widen the range — the build fails
   loudly with "chapters cover N of M stops" if you forget.
5. Validate + rebuild as above.

### Adding facts from a new source text

This happened once already (Yijing's *Kao Seng Chuan*, Lahiri 1986) and the
pattern is reusable:

1. Put the translated text in `raw/extracted/` as Markdown.
2. Register it in `data/validate.py` under `WORK_FILES` — the key is a
   substring of the `work` string you'll cite (this routes verbatim-quote
   checking to the right file).
3. Attach facts to **existing** entries via the optional `supplementarySources`
   array (`{work, ref, quote, note?}`) rather than creating duplicate entries —
   duplicates would distort routes and the witness comparison. The detail panel
   shows these under "Also in the pilgrim's writings".
4. Only quote the pilgrim's own text — translators' footnotes and introductions
   are scholarly apparatus and belong (paraphrased) in `scholarlyNotes`, not in
   quotes.
5. Add the work to the sources list on `/about` and log it in
   `data/EXTRACTION_PROGRESS.md`.

## Hand-owned vs generated files

| File | Status |
| --- | --- |
| `data/**` | hand-owned source of truth |
| `static/data/**` | **generated** every build — never edit (gitignored) |
| `src/lib/data/labels.ts` | **generated** — never edit |
| `src/lib/data/colours.ts` | hand-owned palette — never regenerated by scripts |
| `src/lib/data/monkEstimates.js` | hand-owned phrase→number estimator (shared by pipeline and UI) |
| `static/basemap/`, `static/glyphs/` | committed one-off build outputs (Natural Earth, font glyphs) |

`src/lib/data/monkEstimates.js` is where the representative values for phrase
counts live ("several thousand" → a number for bubble sizing). Edit the values
there and they apply everywhere; keep the `/about` page's list in step.

## Project tour

```
scripts/
  build-data.mjs        data/ → static/data/ + labels.ts (predev/prebuild)
  build-basemap.mjs     one-off: Natural Earth → static/basemap/ (committed)
  build-glyphs.mjs      one-off: font PBFs → static/glyphs/ (committed)
src/
  lib/map/              MapLibre style factory, layer definitions, camera helpers
  lib/components/map/   MapView, LayerControls, Legend
  lib/components/place/ detail panel, VisitDetail, WitnessComparison, anecdotes
  lib/components/scrolly/  scrollytelling (GSAP ScrollTrigger) story cards
  lib/components/timeline/ D3 timeline scrubber (gap-compressed 399–695 scale)
  lib/state/explorer.svelte.ts  URL-synced map state (?year=&layers=&place=)
  routes/
    map/                the Map Explorer
    journeys/[pilgrim]/ scrollytelling journey pages
    places/[canonicalId]/  one prerendered page per canonical place
    nalanda/            scroll-driven 3D tour (Three.js; content in tour.ts)
    bodh-gaya/          placeholder for a future 3D tour
    about/              sources & methodology
```

Architecture notes that matter when editing:

- **SvelteKit config is inline in `vite.config.ts`** (new `sv` scaffold style).
  There is no `svelte.config.js` — one would be silently ignored.
- The site deploys under a subpath, so every URL must use
  `import { base } from '$app/paths'`.
- Svelte 5 runes mode is forced; British English throughout
  (including `toLocaleString('en-GB')`).

## Commands

```sh
npm run dev          # build data + dev server
npm run build:data   # regenerate static/data/ + labels.ts only
npm run check        # svelte-check (keep at 0 errors)
npm run build        # production build (data pipeline runs first)
BASE_PATH=/journey-to-the-west npm run build   # what CI builds for Pages
/Users/nicolaspettican/miniconda3/envs/py314/bin/python data/validate.py  # data lint
```

To verify a production build the way it will be served (subpath matters — it
catches base-path bugs a root serve hides):

```sh
BASE_PATH=/journey-to-the-west npm run build
mkdir -p /tmp/pages-root && ln -sfn "$PWD/build" /tmp/pages-root/journey-to-the-west
cd /tmp/pages-root && python -m http.server 8741
# → http://localhost:8741/journey-to-the-west/
```

Playwright (with system Chrome, `channel: 'chrome'`) is a devDependency for
screenshot checks; see `scripts/verify-site.mjs` for the pattern. Screenshots
land in `verify-shots/`.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes to
GitHub Pages: `npm ci` → data pipeline → `BASE_PATH=/journey-to-the-west npm run build`
→ deploy `build/`. The basemap and glyphs are committed, so CI touches no
external data services.

## Sources

- Faxian, *A Record of Buddhistic Kingdoms*, tr. James Legge, 1886
- Xuanzang, *The Great Tang Dynasty Record of the Western Regions*, tr. Li Rongxi, 1996
- Yijing, *A Record of the Buddhist Religion as Practised in India and the Malay Archipelago*, tr. J. Takakusu, 1896
- Yijing, *Biography of Eminent Monks…* (Kao Seng Chuan), tr. Latika Lahiri, 1986 (supplementary)

Monk-pilgrim icon via Vecteezy (attribution in the site footer and
`static/img/attribution.txt`). Basemap geometry from Natural Earth (public domain).
