# Stockholm Swing — Project Plan

**Repo:** `ranveeraggarwal/swsthlm` · **Site:** stockholmswing.com · **Last revised:** 2026-06-15

## 1. Vision

Stockholm Swing is the single, trustworthy answer to "where can I swing dance in Stockholm this week?" It should be fast, correct, shareable, and cheap enough in maintenance effort that it survives the maintainer losing interest, travelling for a month, or handing it over entirely. Success looks like: dancers subscribe to it from their calendar app, organizers submit events themselves, Google surfaces its events directly in search, and the weekly maintenance load is "review a few pull requests on a phone."

Three principles govern every decision below:

1. **Structured data is the truth; scraped prose is decoration.** Badges, times, and prices come from our fields and are always correct. Organizer descriptions are displayed but never trusted.
2. **No servers, no accounts, no database.** The site is static files built from CSVs in this repo. Every feature must fit inside that model. This is what makes the project survivable on zero budget and near-zero attention.
3. **Humans review diffs; robots produce them.** Scrapers, form intake, and validation all run as GitHub Actions that open pull requests. A human only ever approves or rejects a diff.

## 2. Architecture decision: repo-as-database

**Decision:** Migrate the source of truth from the Google Sheet to CSV files in this repository under `/data/`. The [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSd87pOy31N_3xKthqalT-sDrFB2yoe74Z8HGr8q1HSs6Pis2g/viewform) remains the organizer-facing intake; its responses sheet becomes an inbox that an Action drains into pull requests. The site reads `/data/` at build time and is fully static; a Vercel deploy hook rebuilds on every push to `main`.

**Why:** Every planned automation (scraper PRs, CI validation, weekly health checks, diff-based review) requires a pull-request workflow, which a sheet cannot provide. Sheet edits are live instantly with no review gate, history is opaque, validation can only run after publication, and the published-CSV endpoint is coupled to one personal Google account — the worst possible bus-factor. The sheet's only real advantage, friction-free entry for non-technical people, is preserved through the form. Direct quick edits move to GitHub's web editor, which is adequate.

**Consequences:** The runtime CSV fetch and client-side PapaParse step are removed entirely. ISR becomes unnecessary for data freshness (rebuild-on-push covers it); only time-relative UI ("Happening Now", "Tomorrow") needs client-side computation after hydration, since static HTML cannot know the current time.

### Data model

Three CSVs, mirroring the existing series/exceptions/oneoffs design:

| File | Purpose | Key columns |
|---|---|---|
| `data/series.csv` | Weekly/recurring events | `id, name, style, venue_id, weekday, start, end, price, beginner_class, music (live/dj), organizer, url, description, status (draft/live/ended), valid_from, valid_to` |
| `data/exceptions.csv` | Per-date overrides for a series | `series_id, date, field, value` (e.g. `dj`, `band`, `cancelled`, `start`) |
| `data/oneoffs.csv` | Single or multi-day events | same shape as series plus explicit `date`/`end_date`; `status` is `draft/live/ended/cancelled` |
| `data/venues.csv` | Venue registry | `id, name, address, neighborhood, lat, lng, maps_url` |

A build-time expansion step turns series + exceptions into concrete occurrences for the next N weeks. `status` provides the draft/live gate; `cancelled` is a per-date exception, never a deletion, so the site can *show* the cancellation. Past one-offs are retained as `status=ended` (kept for a possible future archive), never deleted — the build renders only `live`.

## 3. Workstreams

The work is organized into five milestones. The first three transform the product; the last two transform its maintenance cost and ownership. Recommended order: **M2 → M1 → M4 → M3 → M5**, except that the repo-data migration (M4-1) should land early because M2's server rendering builds on it. Realistically: M4-1, then M2, then M1, then the rest as energy allows.

### M1 — Data correctness & card design

The aggregator's product is trust. This milestone removes everything on the current page that contradicts itself (stale "14/3" dates inside June events, duplicated Danshuset cards, "DJ: TBA" noise) and promotes the three decision-driving facts — price, beginner-friendliness, live music vs DJ — from buried prose to scannable badges. It also adds a first-class cancelled state and retires the mushy "All Swing Styles" tag.

### M2 — Distribution

The features that bring people in and keep them. An ICS subscription feed (`webcal://`) puts the calendar inside every regular's phone permanently and is the single highest-leverage feature in the plan. Per-event add-to-calendar, stable permalinks with share buttons, JSON-LD `Event` markup (Google event-search placement), and a proper OG image (Facebook/WhatsApp unfurls) complete the loop. Server-side rendering of event data is a prerequisite for the structured-data wins and removes the load spinner.

### M3 — UX polish

URL-persisted filter state (shareable "Balboa view"), a day filter, designed empty states that route people to the form and the ICS feed, an "updated X ago" freshness signal, neighborhood tags on venues, a heading-hierarchy and accessibility pass, and a PWA manifest. None of these are urgent; all of them compound.

### M4 — Data platform & automation

The maintenance-cost milestone. Migrate data into the repo (the architecture decision above), implement series expansion, add CI schema validation on every PR, convert the per-site scraping from the manual Chrome extension to nightly scheduled Actions that open PRs (extension remains only for Facebook-walled sources), add a Monday "health report" Action, and wire the Google Form responses into automatic PRs. End state: the maintainer's recurring job is reviewing diffs.

### M5 — Community & governance

CONTRIBUTING.md and a written data contract so human and agent contributors can work safely; a "Wrong info?" issue-form link on every card; per-venue stewards recruited from the scene (one regular per studio, monthly glance at their venue's listings); HANDOVER.md documenting domain, deploys, and access; migration of the repo to a GitHub org with at least two additional maintainers. This milestone is what makes the project outlive any one person's attention.

## 4. What we deliberately will not build

User accounts, an organizer dashboard, a database, machine translation of descriptions, push notifications (the ICS feed serves this need), or a map view (Maps links plus neighborhood tags cover it). Each of these would break principle 2 or add maintenance surface disproportionate to its value.

## 5. Issue index

GitHub issue numbers are authoritative. Priorities: P0 = do first, P1 = high value, P2 = when convenient. ✓ = merged/closed.

**State as of 2026-06-15:** M4 foundation complete (CSV migration, series expansion, CI validation, server-side rendering, Chrome extension retired). M1 substantially complete (price/beginner/music badges, stale-date lint, hide TBA, style rename, Just Ended badge). Nightly scraper live for S:ta Clara and Chicago, with exception-proposal logic. Google Form live (linked in §2); Form → PR sync Action (#5) still to build. ICS feed (#8) is the highest-leverage open feature.

| # | Issue | Milestone | Priority | |
|---|---|---|---|---|
| 1 | Migrate source of truth from Google Sheet to /data CSVs | M4 | P0 | ✓ |
| 2 | Series + exceptions expansion at build time | M4 | P0 | ✓ |
| 3 | CI schema validation for /data | M4 | P0 | ✓ |
| 4 | Nightly scraper Actions → PRs | M4 | P1 | open |
| 5 | Google Form → PR sync Action | M4 | P1 | open |
| 6 | Weekly health-report Action | M4 | P2 | open |
| 7 | Server-side data loading; remove runtime CSV fetch | M2 | P0 | ✓ |
| 8 | ICS subscription feed (webcal) | M2 | P0 | open |
| 9 | Per-event "Add to calendar" (.ics) | M2 | P1 | open |
| 10 | JSON-LD Event structured data | M2 | P1 | open |
| 11 | Event permalinks + share button | M2 | P1 | open |
| 12 | OG image for link unfurls | M2 | P2 | open |
| 13 | Strip/flag stale dates in scraped descriptions | M1 | P0 | ✓ |
| 14 | Collapse multi-day runs of the same event into one card | M1 | P1 | open |
| 15 | Hide TBA fields | M1 | P1 | ✓ |
| 16 | Structured price field + badge | M1 | P0 | ✓ |
| 17 | Beginner-class / beginner-friendly badge | M1 | P0 | ✓ |
| 18 | Promote live-band vs DJ to badge | M1 | P1 | ✓ |
| 19 | Cancelled event state | M1 | P1 | open |
| 20 | Rename "All Swing Styles" tag | M1 | P2 | ✓ |
| 21 | Filter state in URL | M3 | P1 | open |
| 22 | Day filter / day-jump strip | M3 | P2 | open |
| 23 | Designed empty states | M3 | P2 | open |
| 24 | "Updated X ago" freshness signal | M3 | P2 | open |
| 25 | Neighborhood tags on venues | M3 | P2 | open |
| 26 | Accessibility & heading-hierarchy pass | M3 | P1 | open |
| 27 | PWA manifest + icons | M3 | P2 | open |
| 28 | "Wrong info?" report link per card | M5 | P1 | open |
| 29 | CONTRIBUTING.md + data contract docs | M5 | P1 | ✓ |
| 30 | HANDOVER.md, org migration, second maintainer | M5 | P1 | open |
| 31 | Recruit per-venue stewards | M5 | P2 | open |
| 44 | "Just Ended" badge for events earlier today | M1 | P1 | ✓ |
| 45 | Open-source / GitHub section on About page | M5 | P2 | ✓ |
| 48 | Merge multi-day one-offs into a single card | M1 | P1 | open |
| 56 | Move Beginner Class badge position | M1 | P2 | open |
| 61 | Events visible before filter/hero section (layout fix) | M1 | P1 | ✓ |
| 66 | Field-level provenance for scraper-owned rows | M4 | P1 | open |
| 69 | Chicago scraper source | M4 | P1 | ✓ |
| 73 | Dynamic rotating H1 on homepage | M3 | P1 | ✓ |
| 74 | SEO: homepage `<title>` and `<meta description>` | M3 | P2 | ✓ |
| 82 | Scraper proposes exceptions when a series event changes | M4 | P1 | ✓ |

## 6. Operating cadence (post-M4 steady state)

Weekly, ~15 minutes: merge or reject scraper and form PRs; glance at the Monday health issue; fill in DJ/band lineups for the week if scrapers missed them. Monthly: stewards confirm their venue's listings; check that each scraper produced at least one non-empty diff in the last three weeks (the health report flags this). Quarterly: review HANDOVER.md accuracy and access lists.
