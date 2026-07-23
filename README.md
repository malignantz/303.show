# 303.show

The fastest way to see what's playing tonight in Denver and along the Front Range.
One list. No ads, no login, no algorithm. A static site rebuilt daily from a
community-maintained spreadsheet.

See [`concert-site-context.md`](concert-site-context.md) (architecture + naming)
and [`design-and-product-plan.md`](design-and-product-plan.md) (product + design)
for the full thinking.

## Stack

- **SvelteKit + `adapter-static`** — every page (including one per show and per
  venue) is prerendered to HTML with `Event` schema markup. No server, no DB.
- **Pipeline**: a Node script reads the source sheet as CSV, normalizes the
  human-typed values, computes "just added" by diffing against the committed
  JSON, and writes `data/shows.json`.
- **GitHub Actions** cron runs the pipeline daily and commits the JSON; that
  commit triggers the host to rebuild. Cost: ~$0.
- **Cloudflare Pages** (recommended) serves the static `build/` from CDN.

## Local development

```bash
npm install
npm run data:mock   # generate realistic mock Denver data → data/shows.json
npm run dev         # http://localhost:5173
```

`npm run build` runs the pipeline then the static build. `npm run build:site`
skips the pipeline and just builds from the current `data/shows.json`.

## Wiring the real Google Sheet

The real source is **one spreadsheet with twelve monthly tabs**, each a GRID:
the header row is venue names (columns), column 0 of each row is a date, and
every other cell holds that venue's show(s) that day, e.g.
`Headliner | Opener One | Opener Two 8PM`. A cell can hold multiple shows
separated by a run of 3+ spaces, each ending in its time. **Each cell is also a
hyperlink to the show's ticket page** (AXS / Ticketmaster / Etix / DICE / …).

The pipeline downloads the whole workbook **once as XLSX** (no auth) via
[`pipeline/xlsx.mjs`](pipeline/xlsx.mjs) — XLSX because, unlike the CSV export,
it preserves those per-cell ticket hyperlinks. It flattens each grid to rows
([`pipeline/parse-matrix.mjs`](pipeline/parse-matrix.mjs)), classifies each
ticket link's platform, then runs the same normalizer as any other source.
~96% of shows come out with an exact ticket deep-link.

```bash
export SHEET_ID="19Dq2O2ee7raAis5rwkqYr22DVgIGlB7ylrKQNkka-pk"  # default, baked in
node pipeline/fetch-and-build.mjs   # (without --mock) fetches all tabs as one XLSX
```

Env knobs (all optional):

| Var          | Purpose                                                       | Default            |
|--------------|---------------------------------------------------------------|--------------------|
| `SHEET_ID`   | spreadsheet id                                                | the 303 sheet      |
| `SHEET_YEAR` | year to stamp on dates (**the sheet stores none reliably** — see below) | current year      |

### ⚠ The year problem

The month/day cells are Date-typed, but their **year is unreliable** — as of
the last check every tab's cells were stamped **2025** (the year the grid was
authored), regardless of which season the tab covers. So the pipeline ignores
the embedded year and stamps every date with `SHEET_YEAR` (default: the current
calendar year); the site then hides anything before today. Consequences:

- If the maintainer's data is actually for a specific year, set `SHEET_YEAR`.
- Late in the year the calendar thins out (only the remaining months are
  "upcoming") until the maintainer rolls the sheet forward.

### Tabs & venues

Month is derived from each tab's own date column, so tab order/gids don't
matter. A 13th tab (a short personal "spare tickets" list) is a different shape
and is auto-skipped by the grid validation. Venue-name spellings resolve through
an alias map in [`pipeline/venues.js`](pipeline/venues.js) — add new venues/
spellings there to attach addresses and neighborhoods (unmapped venues still
render, just without an address). In CI, `SHEET_ID`/`SHEET_YEAR` come from repo
variables — see [`.github/workflows/build-data.yml`](.github/workflows/build-data.yml).

### Fail-safe

If the sheet is missing a required column, or 0 valid rows parse from a non-empty
sheet, the pipeline **exits non-zero and writes nothing**. The last known-good
`data/shows.json` stays committed and the live site is unaffected. Unparseable
rows are logged (never dropped silently) so upstream typos are easy to spot.

## Deploy (Cloudflare Pages)

- Build command: `npm run build:site`  ·  Output dir: `build`
- Connect the repo; Cloudflare rebuilds on every push, including the daily data
  commit. Point `303.show` at it via Cloudflare Registrar + Pages.

## What's here (Phase 1 + 2)

Tonight marquee · full chronological calendar · per-show & per-venue pages with
Event schema · "Just Added" (git-diff freshness) · `/weekend` · localStorage
stars + "My Shows" + `.ics` export · "Pick a show for me" · share sheet · dark/
light (TB-303 faceplate) · offline service worker · installable PWA · and a
tap-the-logo TB-303 acid-line easter egg.

## Not yet (Phase 3)

Real sheet wired in · self-hosted font subsets · generated OG poster images ·
RSS + email digest · artist enrichment (Spotify/MusicBrainz) → genre filter +
previews · push for saved venues.

---

Data is community-maintained. All credit for the listings goes to the sheet's
maintainer. Not affiliated with any venue, promoter, or Roland.
