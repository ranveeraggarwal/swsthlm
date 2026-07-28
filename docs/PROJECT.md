# Stockholm Swing — project plan

**Repo:** `ranveeraggarwal/swsthlm` · **Site:** stockholmswing.com

This document records **decisions and constraints** — why the project is shaped
the way it is, and what it has decided not to become. It is deliberately not a
status tracker: **GitHub issues and milestones are the authority on what is
open, closed, or next**, and nothing here needs editing when an issue closes.

(It used to carry a hand-maintained issue index mirroring GitHub. Within three
weeks that index had ten issues marked open that were closed, two marked shipped
that were never built, and two pull requests described as awaiting merge that
didn't exist. A second copy of a database you can't keep in sync is worse than
no copy.)

## 1. Vision

Stockholm Swing is the single, trustworthy answer to "where can I swing dance in
Stockholm this week?" It should be fast, correct, shareable, and cheap enough in
maintenance effort that it survives the maintainer losing interest, travelling
for a month, or handing it over entirely.

Success looks like: dancers subscribe to it from their calendar app, organizers
submit events themselves, Google surfaces its events directly in search, and the
weekly maintenance load is "review a few pull requests on a phone."

Three principles govern every decision here. They're stated in full in
[`../CLAUDE.md`](../CLAUDE.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md); in
short: **structured data is the truth**, **no servers, accounts or database**,
and **humans review diffs, robots produce them**.

## 2. Architecture decision: repo-as-database

**Decision:** The source of truth is CSV files in this repository under `/data/`,
not a Google Sheet. The [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSd87pOy31N_3xKthqalT-sDrFB2yoe74Z8HGr8q1HSs6Pis2g/viewform)
remains the organizer-facing intake; its responses sheet is an inbox that an
Action drains into pull requests. The site reads `/data/` at build time and is
fully static; a Vercel deploy hook rebuilds on every push to `main`.

**Why:** Every automation the project depends on — scraper PRs, CI validation,
diff-based review — requires a pull-request workflow, which a sheet cannot
provide. Sheet edits go live instantly with no review gate, history is opaque,
validation can only run after publication, and the published-CSV endpoint is
coupled to one personal Google account: the worst possible bus-factor. The
sheet's one real advantage, friction-free entry for non-technical people, is
preserved through the form. Direct quick edits move to GitHub's web editor,
which is adequate.

**Consequences:** No runtime CSV fetch and no client-side parsing. ISR is
unnecessary for data freshness — rebuild-on-push covers it. Only time-relative
UI ("Happening Now", "Tomorrow") is computed client-side after hydration, since
static HTML cannot know the current time.

### Data model

Five CSVs under `/data`: `venues.csv` (the venue registry), `series.csv`
(recurring weeklies), `exceptions.csv` (per-date overrides for a series),
`oneoffs.csv` (single and multi-day events), and `bands.csv` (the scraper's
swing-band trust roster, which never produces calendar entries).

**The column-by-column contract lives in [`DATA.md`](DATA.md) and is
authoritative.** It is deliberately not restated here — an earlier version of
this section carried a copy that drifted, describing `exceptions.csv` as
`(series_id, date, field, value)` key-value rows when it in fact shipped with a
column per overridable field.

A build-time expansion step turns series + exceptions into concrete occurrences
for the next ~10 weeks. `status` provides the draft/live gate; `cancelled` is a
per-date exception, never a deletion, so the site can *show* the cancellation.
Past one-offs are retained as `status=ended`, never deleted — the build renders
only `live`.

## 3. Decisions on record

Choices that were made once, for reasons, and that a later contributor could
plausibly undo without knowing — or waste a day re-deriving. Each is recorded in
full where it applies; this is only the map. **The reasoning stays in the linked
doc, deliberately: a summary here would be a second copy to drift.**

If you're about to reverse one of these, that's allowed — but read the entry
first and argue against it, rather than around it.

### Data & intake

| Decision | Recorded in |
|---|---|
| The source of truth is CSVs in this repo, not the Google Sheet | §2 above |
| Form responses are read from a **published CSV**, not the Sheets API with a service account | [`architecture/FORM_SYNC.md`](architecture/FORM_SYNC.md) |
| Form rows land as `status=live`; the `draft`-then-promote step was tried and removed as redundant with PR review | [`architecture/FORM_SYNC.md`](architecture/FORM_SYNC.md) |
| Corrections are a one-way report to a human, never auto-matched and applied | [`architecture/FORM_SYNC.md`](architecture/FORM_SYNC.md) |
| Cancellations are exceptions, never deletions; past events become `status=ended`, never deleted | [`DATA.md`](DATA.md) |
| Nothing may invent a venue — an unknown one is flagged for a human, never created | [`DATA.md`](DATA.md), [`architecture/SCRAPERS.md`](architecture/SCRAPERS.md) |
| Overlapping-event detection is a CI **warning**, not a failure — some venues genuinely run two things at once | [`DATA.md`](DATA.md) |

### Scrapers

| Decision | Recorded in |
|---|---|
| **The SSS Google Calendar is unusable. Do not re-try it.** Recorded negative result with the evidence | [`architecture/SCRAPERS.md`](architecture/SCRAPERS.md) |
| Facebook and Instagram are not scraped nightly; those sources are hand-entered, and #211 is the live alternative | [`architecture/SCRAPERS.md`](architecture/SCRAPERS.md) |
| Relevance is declared **per source**, not global; mixed venues trust by band roster, not keywords | [`architecture/SCRAPERS.md`](architecture/SCRAPERS.md) |
| Keyword matching is **word-boundary, not substring** — visible false-includes beat silent misses | [`architecture/SCRAPERS.md`](architecture/SCRAPERS.md) |
| Rows are written by **surgical text edit**, never parse → mutate → unparse, or the nightly diff becomes the whole file | [`architecture/SCRAPERS.md`](architecture/SCRAPERS.md) |
| The validation gate blocks only on errors the scrape *introduces*, not pre-existing ones | [`architecture/SCRAPERS.md`](architecture/SCRAPERS.md) |

### Language

| Decision | Recorded in |
|---|---|
| **The chrome is translated; the content is not.** Organizer prose stays in whatever language it was written in, so a Swedish page shows Swedish navigation around mixed-language event text | §5 below, [`DATA.md`](DATA.md) |
| **Swedish is a client-side preference, not a second prerendered site.** No `/sv`, nothing localized at its own URL — and therefore **no Swedish search visibility**, given up knowingly | [`architecture/CODE_STRUCTURE.md`](architecture/CODE_STRUCTURE.md), [`SEO.md`](SEO.md), issue #266 |
| The first client render must match the served English HTML; the stored preference applies **after** mount. Reading it during render is a hydration mismatch on every text node | `components/providers/LocaleProvider.tsx` |
| The site never **auto-switches** on `navigator.language` — a static site can't vary its response, so guessing makes every visitor who prefers the default watch the page flip on each load. It may **ask once**, and remembers the answer either way | `components/layout/LanguagePrompt.tsx`, issues #265 and #284 |
| Adding a language costs **one entry in `LOCALES` and one bundle file** — no route, component or logic changes. There is no CI gate; the rule is the gate | [`architecture/CODE_STRUCTURE.md`](architecture/CODE_STRUCTURE.md) |
| Changelog entries stay **English only**; the timeline chrome around them is translated | [`../src/features/changelog/entries.ts`](../src/features/changelog/entries.ts), issue #264 |

### Design

| Decision | Recorded in |
|---|---|
| Dark mode is **opt-in via the toggle**. There is deliberately no `prefers-color-scheme` fallback | [`DESIGN.md`](DESIGN.md) |
| The dark theme **inverts the elevation ladder** — `--surface-container-lowest` is the *top*, breaking M3 convention on purpose | [`DESIGN.md`](DESIGN.md) |
| `--live` (the "happening now" red) is theme-invariant; brand provider fills and OG images are always light | [`DESIGN.md`](DESIGN.md) |
| Raw Tailwind colour classes are banned and **linted** — this bug shipped twice | [`DESIGN.md`](DESIGN.md), `eslint-rules/no-hardcoded-color-classes.mjs` |

### Code

| Decision | Recorded in |
|---|---|
| `src/` layering is enforced by **review, not lint** — a check firing on every PR would train everyone to ignore it | [`architecture/CODE_STRUCTURE.md`](architecture/CODE_STRUCTURE.md) |
| One type crosses the data boundary (`SwingEvent`), reusing the data layer's enums rather than re-declaring them | [`architecture/CODE_STRUCTURE.md`](architecture/CODE_STRUCTURE.md) |
| `lib/date/calendar.ts` is UTC arithmetic **on strings** — no `Date` method without `UTC` in its name (#248) | [`architecture/CODE_STRUCTURE.md`](architecture/CODE_STRUCTURE.md) |
| Hydration-sensitive date formats use fixed lookup arrays, not `Intl` — ICU output differs between Node and browsers (#200). This holds for **every** language, not just English | [`AGENTS.md`](AGENTS.md) |
| Colours live in `labels.ts`, words live in `src/i18n/<locale>.ts` — one table each, both keyed by the data contract's unions so a new style can't ship without either | [`architecture/CODE_STRUCTURE.md`](architecture/CODE_STRUCTURE.md) |
| `scripts/` is plain `.mjs` with no build step; `validate-data.mjs` re-declares the enums rather than importing the TS types | [`AGENTS.md`](AGENTS.md) |

### Process

| Decision | Recorded in |
|---|---|
| The changelog is hand-curated with **no CI gate**, on purpose — "is this major?" is a judgment call | [`../CLAUDE.md`](../CLAUDE.md) |
| `robots.txt` deliberately **allows** AI crawlers; being quotable is the strategy | [`SEO.md`](SEO.md) |
| This file is not a status tracker. GitHub issues are the authority; an index here drifted badly and was removed | top of this file |

## 4. Milestones

Issues are grouped under five milestones on GitHub. **GitHub is where their
status lives**; this is only what each one means.

| | Milestone | What it covers |
|---|---|---|
| **M1** | Data correctness & card design | The product is trust. Remove anything on the page that contradicts itself, and promote the three decision-driving facts — price, beginner-friendliness, live music vs DJ — from buried prose into scannable badges. |
| **M2** | Distribution | The features that bring people in and keep them: the ICS subscription feed, per-event add-to-calendar, stable permalinks, JSON-LD for search, and link-unfurl images. |
| **M3** | UX polish | Freshness signals, neighborhood tags, designed empty states, accessibility, PWA install. None urgent; all compounding. |
| **M4** | Data platform & automation | The maintenance-cost milestone: repo-as-database, series expansion, CI validation, nightly scraper PRs, form intake. End state — the maintainer's recurring job is reviewing diffs. |
| **M5** | Community & governance | Contributor docs, the corrections path, per-venue stewards, documented ownership, and a second maintainer. What makes the project outlive one person's attention. |

## 5. What we deliberately will not build

Before building a new page, section, or surface, check this list. It is short on
purpose, and it is the cheapest thing in the repo to read.

- **User accounts, an organizer dashboard, a CMS, or any server-side state.**
  Breaks principle 2. The whole survivability argument rests on "static files
  built from CSVs."
- **A database.** `/data` is the database; git is its history and its audit log.
- **Push notifications.** The ICS feed already puts changes in people's pockets.
- **A map view.** Maps links plus neighborhood tags cover it at a fraction of
  the maintenance surface. (`lat`/`lng` exist in `venues.csv` but nothing reads
  them — see `DATA.md`.)
- **Machine translation of descriptions.** Organizers write in Swedish or
  English; both are fine, and a bad translation is worse than the original.
  Note this is about the *data*: the site's own interface **is** translated
  (English and Swedish, switchable in the header). What that means in practice
  is that a Swedish reader gets Swedish navigation, filters, dates and badges
  wrapped around event titles and descriptions in whatever language the
  organizer wrote — a deliberate mix, not a half-finished translation.
- **A prerendered Swedish copy of the site.** The language is a client-side
  preference; nothing Swedish exists at its own URL. This gives up Swedish
  search visibility on purpose — a second route tree is maintenance surface
  disproportionate to the value at this size, and dancers find the site
  through the community rather than through Google. Issue #266 holds the
  closed write-up of what reversing it would take.
- **A dedicated microsite for one event or festival.** This one is written from
  experience: the Herräng microsite was built, shipped, iterated on for days,
  and then reverted wholesale, because a single-purpose event aggregator is not
  a venue for sub-sites. If a task looks like a new top-level surface that isn't
  "list Stockholm swing events," ask before building.

Each of these either breaks a principle or adds maintenance surface
disproportionate to its value. Proposing one isn't forbidden — but argue it
against this list first, in an issue, before writing code.

## 6. Operating cadence

**Weekly, ~15 minutes.** Merge or reject the scraper and form PRs; fill in
DJ/band lineups the scrapers missed.

**Monthly.** Stewards confirm their venue's listings; check that each scraper
has produced at least one non-empty diff in the last three weeks — a silent
scraper usually means a changed selector, not a quiet venue.

**Quarterly.** Review who has access to what: domain, Vercel, the form, the repo.
