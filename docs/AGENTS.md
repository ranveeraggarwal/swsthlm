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
- **The changelog is hand-curated, not generated.** `src/lib/changelog.ts`
  feeds the About page's collapsed "What's new" timeline. When you ship a
  major, user-visible feature, add one line to the current month (create the
  month at the top if it's the first one). Everything else — data rows,
  scraper output, dependency bumps, refactors, copy tweaks — stays out; the
  git log already has those.
- **Don't break the static-site shape.** If a task seems to need a server,
  account, or database, **stop and flag it** rather than building it.

## Recurring feedback (read before you build)

Each of these shipped wrong at least once in review — several twice. They're
cheap to get right up front and expensive to catch in QA; check for them
before opening a PR, not after.

- **Accessibility is part of the component, not a follow-up pass.** Any
  interactive element that unmounts on interaction (a "Clear search" button,
  a closing modal, a collapsing filter panel) drops keyboard focus to
  `<body>` unless you explicitly restore it — this exact bug has been filed
  and fixed at least three separate times (#154, #181, and a filter-reset
  case). Keep a `ref` to the logical next focus target and call `.focus()`
  on it when the element unmounts; wrap in
  `setTimeout(() => ref.current?.focus(), 0)` if the target hasn't
  re-rendered yet. Custom accordions need `aria-controls` on the trigger
  pointing at the panel `id`, plus `aria-hidden="true"` on decorative icons
  (#203). Icon-only buttons need both `aria-label` (screen readers) and a
  matching `title` (sighted mouse users hovering). New global keyboard
  shortcuts need a visible `<kbd>` hint and must check
  `e.target instanceof HTMLElement` before intercepting, or they swallow
  keystrokes typed into any input on the page (#220). When touching
  headings, filter controls, or contrast, keep heading order strictly
  `h1 → h2 → h3` (never skip a level) and check text against WCAG AA — an
  `opacity`-dimmed "ended" card is a classic way to fail it (#179).
- **Never hardcode a color; always go through a `var(--…)` token** — see
  `docs/DESIGN.md`'s "Rules future changes must follow." `text-white` on a
  token-colored background shipped twice (`EventCard`/`EventFilters`, then
  again in `AddToCalendarButton`/`SubscribeButton`), and off-palette
  `zinc`/`amber` Tailwind classes shipped once — all three were only caught
  in a dedicated dark-mode QA pass, not code review (#193–#201). This one is
  now caught by lint: `eslint-rules/no-hardcoded-color-classes.mjs` fails
  `npm run lint` on any raw Tailwind palette class (`bg-white`,
  `text-zinc-500`, …) inside a `className`. It can only see literal/template
  string content, not values from an identifier — so a color baked into a
  variable (e.g. the brand-button color maps in `AddToCalendarButton.tsx`/
  `SubscribeButton.tsx`, which are intentionally theme-independent per
  DESIGN.md) won't be flagged, and a reviewer still needs to look there.
  Before writing a color class, ask whether it needs a different value in
  dark mode; if yes, it's a token, not a Tailwind palette class. Structural
  keylines and shadows specifically use `--border-ink` / `--shadow-ink`,
  never `--on-surface` — identical in light mode, but `--on-surface` turns
  into a glowing cream line in dark mode.
- **Dates need explicit UTC handling, twice over.** `YYYY-MM-DD` strings
  parse as UTC midnight; formatting one with `toLocaleDateString` and no
  `timeZone: 'UTC'` rolls the displayed day back by one for any viewer west
  of UTC (#160). Separately, `toLocaleDateString` with identical locale and
  options can render *different punctuation* between Node's ICU (SSR) and
  Chromium's ICU (hydration) — same input, React hydration error #418 on
  every load (#200). If a date renders in the initial HTML, either pin
  `timeZone: 'UTC'` and verify the output is byte-identical between a Node
  script and an actual browser (Playwright against a production build, not
  `next dev`), or use fixed lookup arrays instead of `Intl` (see
  `formatCompactWeekdayDate` in `src/lib/datetime.ts`).
- **Confirm scope before building a new surface.** The Herräng microsite
  (`/herrang`) was built, shipped, and iterated on for days, then reverted
  wholesale because a dedicated microsite doesn't fit a single-purpose
  event aggregator (#215–#219). If a task looks like a new page or section
  that isn't "list Stockholm swing events," check `docs/PROJECT.md` §4
  ("what we deliberately will not build") and ask before building, not
  after.
- **When a new validation rule has a judgment call about strictness, surface
  the tradeoff instead of defaulting to the strictest option.**
  Overlapping-event detection (#93) shipped as a CI *warning*, not a hard
  failure, because some venues legitimately run two things at once — that
  scope was agreed with the maintainer before implementation.
- **Don't add a process step that duplicates a gate that already exists.**
  Form submissions were briefly forced through `status=draft` before going
  live, on top of the PR-review gate they already pass through — the merge
  was already the "yes, this is real" decision, so the extra flip-to-live
  step was pure overhead with no added safety, and was removed (#210).
