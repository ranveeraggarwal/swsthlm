# Stockholm Swing 🎺

[![Validate data](https://github.com/ranveeraggarwal/swsthlm/actions/workflows/validate-data.yml/badge.svg)](https://github.com/ranveeraggarwal/swsthlm/actions/workflows/validate-data.yml)
[![License: BSL 1.1](https://img.shields.io/badge/license-BSL--1.1-blue)](../LICENSE)

> Your single, lightweight, optimized guide to Lindy Hop, Balboa, Shag, and Blues social dancing and workshops in Stockholm.

[**stockholmswing.com**](https://stockholmswing.com) is a static site built from CSV files in this repository. No database, no accounts, no server beyond the build on Vercel — that shape is deliberate, and it's what lets the project survive on volunteer attention.

## What it does

- **The calendar.** Every swing event in Stockholm in one place, filterable by style, venue, live-music-only, and free-text search.
- **Subscribe from your calendar app.** `webcal://stockholmswing.com/calendar.ics` — the feed updates itself, so new events and cancellations arrive without anyone doing anything.
- **Shareable event pages.** Every occurrence has a stable permalink, an add-to-calendar button, and a link-preview image.
- **Corrections from anyone.** A flag button on every listing opens a short form and mails it to the maintainers with the listing's current details attached.
- **Installable.** PWA manifest and icons, so it can live on a phone home screen.

## How events get in

Nobody hand-edits a spreadsheet. Three paths all end at the same place — **a pull request a human reviews**:

| Path | What it does |
|---|---|
| **Nightly scrapers** | A scheduled Action parses public venue pages and opens one PR with proposed events. See [`architecture/SCRAPERS.md`](architecture/SCRAPERS.md). |
| **Organizer form** | Submissions to the [intake form](https://docs.google.com/forms/d/e/1FAIpQLSd87pOy31N_3xKthqalT-sDrFB2yoe74Z8HGr8q1HSs6Pis2g/viewform) are polled every two hours and turned into PRs. See [`architecture/FORM_SYNC.md`](architecture/FORM_SYNC.md). |
| **By hand** | Facebook-only sources and anything the parsers can't reach. |

Nothing writes to `main` directly, and every proposal passes the same schema check a hand-written PR does.

## Tech

Next.js 15 (App Router) · React 19 · Tailwind 4 · PapaParse · deployed on Vercel.

## Running it locally

Node 20+ and npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

The dev server reads `/data/*.csv` directly — edit a CSV, save, the page reloads. There's no separate data build step.

```bash
npm test               # unit tests
npm run lint           # eslint, including the project's own colour-token rule
npx tsc --noEmit       # typecheck
npm run validate:data  # schema + integrity check over /data
```

CI runs the schema check, the tests, and lint on every PR.

## Docs

| Read this | When |
|---|---|
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Before your first PR. Also: how to report a wrong listing without touching code. |
| [`DATA.md`](DATA.md) | Before editing anything in `/data`. The column-by-column contract. |
| [`architecture/CODE_STRUCTURE.md`](architecture/CODE_STRUCTURE.md) | Before adding a file to `src/`. Where things go, and why. |
| [`DESIGN.md`](DESIGN.md) | Before touching styles. Colour tokens, typography, the dark theme. |
| [`PROJECT.md`](PROJECT.md) | Why the project is shaped this way, and the list of things we've decided not to build. |
| [`SEO.md`](SEO.md) | Search and AI discoverability, on-site and off. |

## Community

Built by and for the Stockholm swing community, not affiliated with any studio. Contributions, corrections, and bug reports are all welcome — [`CONTRIBUTING.md`](CONTRIBUTING.md) has the five-minute paths in.
