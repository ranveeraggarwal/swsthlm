<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent orientation — Stockholm Swing

You are working on **Stockholm Swing** (stockholmswing.com), a swing-dance event
aggregator for Stockholm. This file orients any agent (or human) picking up the
project. The authoritative detail lives in the docs mapped below — read the
relevant one before acting on anything it governs.

## What this is

A single trustworthy answer to "where can I swing dance in Stockholm this week?"
— Lindy Hop, Balboa, Blues, Shag. Community-built and maintained, designed to
survive on **near-zero maintainer effort** and to be handed off if needed.

The whole product is a **static site built from CSV files** in this repo. **No
database, no accounts, no server** beyond the Vercel build. The maintainer's
steady-state job is "review a few pull requests on a phone."

**Stack:** Next.js 15 (App Router), React 19, Tailwind 4, deployed on Vercel.
(See the Next.js note at the top of this file — this is a newer Next.js than your
training data assumes.)

## The docs map (read before touching what they govern)

| Doc | What it governs |
|---|---|
| [`docs/PROJECT.md`](PROJECT.md) | Roadmap, the repo-as-database architecture decision, the milestones (M1–M5), the 31-issue backlog with priorities, "won't build" list, operating cadence. |
| [`docs/DATA.md`](DATA.md) | **The data contract.** Full schema for the five CSVs, enums, validation rules, worked examples. **Read this before editing anything under `/data/` or writing code that consumes it.** |
| [`docs/CONTRIBUTING.md`](CONTRIBUTING.md) | Contributor-facing rules, PR conventions, branch naming, local setup. |
| [`docs/architecture/SCRAPERS.md`](architecture/SCRAPERS.md) | **The intake-automation subsystem.** The nightly scraper: source-module interface, relevance policy, dedup, the surgical-write + delta-validation design, source inventory, and decisions. Read this before touching anything under `scripts/scrapers/` or `scripts/scrape.mjs`. |
| `HANDOVER.md` | Operational ownership (domain, Vercel, secrets). Mostly TODO placeholders today. |
| [`CLAUDE.md`](../CLAUDE.md) | Orientation for Claude Code specifically; overlaps this file. If it conflicts with DATA.md / PROJECT.md, **those win.** |

## The data model

The source of truth is **four CSV files under `/data/`** (full schema in
DATA.md):

| File | Purpose |
|---|---|
| `data/venues.csv` | Venue registry — one row per physical location. |
| `data/series.csv` | Recurring weekly events (P-Tzz-Dah, Chicago Wednesdays, Zinken's…). |
| `data/exceptions.csv` | Per-date overrides for a series (different DJ, a cancellation, a time change). |
| `data/oneoffs.csv` | Genuine single- or multi-day events. |
| `data/bands.csv` | Band registry — trust status (`swing=yes/no/unknown`) used by the scraper to classify acts. |

### Structured data is truth; prose is decoration

The project's first principle: **if a fact has a column, it goes in the column —
never in a description.** Times, prices, dates, venue addresses, DJ/band are
*always* structured. Descriptions are flavour, displayed but never trusted. When
the data model can't express something, **stop and ask** — don't invent a column
or smuggle the fact into prose. Schema drift is expensive forever.

## The build pipeline (`expandAll`)

The site, the ICS feed, and the JSON-LD all consume the output of a single
build-time expansion step:

- `src/lib/data/expand.ts` (`expandAll`) **expands `series` + `exceptions`** into
  concrete occurrences for the next ~10 weeks, then **merges with `oneoffs`.**
- The expansion handles **DST** (Europe/Stockholm). Never hardcode an offset.
- Only `status=live` rows render. `draft` and `ended` are excluded; `cancelled`
  is *shown* struck-through, never deleted.

The dev server (`npm run dev`) reads `/data/*.csv` directly — edit a CSV, save,
the page reloads. There is no separate data build step locally.

## Current project state

- **Migration foundation merged:** source of truth moved from a Google Sheet to
  `/data` CSVs; server-side data loading (runtime PapaParse removed from the
  client); series + exceptions expansion; multi-day dedupe.
- **Badges landed:** price, beginner, music (live vs DJ), and a "just-ended"
  badge. The event card was redesigned to **collapse to a summary** with an
  expandable details section.
- **Scraper subsystem live:** PR #55 introduced the runner + S:ta Clara source
  (genre mode). PR #65 added the band-trust roster mode and flipped S:ta Clara
  to `relevance:'roster'`. The nightly Action now opens **two** review PRs:
  `bot/scrape` (event proposals → `oneoffs.csv`) and `bot/new-bands` (unknown
  acts for human vetting → `bands.csv`). See SCRAPERS.md for the full design.

## Conventions

- **Small PRs, one concern each.** Branch names `kind/short-desc`:
  `feat/ics-feed`, `fix/danshuset-dedupe`, `data/chicago-fall-lineup`,
  `docs/scraper-architecture`.
- **PR titles** present-tense, no ticket prefix. Link issues with `Closes #N`.
- **Commit footer:** end commit bodies with
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **PR-body footer:** end PR bodies with
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- **IDs are immutable once in production.** Renaming a series/venue/oneoff id
  breaks ICS subscriptions, permalinks, and JSON-LD UIDs. **Only add; never
  rename.**
- **All times Europe/Stockholm.** The build handles DST — **never hardcode
  offsets.** Watch the DST boundary in series expansion and ICS generation; write
  tests for it.
- **Cancellations are exceptions, not deletions.** The site must *show* the
  cancellation (struck-through + badge; ICS `STATUS:CANCELLED`; JSON-LD
  `EventCancelled`). Deleting a row hides the cancellation from everyone who
  needed to see it.
- **When the data model is ambiguous, stop and ask** rather than inventing a
  column or a workaround.
- After data changes, sanity-check that the dev server renders what you expect.

## CI gates

On **every PR**, [`.github/workflows/validate-data.yml`](../.github/workflows/validate-data.yml) runs:

- **`npm run validate:data`** — schema + integrity check on `/data`.
- **`npm test`** — the vitest suite.

A separate **URL-check job is advisory only** and never blocks (Facebook /
Instagram URLs fail HEAD constantly).

[`scripts/validate-data.mjs`](../scripts/validate-data.mjs) is the **validation
authority.** It deliberately does **not** import the TypeScript types — it
re-declares the enums — so it runs on bare Node with **no build step**. Keep it
that way.

A common trap: **a `live` one-off entirely in the past fails CI.** Once an event
is over, mark it `status=ended` (kept for the archive), don't delete it and don't
leave it `live`.

## Gotchas for agents

- **Scripts are plain `.mjs` ESM** — no TypeScript build step. Don't introduce
  `tsx` or a TS import into `scripts/`; re-implement small helpers as
  `validate-data.mjs` already does.
- **`cheerio` is a devDependency**, used **only** by scripts. **Never import it
  from `src/`** — it must not reach the client bundle.
- **The scraper's blast radius is `oneoffs.csv` only.** It reads `series.csv` to
  dedup but never writes it, and never invents venues — see SCRAPERS.md.
- **There is a long-pending uncommitted `.gitignore` line** adding `CLAUDE.md`.
  Keep it out of unrelated PRs — don't sweep it into a commit it doesn't belong
  in.
- **Don't break the static-site shape.** If a task seems to need a server,
  account, or database, **stop and flag it** rather than building it. The
  deliberately-not-built list (accounts, organizer dashboard, database, machine
  translation, push notifications, map view) is in PROJECT.md / CLAUDE.md.

## The intake-automation subsystem

Event intake from public, non-Facebook sources is automated by a **nightly
GitHub Action that opens two review PRs** — robots produce diffs, humans merge
them:

- **`bot/scrape`** — event proposals staged to `data/oneoffs.csv`.
- **`bot/new-bands`** — acts not in `data/bands.csv` (or flagged `swing=unknown`)
  surfaced for human vetting; merging adds them to the band registry.

The full design (source interface, per-source relevance policy — `'all'`,
`'roster'`, `'genre'` — the band-trust matcher, dedup against series + one-offs,
the surgical-write and delta-validation gate, source inventory, and deferred
Facebook path) lives in
**[`docs/architecture/SCRAPERS.md`](architecture/SCRAPERS.md)**. Read it before
touching `scripts/scrape.mjs` or anything under `scripts/scrapers/`.
