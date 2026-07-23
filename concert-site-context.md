# Concert Site — Project Context

> Handoff file. Paste into a new session to restore full context.
> Last updated: 2026-07-22

## Project

Denver-area concert listings site. Source data is a **public Google Sheet maintained by a Reddit user** (manual updates). Target refresh: ~once daily. Goal is a portfolio-grade, actually-useful site.

## Architecture — DECIDED

**Stack: GitHub Actions cron → normalize → commit JSON → static site (GitHub Pages or Cloudflare Pages). No database.**

Pipeline:
1. GH Action on daily cron + `workflow_dispatch` for manual runs
2. Fetch sheet as CSV
3. Normalize/validate → `data/shows.json`
4. Commit both `shows.json` AND the raw CSV (raw CSV = debug artifact for diagnosing upstream edits)
5. Commit triggers static site rebuild

Cost: $0. Moving parts: one YAML + one Node script.

### Why no Supabase
Read-only listings for one metro. A few-hundred-KB JSON on CDN beats DB queries. Supabase only justified if we later add: user accounts / saved shows, full-text search over thousands of rows, or client-side writes.

### Free win from committing JSON
Git history = free change detection. Diff today vs. yesterday → "5 added, 2 cancelled" for free. Powers a "Just Added" homepage section, RSS feed, or newsletter with no DB.

### Sheet access
- **Start here:** `https://docs.google.com/spreadsheets/d/{ID}/export?format=csv&gid={GID}` — works on any anyone-with-link sheet, no auth, no quota
- **Upgrade when it breaks:** Sheets API v4, read-only service account, key in GH secrets. Gives typed values instead of display strings + lets you enumerate tabs so a renamed tab doesn't fail silently

## The real complexity — a human types into this spreadsheet

- **Schema drift.** Key off header *names*, never column indexes. Validate the expected header set exists before parsing.
- **Dirty values.** "Feb 3" / "2/3" / "2/3-2/4" / "TBA"; venue names spelled three ways. Needs a normalizer + hand-maintained venue alias map. Log unparseable rows, never drop silently.
- **Fail-safe.** If validation fails: fail loudly (issue/email) but **do not commit**. Site keeps serving yesterday's known-good data.

## Reuse note
Same pipeline shape as the Denver-events piece of the personal productivity dashboard (Actions cron → normalize → commit → static render). Write the fetch-and-validate step generically enough to share.

## Open action items

- [ ] **Contact the Reddit sheet maintainer.** His hobby dataset, his manual labor. Credit prominently + link back to the sheet. Best case he stabilizes the schema, which kills half the parsing problems. If he says no, project is dead either way — ask before building.
- [ ] Price the domain (see below), then register
- [ ] Confirm sheet's geographic scope (Denver only? Boulder/FoCo/Red Rocks?) — this constrains the name

---

# Domain naming

## Current standings

| Rank | Name | Verdict |
|---|---|---|
| 1 | **303.show** | Top pick. Check pricing first — short numerics are often premium. |
| 2 | **showlistdenver.com** | Safe fallback. $12. Buy if 303.show is four figures. |
| 3 | MileHigh.show | Sounds best, but unownable phrase + likely premium |

**Recommended play:** price `303.show`. If under ~$300, take it and add `showlistdenver.com` as a cheap redirect for descriptive searchers.

## Why 303.show
Three chars, instantly local, no competing brand, easy to say aloud. Only candidate that reads as a *brand* rather than a description. Bonus: 303 = Roland TB-303 acid house synth — charming for a music site.

## Also considered / worth reviving
- `marquee.show` — a marquee is literally the physical object that lists what's playing. Best pure concept of any name discussed. Check premium pricing.
- `milehighvolume.com` — Mile High + high volume. Sounds like a music publication. `.com` available-ish.
- `colfax.rocks` — Colfax = spine of Denver live music (Fillmore, Ogden, Bluebird, Lion's Lair). `.rocks` is meaningful here, not just a `.com` substitute. Risk: geographically narrows you if the sheet covers Boulder/FoCo.
- `whosplaying.tonight`, `5280.live`, `doorsat8.co`, `thefax.live`, `elevated.show`, `soundcheck.show`, `lineup.show`, `onsale.show`, `doors.show`

## Rejected — with reasons

- **DNVR.show** — DNVR Sports (ALLCITY podcast network, Nuggets/Broncos/Avs) owns that string in Denverites' heads. Different sector but both local Denver media/entertainment → close enough that an attorney says think twice. You'd fight their SEO for your own brand name forever. Also rough by voice: spelling four letters + explaining the TLD.
- **ShowStarter** — wrong verb (implies you *create* shows; site does the opposite), ShowStopper collision people will never stop making, and "-Starter" now reads as crowdfunding.
- **tonight.show** — NBC trademark, heavily enforced.
- **Any venue name** (Red Rocks, Mission Ballroom, Cervantes) — Red Rocks is City of Denver-controlled w/ AEG operating, actively enforced. Reads as an affiliation claim.
- **denverlocal.show / denverlist.show / denvermusic.show** — descriptions, not names. "Local" is filler; "list"+"show" fight each other; "music"+"show" is redundant. Forgettable, and they box you in if coverage expands past Denver.
- **.wtf / .lol / .party** — read as throwaway; you want promoters and venues to take your emails seriously.

## SEO facts settled in this discussion

- **Exact-match domains are not a ranking factor.** Google's 2012 EMD update killed it deliberately. Having "denver" in the domain buys ~nothing.
- What actually ranks a listings site: **one indexable page per show** with `Event` schema markup (date, venue, performer, offers), one page per venue, and daily freshness. The pipeline gives you all of this for free.
- Only real cost of a non-descriptive domain is **CTR**, not ranking — a few percent, not structural.
- Bare-noun domains have word-of-mouth friction: say it aloud and people type it into a search bar instead of the URL bar. `.com` doesn't have this because the brain autocompletes.

## Registrar / pricing rules

Check **renewal** price, not the first-year promo — novelty TLDs hide the knife there. Also confirm premium domains don't carry premium pricing *forever*.

| TLD | Approx/yr |
|---|---|
| `.rocks` | ~$15 |
| `.tonight` | ~$25 |
| `.live` / `.show` | ~$30 |
| `.fm` | ~$80–100 — not worth it for a hobby project |

Use **Cloudflare Registrar** where the TLD is supported: wholesale pricing, no markup, no renewal games. Pairs cleanly with hosting on Cloudflare Pages.

## Verification still needed
No existing "Show List Denver" brand surfaced in search, but a small local newsletter wouldn't necessarily show up. Do a plain Google check before buying.
