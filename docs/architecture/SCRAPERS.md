# Scraper architecture

How Stockholm Swing automates event intake from public, non-Facebook sources.

> **Read first:** [`docs/DATA.md`](../DATA.md) is the data contract this system
> writes against. This document describes the machinery that proposes rows; the
> contract describes what a valid row is. Where they disagree, DATA.md wins.

## Purpose & principle

The scraper subsystem automates event intake for **public, non-Facebook
sources** via a nightly GitHub Action that opens **one** review PR. It exists to
serve the project's third non-negotiable principle:

> **Humans review diffs; robots produce them.**

Concretely:

- The scraper **never writes to `main`.** It only ever proposes a diff on a
  fixed branch (`bot/scrape`) that a human merges or closes.
- Every proposal runs through the **same** schema + integrity + vitest CI gate
  as a hand-written PR ([`.github/workflows/validate-data.yml`](../../.github/workflows/validate-data.yml)).
- The robot's job is to surface *candidates* for a human; it is deliberately
  conservative about what it writes and explicit about what it can't know.

A second, equally important goal beyond re-confirming the known weeklies:
**surface new and unknown swing bands playing tracked venues, for human
review.** A venue scraper proposes *any* act newly booked at a venue we follow;
band-aggregator sources follow specific touring swing bands across town. That
discovery is much of the system's value — not just re-checking the regulars.

## Directory layout

```
scripts/scrape.mjs                  # the runner (orchestrate → dedupe → gate → write report)
scripts/scrapers/
  sources/<venue>.mjs               # one module per source
  sources/<venue>.test.mjs          # fixture-driven parser test
  lib/genre.mjs                     # shared swing-relevance keyword filter
  lib/candidate.mjs                 # CandidateEvent shape, ONEOFF_FIELDS, titleCase, candidateToRow, formatRow
  lib/exceptions.mjs                # resolveOccurrence, computeExceptionChanges — exception-proposal helpers
  fixtures/<venue>.html             # saved source snapshot for tests
.github/workflows/scrape.yml        # nightly cron + manual dispatch
```

Everything is plain `.mjs` ESM — **no TypeScript build step.** The runner
imports `validateData` from [`scripts/validate-data.mjs`](../../scripts/validate-data.mjs)
and re-implements the tiny `weekdayOf` / `addDays` UTC helpers, matching the
precedent already in `validate-data.mjs`. This keeps the nightly job build-free:
it runs on bare Node with `npm ci` and nothing else.

## Source-module interface

The runner is **source-agnostic.** Adding a source is one module plus one
fixture test; no runner changes. Each `sources/<venue>.mjs` exports:

| Export | Type | Purpose |
|---|---|---|
| `id` | string | Stable source id (e.g. `staclara`). |
| `label` | string | Human label for the report (e.g. `S:ta Clara Bierhaus`). |
| `url` | string | The page being scraped. |
| `relevance` | `'all'` \| `'genre'` | Declared relevance policy — see below. |
| `parse(html)` | pure fn → `CandidateEvent[]` | **No network.** Drives the fixture test. |
| `scrape()` | async → `CandidateEvent[]` | `fetch(url)` + `parse()`. |

The split between `parse` (pure, fixture-tested) and `scrape` (fetch + parse) is
deliberate: the parser's logic is fully testable against a saved HTML snapshot
with no network flakiness, and the test fixture documents exactly what the source
looked like the day the parser was written.

The `CandidateEvent` shape and the mapping to a `oneoffs.csv` row live in
[`scripts/scrapers/lib/candidate.mjs`](../../scripts/scrapers/lib/candidate.mjs)
(`CandidateEvent` typedef, `ONEOFF_FIELDS`, `titleCase`, `candidateToRow`,
`formatRow`), so every source emits identically-shaped rows.

## Relevance policy (a per-source decision)

Relevance filtering is **not global.** It is a property each source *declares*,
and the runner *enforces* — **parsers only extract, the runner judges.**

- **`relevance: 'all'`** — a **swing-dedicated venue.** Chicago (a swing-dance
  studio), Årstaliden's Lindy night, a swing band's own gig list. Every event is
  a dance night, so keep all of them; no filter is applied.
- **`relevance: 'genre'`** — a **mixed venue.** S:ta Clara Bierhaus, a
  jazz/blues pub. The runner applies the shared genre filter
  ([`lib/genre.mjs`](../../scripts/scrapers/lib/genre.mjs)) to drop non-dance
  programming (pub quizzes, open jams, rock/folk gigs).
- **Undeclared defaults to `'genre'`** — safer to drop than to flood the
  calendar with non-dance.

The runner reports how many candidates a mixed venue dropped, e.g.:

```
S:ta Clara Bierhaus: 8 event(s) (15 filtered as non-dance)
```

## Genre filter (`lib/genre.mjs`)

Two tunable lowercase keyword lists:

- **`INCLUDE`** — `jazz, swing, lindy, balboa, shag, blues, django, manouche,
  gypsy, bop, hardbop, blue note, dixieland, big band, boogie, hot club,
  charleston`.
- **`EXCLUDE`** — `quiz, quizz, jam, open mic, karaoke, rock, folk, psych, pop,
  reggae, funk, soul, country, metal, punk, hip hop, techno, house, disco`.

A candidate is relevant **iff** its `"<name> <description>"` text matches an
`INCLUDE` keyword **and no** `EXCLUDE` keyword. **`EXCLUDE` always wins.**

Matching is **word-boundary, not substring.** Boundaries use Latin-letter
lookarounds (`(?<![a-zà-ÿ])…(?![a-zà-ÿ])`), *not* `\b`, so accented Swedish band
names don't create spurious word edges.

Why word boundaries matter here: substring matching silently drops legitimate
events — `jam` inside "Jamboree", `pop` inside "Popcorn Jazz" — and because the
review PR shows **only additions**, such false-`EXCLUDE`s are *invisible* to the
reviewer. Word boundaries favour visible false-*includes* (a human culls those in
review) over silent misses. The filter is **intentionally coarse**: the
human-reviewed PR is the backstop, and the keyword lists are easy to tune.

## Runner responsibilities (`scripts/scrape.mjs`)

In order:

1. **Load the four CSVs** with PapaParse (`venues`, `series`, `exceptions`,
   `oneoffs`).
2. **Run each source's `scrape()` in try/catch.** A thrown source — *or a source
   that returns 0 events* — is a **warning**, not a crash. (0 events feeds the
   dead-source signal: DATA.md's "no non-empty diff in 3+ weeks" lint.)
3. **Apply the per-source relevance filter** (`'all'` keeps everything;
   `'genre'` runs `isSwingRelevant`). Record how many were dropped.
4. **Drop past candidates** (`date < today`, where today is Europe/Stockholm
   today, computed with `Intl.DateTimeFormat('en-CA', { timeZone:
   'Europe/Stockholm' })`). Never propose a past-dated `live` row — the validator
   rejects them anyway.
5. **Dedup against the calendar, keyed on `(venue_id, date)`:**
   - **Existing one-offs** occupy every date in `[date, end_date || date]`.
   - **Series occurrences** are matched with a small predicate over the raw rows:
     a series occupies `(venue_id, date)` iff `venue_id` matches,
     `weekdayOf(date) === weekday`, `valid_from <= date <= (valid_to || ∞)`, and
     `status` isn't `ended` or `draft`. This deliberately **avoids `expandAll`**:
     it's a membership predicate, with **no 7-day stepping**, so there is **zero
     DST exposure** (the DST risk lives in the stepping, not the membership
     test). It mirrors `expand.ts`'s notion of coverage.
   - **Why `(venue_id, date)` and not `id`:** hand-entered rows use different id
     schemes than the scraper's deterministic `<venue>-<date>` ids. Keying on id
     alone would let a scraped row duplicate a human-entered one at the same
     venue on the same night.
6. **Classify each surviving candidate:**
   - Scraper-owned id already exists **and a field changed** → **UPDATE** (record
     the field-level `old → new`).
   - `(venue_id, date)` is covered by a **series** and at least one of `{music,
     dj, band, start, end}` differs from the resolved occurrence (series defaults
     merged with any existing exception for that date) → **EXCEPTION**. Deduped
     on `(series_id, date)`: if an exception row already exists, it is updated
     in place (changed fields only); otherwise a new row is proposed. Only
     **non-empty** candidate fields are compared — an empty field means "unknown
     to the scraper," not "should be blank," so it never proposes to blank a
     human-curated band or DJ.
   - `(venue_id, date)` covered by an existing one-off under a different id, or
     by a series with no field differences → **SKIP**.
   - Otherwise → **NEW**.
7. **Surgical text write (critical).** Append NEW rows and replace only CHANGED
   lines, **as text**, for both `oneoffs.csv` and `exceptions.csv`. Do **not**
   `Papa.parse → mutate → Papa.unparse` the whole file — that re-quotes every
   existing row and makes the nightly diff *the entire file*, defeating human
   review. Single rows are formatted with
   `Papa.unparse([row], { header: false, columns: <FIELDS> })` so a scraped
   line is byte-shaped exactly like a hand-written one. Exception rows are
   located by their composite key (`series_id,date,` prefix) for in-place
   replacement. (Verified: 4 new events produce exactly `4 insertions(+)`, zero
   churn on existing rows.)
8. **Delta validation gate.** Validate the **baseline** file and the **after**
   file with `validateData`, and **block (exit 1, write nothing) only on errors
   the scrape *introduces*** (`afterErrors − baseErrors`). Pre-existing errors are
   surfaced as **warnings, not a hard stop.** Why: a pre-existing future `live`
   row ages into a past-dated `live` row over time; if the gate validated the
   whole file and hard-failed on any error, that aged row would silently halt
   **all** intake even though the scraper never touched it. Row numbers are stable
   under append + in-place replace, so comparing the *error strings* isolates the
   delta.
9. **Write `scrape-report.md`** (used as the PR body) and the same content to
   stdout, with sections: **New / Updated (⚠ review) / Exception proposals /
   skipped / past-filtered / pre-existing data issues.** A `--dry-run` flag
   does everything except write (no `oneoffs.csv`, no `exceptions.csv`, no
   `scrape-report.md` side effects beyond the report it always emits for
   inspection).

## Data-safety rules

- **Never guess unknowable structured fields into prose.** `price`, `dj`,
  `beginner_class` and the like are left **empty** for a human to fill on review
  — never invented, never smuggled into the description. (`candidateToRow` emits
  empty strings for everything the scraper can't know.)
- **Never touch `series.csv`.** Recurring definitions stay hand-curated; the
  scraper only *reads* them to dedup and compare. The blast radius of a scrape
  is **`oneoffs.csv` and `exceptions.csv` only.**
- **Never invent a venue.** A source whose location doesn't map to an existing
  `venue_id` must **flag it** in the report ("needs a `venues.csv` row"), not
  silently create one. Adding a venue is a deliberate, separate step per DATA.md.
- **Deterministic ids** (`<venue>-<date>`) so re-runs are **idempotent** — the
  same event scraped twice maps to the same row, which is also what makes the
  UPDATE-vs-NEW classification work.

## Field mapping (source → `oneoffs` row)

| `oneoffs` column | Source of value |
|---|---|
| `date` | From the source. |
| `start`, `end` | Source times, converted to Europe/Stockholm `HH:MM` (DST-correct). |
| `style` | Defaults to `all` (or a keyword override). |
| `music` | From the source (`live` for band nights). |
| `band` | The act, for live nights. |
| `organizer` | The venue (or the band, for band-aggregator sources). |
| `description` | **Short genre/flavour only** — no dates, times, prices, or addresses. |
| `status` | `live`. |
| `price`, `payment`, `dj`, `beginner_class`, `end_date` | Left **empty** for a human. |

## The nightly Action (`.github/workflows/scrape.yml`)

- **Triggers:** `schedule` (cron `17 2 * * *`, ~02:17 UTC nightly) +
  `workflow_dispatch` (manual run from the Actions tab).
- **Steps:** checkout → `setup-node` (Node 20, npm cache) → `npm ci` →
  `node scripts/scrape.mjs` → `peter-evans/create-pull-request@v6`.
- **create-pull-request config:** `branch: bot/scrape` (a **fixed** branch, so
  it's **one PR updated in place**, never nightly spam), `base: main`,
  `add-paths: data/oneoffs.csv`, `body-path: scrape-report.md`, `labels: data`,
  `delete-branch: false`. An idle night = no diff = no PR.
- **No secrets.** It uses the built-in `GITHUB_TOKEN` (`permissions:
  contents: write`, `pull-requests: write`). This is exactly why this subsystem
  is unblocked, unlike Google-Form sync (needs a service-account JSON) or
  Facebook (needs a logged-in session).

### Operational prerequisite (one-time setup)

> **The nightly PR creation requires a repo setting that is currently OFF.**
>
> **Settings → Actions → General → "Allow GitHub Actions to create and approve
> pull requests"** must be **ON**. Until it is enabled, the create-PR step fails
> with:
>
> ```
> GitHub Actions is not permitted to create or approve pull requests.
> ```
>
> Enable it once; no other setup is needed.

## Source inventory & decisions

Derived from the URLs already present in `series.csv` / `oneoffs.csv` and the
venue registry.

### Scrapable today (public, non-Facebook)

| Source | URL | Type → relevance | Notes |
|---|---|---|---|
| **Chicago** | `chicago75.se/evenemang` | swing-dance studio → `'all'` | Keep every event. (PR2 — see sequencing.) |
| **S:ta Clara Bierhaus** | `staclara.se/calendar.html` | jazz/blues pub → `'genre'` | Implemented first (PR1). Events live in custom `<calendar-event>` elements under a month `<h2>` header; `BAND 19-22<BR>genre` lines. |
| **Norrport** | `norrport.se/norrportlive` | venue | Live-music listings. |
| **Årstaliden** | `arstablick.com/Lindyhop.html` | Lindy night → `'all'` | Static list. |
| **Swing Magnifique (band)** | `swingmagnifique.com/gigs` | band gig list → `'all'` | **Cross-venue** band aggregator — see below. |

None of these expose a usable ICS/iCal feed, so **v1 is HTML parsing**.

### Band-aggregator sources & "new bands in town"

Some sources are **bands, not venues** (Swing Magnifique, The Bandwagon Swing
Orchestra). A single band parser fills **multiple** venues, so these are
**cross-venue** and need a small **venue-map** (gig-location string →
`venue_id`). A band source **must flag unknown venues rather than invent one.**

This is also the mechanism for surfacing **new bands appearing at our favourite
venues:**

- A **venue scraper** proposes *any* act newly booked at a tracked venue
  (Chicago, S:ta Clara, Norrport, Årstaliden…).
- **Band-aggregator sources** follow specific touring swing bands across town.

Treat "surface new/unknown swing bands playing tracked venues, for human review"
as a **first-class goal** of the system. Overlap between a band source and a
venue source (same band, same venue, same night) is handled automatically by the
`(venue_id, date)` dedup.

### SSS (Swedish Swing Society) — recorded NEGATIVE result

**Do not re-try the SSS Google Calendar.** SSS embeds a public Google Calendar
that *looks* like an ideal ICS source. It is **not usable:**

- The clean **"Socialdans (SSS)"** feed is abandoned (last event **2018-06-01**).
- The live **`ssslokal@gmail.com`** feed going forward is almost entirely classes
  and room-booking admin (`Medlemsträning`, `Balboa Open Practice`,
  `En sal uthyrd`), not public socials.

The actual public SSS socials are on **Facebook**. So **SSS is a Facebook
source** and is deferred (below).

### Facebook / Instagram sources — deferred

Facebook is openly hostile to scraping, so these are **not** part of the nightly
HTML scraper:

| Source | Platform |
|---|---|
| Sprallen | Facebook |
| Augustas | Instagram |
| Vinterviken / Tegels | Facebook |
| Scala / Lönnkrogen | Facebook |
| Nomad | Facebook / Instagram |
| SSS | Facebook |

**Future plan** (explicitly *not* nightly scraping): a Chrome extension that
grabs events from a Facebook page the maintainer is already viewing, and/or a
screenshot parser. Both are **manual-assist** paths.

### Dropped

- **Stadshuset / Danshuset** — too low-frequency to warrant a parser; enter by
  hand.

## Decisions & cadence

- **Cadence: nightly (settled).** No real downside: a PR opens only on a
  non-empty diff, so idle nights cause no churn; daily means a last-minute venue
  change is caught within 24h (a weekly cadence would miss same-week edits);
  Actions cost is negligible.
- **No `tsx`, no TS import in scripts.** The runner is plain `.mjs`, imports
  `validateData` from `validate-data.mjs`, and re-implements the tiny
  `weekdayOf` / `addDays` UTC helpers. Keeps CI build-free.
- **`cheerio` is a devDependency**, used only by scripts. **Never import it from
  `src/`** — it must not reach the client bundle.

## Known follow-ups / limitations

- **Revert churn on human-edited scraper rows.** Once a human edits a
  scraper-owned row (fixes a title, adds a price), the runner re-derives the
  source value and **re-proposes the revert every night** until the *source*
  itself changes. The eventual fix is **field-level provenance**: track which
  fields a human has touched and stop overwriting them. This should be filed as
  an issue.
- **The genre filter is coarse by design.** Tuning the `INCLUDE` / `EXCLUDE`
  keyword lists is expected, ongoing maintenance.

## Build / PR sequencing

- **PR1** (`feat/scraper-v1`, PR #55 — merged): scaffold + runner + S:ta Clara
  source.
- **PR2** (`feat/chicago-scraper`, PR #79 — merged): Chicago source
  (`relevance: 'all'`) + series-dedup test.
- **PR3** (`feat/exception-proposals`, PR #83 — merged): EXCEPTION
  classification bucket; `exceptions.csv` surgical write; DJ name extraction
  from Chicago titles; `lib/exceptions.mjs` helpers.
- **Band/aggregator source:** its own later PR — it introduces the venue-map
  concern.
