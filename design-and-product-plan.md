# 303.show — Design & Product Plan

> Companion to `concert-site-context.md` (architecture + naming, already decided).
> This doc: why people come, why they return, what the site looks like, and the hook.
> Last updated: 2026-07-22

---

## 1. The core insight

Denver already has concert listings. What it doesn't have is a concert list that
**respects the 15 seconds you give it**.

The competitive landscape, researched 2026-07-22:

| Site | What it is | Where it fails |
|---|---|---|
| **Do303** (DoStuff network) | Broad events guide — concerts, comedy, food, promos | Promo-first, heavy, everything-app. You wade through sponsored content to find a Tuesday show. Blocks scrapers (403s), app-install nags. |
| **Westword calendar** | Alt-weekly listings | Ad-saturated news site wrapper; slow; listings are a side feature |
| **303 Magazine calendar** | Lifestyle mag events page | Editorial-first, not comprehensive, not fast |
| **Bandsintown / Songkick** | National aggregators | Want login + app install; algorithmic; miss small local rooms; feed you what ticketing partners pay for |
| **303 Local Music** | Local-metro live music calendar | Closest in spirit — small, worth watching, but limited polish/reach |
| **The Reddit sheet** (our source) | The best *data* in town | Spreadsheet UX. Unreadable on a phone. No links, no sharing, no memory |

**The gap:** the sheet has the community-trusted data; nobody has put a fast,
beautiful, phone-native face on it. The beloved models here are **Showlist Austin**
and **19hz.info** — utilitarian, dense, chronological lists that scenes genuinely
depend on. Both are ugly on purpose. The bet for 303.show:

> **Keep the density and honesty of a show list. Add the speed, polish, and
> shareability those sites never bothered with.** Utility site that looks like a
> brand, not a brand site that gestures at utility.

### Brand-collision note (new finding)
Do303 owns "Do + 303" in some Denverites' heads, and "303 Local Music" exists too.
`303.show` is still distinct (different verb, different vibe), but the visual
identity must NOT resemble DoStuff's (their teal/event-card look). Lean into the
TB-303 angle precisely because it gives "303" a *musical* meaning they can't claim.

---

## 2. Why people come — the three jobs

Design every screen against one of these; if a feature serves none, cut it.

**Job 1 — "What's on tonight?"** (impulse, mobile, standing somewhere)
The 9-seconds-on-the-sidewalk use case. This is the URL's promise: `303.show`
literally answers "what's the show?" The site must open **already answering it** —
no splash, no hero image, no "browse categories."

**Job 2 — "Anything good coming up?"** (planning, weekly ritual)
Scroll the next few weeks, star things, maybe buy tickets. Needs scannability at
volume: 15–20 shows/day, so typography and grouping do the heavy lifting.

**Job 3 — "I follow this scene."** (the regulars — our actual audience)
People who check every showlist site weekly for years. They care about
completeness, small rooms, and *what changed since I last looked*. They are also
the people who evangelize a site to friends. Serve them and growth is free.

## 3. Why people return

No accounts, no algorithm — so retention has to come from these five levers:

1. **Freshness you can *see*.** The git-diff superpower from the pipeline:
   a **"Just Added"** strip and a per-show `added 2 days ago` tag. Checking back
   is rewarded — there's always visible novelty. This is the single biggest
   retention feature and it costs nothing (context doc §"Free win").
2. **Speed as a habit.** If it opens faster than Instagram, it becomes the
   default tab. Performance is a retention feature, not an engineering nicety.
3. **A weekly ritual artifact.** "The Weekend List" — Thursday-ish cut of
   Fri/Sat/Sun, shareable as one URL (`303.show/weekend`) and as RSS/newsletter.
   Rituals beat notifications.
4. **Personal memory without accounts.** Star shows → localStorage. "My shows"
   view, `.ics` calendar export, countdown to your next starred show. Zero
   backend, feels like an app.
5. **Sharing loops.** Every show page renders a designed OG image (a mini gig
   poster). People invite friends by sharing links → every group chat is
   distribution. This is the growth hook; treat OG cards as a first-class
   design surface, not an afterthought.

---

## 4. The hook

Layered, from identity down to easter egg:

### 4a. Identity: the TB-303
The Roland TB-303 gives "303" a second meaning only a music site can use.
Design tokens taken from the hardware itself:
- **Silver/aluminum surface, black text** (the 303's faceplate) for light mode;
  **near-black with silver text** for dark mode (default — concert-finding
  happens at night).
- The 303's **red/orange/yellow accent buttons** as the functional accent colors
  (Just Added = red, Tonight = amber, etc.).
- Mono/technical typeface for dates & metadata (the 303's engraved labels),
  a characterful grotesque for artist names.
- Restraint rule: the site should read as "clean utility with a synth heritage,"
  not an acid-house theme park. One glance says *list*; the second glance says
  *someone with taste made this*.

### 4b. Structure: "Tonight" is the front door
The homepage IS tonight's list, styled like a **venue marquee** — big, bold,
tappable. Below it, the chronological river (Tomorrow, This Weekend, then
day-by-day). No landing page. The URL answers its own question in one paint.

### 4c. Delight: the sequencer easter egg
Tap the logo → a tiny 16-step TB-303 pattern plays (Web Audio, ~0 KB until
invoked) and the marquee letters pulse to it. Useless, memorable, and the thing
people show their friends — which is the point. (Also: the mute button becomes
lore.)

### 4d. Utility hooks (small, sharp)
- **`/tonight`, `/weekend`, `/venue/hi-dive`** — every useful cut is a clean
  shareable URL. URLs are the API.
- **"Pick for me"** — a die-roll button on Tonight: picks one show at random
  (weighted toward starred venues). Solves real decision paralysis, generates
  screenshots.
- **Works in the basement.** PWA offline cache means the list still loads at
  Larimer Lounge with one bar of signal. Say it on the install prompt —
  it's the one PWA benefit a concert-goer instantly gets.

---

## 5. UX / IA spec

### Page inventory
```
/                  Tonight (marquee) + chronological river + Just Added strip
/show/{slug}       One show: date/venue/time/price, map link, .ics, ticket link,
                   share card. Event schema markup. (SEO backbone — context doc)
/venue/{slug}      Venue page: upcoming shows, address, map. (SEO + Job 3)
/weekend           Fri–Sun cut
/added             Everything new this week (RSS feed lives here)
/my                Starred shows (localStorage; empty state teaches starring)
/about             Credit the sheet maintainer PROMINENTLY + link the sheet
```

### The list row (the atom of the whole site)
One show = one row, two lines, thumb-height (~64px):
```
ARTIST NAME (+ support, truncated)               ★
Venue · 8pm · $15 · [NEW]                     [tix]
```
- Date headers are sticky section dividers, not per-row noise.
- Whole row → show page; only `★` and `tix` are separate targets.
- Row count per screen ≈ 8–9 on a phone. Density is the feature; resist cards.
- **Degrade gracefully:** the sheet is human-typed (context doc §complexity).
  Missing price/time simply don't render — no "TBA" litter unless the sheet
  says TBA.

### Filters — earn each one
Launch with only: **date range chips** (Tonight / Weekend / All) + **venue**
+ text search (client-side over the JSON; it's a few hundred KB, instant).
No genre filter until the data can support it honestly (see §7 enrichment).

### Mobile-first specifics
- Bottom-anchored controls (thumb zone): filter chips + search live in a bottom
  bar, not a top nav.
- Sticky "jump to date" fast-scroller on the right edge for the river.
- View Transitions API for row → show page (cheap native-feeling polish).
- Tap targets ≥44px; no hover-dependent anything.

---

## 6. PWA strategy (yes, but honest about iOS)

- **Manifest + service worker, cache-first for `shows.json` + shell.** Instant
  repeat loads and the offline/basement story. This alone is 90% of PWA value.
- **Install prompt:** custom, contextual, never on first visit. Trigger after a
  return visit or a star ("Add 303.show to your home screen — works offline,
  opens instantly"). Android gets `beforeinstallprompt`; iOS needs manual
  Add-to-Home-Screen instructions (a small illustrated sheet).
- **Push notifications: defer to Phase 3, maybe forever.** iOS requires install
  before push; the audience-fit is questionable; and a Friday **RSS +
  email digest** (generated in the same Action) hits the ritual moment with
  zero permission-prompt cost. Revisit only if users ask for "alert me when
  [artist/venue] adds a show" — which localStorage stars could power via a
  tiny push service later.

## 7. Performance budget (hard limits, CI-enforced)

| Metric | Budget |
|---|---|
| JS shipped | < 50 KB gz (target ~30) |
| LCP on mid-range Android, 4G | < 1.0 s |
| shows.json | < 300 KB gz; split by month if it grows |
| Fonts | 1 variable font subset, < 40 KB, `font-display: swap` |
| Images | None in the list view. OG cards generated at build time |
| Lighthouse | 100/100/100/100 or the build fails |

Stack: **SvelteKit + adapter-static** (fits your Svelte practice), prerendered
`/show/*` and `/venue/*` pages from `shows.json` at build time, deployed on
Cloudflare Pages (pairs with Cloudflare Registrar per context doc). No client
data fetching on first paint — the list is in the HTML.

## 8. Data enrichment (later, still no DB)

Pipeline-side, cached into the committed JSON — keeps the static architecture:
- **Artist match → Spotify/MusicBrainz** (build-time API calls): genre tags →
  honest genre filter; 30-sec preview link on show pages ("who is this?" is a
  real Job 2 need).
- **Venue alias map** (already planned) grows into venue pages w/ address, map
  link, capacity.
- Every enrichment is optional decoration on the row spec — the site must be
  whole without it, because the sheet is the only guaranteed data.

## 9. Phasing

**Phase 0 — permission & domain (blocking, this week)**
Contact the sheet maintainer (context doc — project is dead without a yes).
Price/register `303.show`. Confirm geographic scope of the sheet.

**Phase 1 — the list (ship in ~a weekend)**
Pipeline → JSON → SvelteKit static: Tonight + river, show pages w/ Event
schema, venue pages, stars/localStorage, search, dark mode, perf budget.
It should already be the best way to see Denver shows on a phone.

**Phase 2 — the reasons to return**
Just Added (git diff), `/weekend`, RSS, `.ics` export, OG poster cards,
PWA offline + install prompt, sequencer easter egg, "Pick for me."

**Phase 3 — earned features (only if usage says so)**
Email digest, artist enrichment + genre filter + previews, push for starred
venues, maybe a public "changes" page (the git log as scene news).

## 10. Open questions

- Sheet maintainer's answer shapes everything (esp. whether we can promise daily freshness).
- Geographic scope → does "Tonight" need a Denver/Boulder toggle?
- Does the sheet include prices/times reliably enough to show in the row, or
  do they live only on the show page?
- Name check: any trademark friction with Roland over TB-303 *visual homage*?
  (Homage-not-logo should be fine; don't use Roland's marks or the device image.)

---

## Appendix: research sources (2026-07-22)

- Showlist Austin — https://austin.showlists.net/ (dense chronological list, filters, ticket links; the format that scenes trust)
- 19hz.info Bay Area — https://19hz.info/eventlisting_BayArea.php (tabular: time/tags/price/age/organizer/links; recurring-events section; venue+promoter directories)
- Do303 — https://do303.com/ (broad DoStuff events guide; fetch blocked by 403 — promo-heavy network model)
- 303 Local Music — https://www.303localmusic.com/
- Westword calendar — https://www.westword.com/music/denver-concert-calendar-find-any-show-in-town-5699762/
- 303 Magazine calendar — https://303magazine.com/calendar/
- Bandsintown Denver — https://bandsintown.com/c/denver-co
- PWA push/install practice — https://www.mobiloud.com/blog/pwa-push-notifications , https://www.magicbell.com/blog/using-push-notifications-in-pwas (iOS: install-before-push; custom pre-prompt at high-intent moments, never first load)
