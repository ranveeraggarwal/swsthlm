<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent orientation — Stockholm Swing

You are working on **Stockholm Swing** (stockholmswing.com), a swing-dance event
aggregator for Stockholm. Start with [`CLAUDE.md`](../CLAUDE.md) for the project
overview and doc map; this file covers the technical detail agents need day-to-day.

For project state, sequencing, and the "won't build" list see
[`docs/PROJECT.md`](PROJECT.md). For the data schema see
[`docs/DATA.md`](DATA.md). For the design system (colors, typography, spacing,
components) see [`docs/DESIGN.md`](DESIGN.md). For PR conventions and branch
naming see [`docs/CONTRIBUTING.md`](CONTRIBUTING.md). For the scraper subsystem
see [`docs/architecture/SCRAPERS.md`](architecture/SCRAPERS.md).

## The build pipeline (`expandAll`)

`src/lib/data/expand.ts` (`expandAll`) **expands `series` + `exceptions`** into
concrete occurrences for the next ~10 weeks, then **merges with `oneoffs`.**
The site, the ICS feed, and JSON-LD all consume this output.

- The expansion handles **DST** (Europe/Stockholm). Never hardcode an offset.
- Only `status=live` rows render. `draft` and `ended` are excluded; `cancelled`
  is *shown* struck-through, never deleted.

The dev server (`npm run dev`) reads `/data/*.csv` directly — edit a CSV, save,
the page reloads. There is no separate data build step locally.

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

## Gotchas

- **Scripts are plain `.mjs` ESM** — no TypeScript build step. Don't introduce
  `tsx` or a TS import into `scripts/`; re-implement small helpers as
  `validate-data.mjs` already does.
- **`cheerio` is a devDependency**, used **only** by scripts. **Never import it
  from `src/`** — it must not reach the client bundle.
- **The scraper's blast radius is `oneoffs.csv` only.** It reads `series.csv` to
  dedup but never writes it, and never invents venues — see SCRAPERS.md.
- **Don't break the static-site shape.** If a task seems to need a server,
  account, or database, **stop and flag it** rather than building it.
