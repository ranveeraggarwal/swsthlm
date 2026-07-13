# CLAUDE.md

Context for Claude Code working on **Stockholm Swing** (stockholmswing.com), a swing dance event aggregator for Stockholm. This file is the entry point; the authoritative detail lives in the docs linked below. Read the relevant doc before acting on anything it governs.

**Stack:** Next.js 15 (App Router), React 19, Tailwind 4, deployed on Vercel. Static site built from CSV files — no database, no accounts, no server beyond the Vercel build.

## The docs (read before touching what they govern)

- `docs/PROJECT.md` — roadmap, architecture decisions, issue backlog with priorities, "won't build" list, operating cadence. **The maintained source of truth for project state and sequencing.**
- `docs/DATA.md` — **the data contract.** Full schema for the five CSVs, enums, validation rules, worked examples. Read before editing `/data/` or code that consumes it.
- `docs/DESIGN.md` — **the design system.** Color tokens, typography, spacing, component guidelines. Read before touching styles or UI components.
- `docs/AGENTS.md` — agent-specific guidance: build pipeline, CI gates, gotchas, conventions, and a "recurring feedback" section of concrete bugs (focus management, color tokens, UTC/hydration date handling, scope creep) that have shipped wrong before. Read that section before touching UI, dates, or colors — it's the fastest way to skip a round of review. **You read this too.**
- `docs/architecture/SCRAPERS.md` — the intake-automation subsystem. Read before touching `scripts/scrapers/` or `scripts/scrape.mjs`.
- `docs/architecture/FORM_SYNC.md` — the Google Form intake subsystem. Read before touching `scripts/form-sync.mjs` or `.github/workflows/form-sync.yml`.
- `docs/SEO.md` — search & AI discoverability: on-site pieces (sitemap, robots, JSON-LD, canonicals, llms.txt) and the off-site maintainer checklist.
- `docs/CONTRIBUTING.md` — contributor-facing rules, PR conventions, branch naming.
- `HANDOVER.md` — operational ownership (domain, Vercel, secrets). Mostly TODO placeholders.

If anything in this file conflicts with `docs/DATA.md` or `docs/PROJECT.md`, those win.

## Non-negotiable principles

1. **Structured data is the truth; scraped/pasted prose is decoration.** If a fact has a column, it goes in the column, never in a description.
2. **No servers, no accounts, no database.** Every feature fits inside "static site built from CSVs." If a task seems to need otherwise, stop and flag it.
3. **Humans review diffs; robots produce them.** Scrapers and form intake open PRs. Nothing edits data in place.

## Known user-visible bugs (verify against live site first — caching lies)

None currently tracked. (Previously: #48 Danshuset duplicate cards — fixed; #87 card clickability — fixed.)
