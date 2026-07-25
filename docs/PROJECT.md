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

## 3. Milestones

Issues are grouped under five milestones on GitHub. **GitHub is where their
status lives**; this is only what each one means.

| | Milestone | What it covers |
|---|---|---|
| **M1** | Data correctness & card design | The product is trust. Remove anything on the page that contradicts itself, and promote the three decision-driving facts — price, beginner-friendliness, live music vs DJ — from buried prose into scannable badges. |
| **M2** | Distribution | The features that bring people in and keep them: the ICS subscription feed, per-event add-to-calendar, stable permalinks, JSON-LD for search, and link-unfurl images. |
| **M3** | UX polish | Freshness signals, neighborhood tags, designed empty states, accessibility, PWA install. None urgent; all compounding. |
| **M4** | Data platform & automation | The maintenance-cost milestone: repo-as-database, series expansion, CI validation, nightly scraper PRs, form intake. End state — the maintainer's recurring job is reviewing diffs. |
| **M5** | Community & governance | Contributor docs, the corrections path, per-venue stewards, documented ownership, and a second maintainer. What makes the project outlive one person's attention. |

## 4. What we deliberately will not build

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
- **A dedicated microsite for one event or festival.** This one is written from
  experience: the Herräng microsite was built, shipped, iterated on for days,
  and then reverted wholesale, because a single-purpose event aggregator is not
  a venue for sub-sites. If a task looks like a new top-level surface that isn't
  "list Stockholm swing events," ask before building.

Each of these either breaks a principle or adds maintenance surface
disproportionate to its value. Proposing one isn't forbidden — but argue it
against this list first, in an issue, before writing code.

## 5. Operating cadence

**Weekly, ~15 minutes.** Merge or reject the scraper and form PRs; fill in
DJ/band lineups the scrapers missed.

**Monthly.** Stewards confirm their venue's listings; check that each scraper
has produced at least one non-empty diff in the last three weeks — a silent
scraper usually means a changed selector, not a quiet venue.

**Quarterly.** Review who has access to what: domain, Vercel, the form, the repo.
