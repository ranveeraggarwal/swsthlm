# CLAUDE.md

Context for Claude Code working on **Stockholm Swing** (stockholmswing.com), a swing dance event aggregator for Stockholm. This file is the orientation; the authoritative detail lives in the docs linked below. Read those before acting on anything they cover.

## What this is

A single trustworthy answer to "where can I swing dance in Stockholm this week?" — Lindy Hop, Balboa, Blues, Shag. Built and maintained by the community, designed to survive on near-zero maintainer effort and to be handed off if needed. The whole product is a static site built from CSV files in this repo. No database, no accounts, no server beyond the Vercel build.

**Stack:** Next.js 15 (App Router), React 19, Tailwind 4, deployed on Vercel.

## The docs (read before touching what they govern)

- `docs/PROJECT.md` — roadmap, architecture decisions, the 31-issue backlog, the "won't build" list, operating cadence.
- `docs/DATA.md` — **the data contract.** Full schema for the five CSVs, enums, validation rules, worked examples. Read this before editing anything under `/data/` or writing code that consumes it.
- `docs/architecture/SCRAPERS.md` — **the intake-automation subsystem.** Read before touching anything under `scripts/scrapers/` or `scripts/scrape.mjs`.
- `CONTRIBUTING.md` — contributor-facing rules, PR conventions, branch naming.
- `HANDOVER.md` — operational ownership (domain, Vercel, secrets). Mostly TODO placeholders.
- `AGENTS.md` — agent-specific guidance (you read this too).

If anything in this file conflicts with `docs/DATA.md` or `docs/PROJECT.md`, those win — they're the maintained source of truth; this file is orientation.

## Non-negotiable principles

1. **Structured data is the truth; scraped/pasted prose is decoration.** If a fact has a column, it goes in the column, never in a description. Times, prices, dates, venues, DJ/band are always structured.
2. **No servers, no accounts, no database.** Every feature fits inside "static site built from CSVs." If a task seems to need otherwise, stop and flag it rather than building it.
3. **Humans review diffs; robots produce them.** Scrapers and form intake open PRs. Nothing edits data in place.

## Current state

**Migration complete.** Source of truth is `/data/*.csv` in this repo (Google Sheet retired). Site reads `/data` at build time; Vercel deploys on push to `main`. Runtime PapaParse is gone. Series + exceptions expand at build time.

Five CSV files (full schema in `docs/DATA.md`): `data/venues.csv`, `data/series.csv` (recurring weeklies), `data/exceptions.csv` (per-date overrides), `data/oneoffs.csv` (single/multi-day events), `data/bands.csv` (trusted band registry for scraper classification). A build step expands series + exceptions into concrete occurrences and merges with oneoffs; that's what the site, the ICS feed, and JSON-LD consume.

**Scraper subsystem live.** A nightly GitHub Action (`scripts/scrape.mjs`) opens two review PRs: `bot/scrape` (event proposals → `oneoffs.csv`) and `bot/new-bands` (unknown acts for vetting → `bands.csv`). Currently scraping S:ta Clara and Chicago. See `docs/architecture/SCRAPERS.md`.

## Known user-visible bugs (verify against live site first — caching lies)

- Danshuset renders twice as two identical ~400-word cards (should be one card, Fri+Sat). Tracked as `#48`.
- Event cards only clickable via the "Expand" text, not the full card surface. Tracked as `#87`.

## Sequencing

The 31 issues are in `docs/PROJECT.md` §5 with priorities.

**Foundation (done):** `#1` CSV migration, `#2` series expansion, `#7` server-side loading, `#3` CI validation gate, plus the M1 badge cluster (`#16` price, `#17` beginner, `#18` live music, `#15` hide TBA, `#20` style rename, `#13` stale-date lint, `#44` just-ended badge) — all merged. Scraper subsystem (`#4` partial): S:ta Clara + Chicago live (`#69` ✓), exception proposals (`#82` ✓).

**Current focus:** remaining M1 items — multi-day oneoff dedupe (`#48`), cancelled event state (`#19`), clickable cards bug (`#87`). Also scraper provenance (`#66`, M4).

**ICS feed (`#8`) deprioritised to P2** — important eventually, not next.

**Can't be done in-repo (need human + secrets/accounts):** form-sync Action (`#5`, needs Google service-account JSON + form ownership), community/governance (`#29`–`#31`).

## Working agreement

- **Small PRs, one concern each.** Branch names `kind/short-desc` (`feat/ics-feed`, `fix/danshuset-dedupe`, `data/chicago-fall-lineup`). PR titles present-tense, no ticket prefix. Link issues with `Closes #N`.
- **Acceptance criteria are the definition of done.** Each issue body has why/scope/acceptance — treat acceptance as the test to satisfy.
- **All times Europe/Stockholm.** The build handles DST; never hardcode offsets. Watch the DST boundary in series expansion and ICS generation — write tests for it.
- **IDs are immutable once in production.** Renaming a series/venue/oneoff ID breaks ICS subscriptions, permalinks, and JSON-LD UIDs. Never rename; only add.
- **Cancellations are exceptions, not deletions** — the site must *show* the cancellation (struck-through + badge, ICS `STATUS:CANCELLED`, JSON-LD `EventCancelled`).
- **When the data model is ambiguous, stop and ask** rather than inventing a column or workaround — schema drift is expensive forever.
- After data changes, sanity-check the dev server renders what you expect (`npm run dev` reads `/data` directly).

## What we deliberately will NOT build

User accounts, an organizer dashboard, a database, machine translation of descriptions, push notifications (the ICS feed serves that), or a map view (Google Maps links + neighborhood tags cover it). If a task drifts toward any of these, flag it instead of building it.
