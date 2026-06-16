# Contributing to Stockholm Swing

Stockholm Swing is built and maintained by the local swing community. Whether you organize events, dance at them, or write code — there's a way to help that takes five minutes or less.

## The fastest paths

**You organize a dance and want it listed.** Fill in the [organizer form](https://docs.google.com/forms/d/e/1FAIpQLSd87pOy31N_3xKthqalT-sDrFB2yoe74Z8HGr8q1HSs6Pis2g/viewform). A bot turns submissions into pull requests; a maintainer reviews and merges. You don't need a GitHub account. The same form is also how you tell us about a new series, a cancellation, or a venue change.

**You spotted wrong info.** Every event card has a "Wrong info?" link that opens a prefilled report. If you can't find it, [open an issue](https://github.com/ranveeraggarwal/swsthlm/issues/new/choose) with the event name, date, and what's off. Things we get wrong most often: stale DJ names, price changes, weeks where a regular series doesn't run.

**You want to help with code, design, or data.** Read on.

## What this project is, and isn't

Stockholm Swing is a static website built from CSV files in this repository. There is no database, no user accounts, and no server beyond the build pipeline on Vercel. The Google Form is an intake channel, not a backend; submissions land as PRs, just like a developer's would. This shape is deliberate — it's what lets the site run for years on volunteer attention. Please don't propose features that break it (accounts, dashboards, server-side state, a CMS). If you're not sure whether something fits, open a discussion before a PR.

## How decisions get made

Two principles, in order:

1. **Structured data is the truth; scraped or pasted prose is decoration.** When in doubt, add a field rather than parse a sentence.
2. **Humans review diffs; robots produce them.** Scrapers and form intake open pull requests. Maintainers merge them. Nothing edits the data in place.

A maintainer can merge most PRs solo. Anything that changes the data schema, the deploy pipeline, or the project's scope needs a second maintainer's review. See [`docs/PROJECT.md`](docs/PROJECT.md) for the longer rationale and roadmap.

## Setting up locally

You need Node 20+ and `npm`.

```
git clone https://github.com/ranveeraggarwal/swsthlm.git
cd swsthlm
npm install
npm run dev
```

The dev server reads from `/data/*.csv` directly. Edit a CSV, save, and the page reloads. There's no separate build step for data.

## Repository layout

```
data/           # source of truth — series.csv, exceptions.csv, oneoffs.csv, venues.csv
src/            # Next.js app (App Router)
public/         # static assets, manifest, OG images
scrapers/
  chromeext/    # Chrome extension, used only for Facebook-walled events
  actions/      # scheduled scrapers that open PRs (chicago75, norrport, sss…)
docs/
  PROJECT.md    # roadmap, architecture decisions, "we won't build" list
  DATA.md       # the data contract — read this before editing CSVs
HANDOVER.md     # who owns what (domain, Vercel, form). For maintainers.
```

## Working with data

Most contributions touch `/data/`, not `/src/`. A few rules:

- **Use the right file.** Recurring events go in `series.csv`. Per-date overrides for a series (a one-week cancellation, a different DJ this Thursday) go in `exceptions.csv`. Genuine single-occurrence events go in `oneoffs.csv`. Adding a venue means a new row in `venues.csv`, not a free-text address on the event.
- **Don't paste dates into descriptions.** The structured date is the date. If a description contains "Lördag 14/3", strip it; the renderer will format the date itself.
- **Cancellations are exceptions, not deletions.** Add a row to `exceptions.csv` with the cancelled flag — the site shows the cancellation, the calendar feed emits `STATUS:CANCELLED`, subscribers find out. Deleting the row hides the cancellation from everyone who needed to see it.
- **Drafts are fine.** Set `status=draft` to commit data you're not ready to publish; it won't render on the site or in feeds.
- **Past events are kept, not deleted.** When a one-off is over, set `status=ended` instead of removing the row — we retain it for a possible future archive. The build renders only `live`, so it drops off the calendar while the history survives. (Leaving a past event as `live` fails CI.)
- **TBA is fine, but only when it's really TBA.** The renderer hides TBA dj/band fields. Don't put "TBA" in price, time, or venue.

The full column-by-column contract lives in [`docs/DATA.md`](docs/DATA.md). CI validates every PR against that schema and will leave a comment if something doesn't fit.

## Pull request conventions

Small PRs over large ones. A PR should answer one of: "fix this data error," "add this event/series/venue," "implement this issue," "improve this one thing." If you find yourself bundling, split it.

- Branch name: `data/chicago-fall-lineup`, `fix/danshuset-dedupe`, `feat/ics-feed` — kind/short-description.
- PR title: present tense, no ticket prefix. "Add Augustas Wednesday series" not "Updated CSVs".
- Link the issue with `Closes #N` if there is one.
- For data-only PRs, no description is needed beyond "what changed and why."
- For code PRs, include before/after screenshots when anything visible changes.
- Stockholm time (Europe/Stockholm) in all event times. The build handles DST; you don't.

A GitHub Action runs on every PR that touches `/data`: a **required** schema + integrity check (a malformed row blocks merge, with a readable message saying which row and why) plus the validator's unit tests. A separate **advisory** URL-reachability check won't block — sometimes a HEAD request fails because Facebook is being Facebook. For code changes, run `npm run lint`, `npx tsc --noEmit`, and `npm test` before opening the PR.

## Issues and labels

We use a small, opinionated label set:

- **area:data, area:ux, area:distribution, area:infra, area:community** — what the work touches.
- **priority:p0** (do first), **p1** (high value), **p2** (when convenient). Priorities are guidance, not contracts.
- **good first issue** — small, well-scoped, no architecture knowledge needed. Start here.

Milestones group issues by workstream (M1–M5 in the project plan). If you want to know what's likely to land next, look at the M1/M2 milestones.

Before opening a new issue, check the [project plan](docs/PROJECT.md) — it lists the things we've deliberately chosen not to build, and the architecture constraints. Saves everyone time.

## Becoming a venue steward

A venue steward is one regular per studio (Chicago, SSS, Sprallen, Norrport, Augustas…) who glances at their venue's listings on the site once a month and reports anything off via the form or an issue. It takes about five minutes a month and is the single most valuable non-technical contribution to the project — scrapers can't catch what only a regular notices.

If you're interested, mention it in an issue or email `swing@walagran.com`. We'll add you to the About page (with your permission) and send the one-page steward guide.

## Becoming a maintainer

After a few merged PRs and a sense that you'd enjoy the responsibility, an existing maintainer can propose you for the team. Maintainers can merge PRs, manage labels and milestones, and have access to the deploy pipeline. The bus-factor goal is at least two active maintainers at all times; see `HANDOVER.md` for what comes with the role.

## Community standards

Be kind. This is a small scene, and the project exists to serve it. Disagree on technical decisions all you like; do it with the assumption that the other person is also trying to make the calendar better. Don't use the project to settle disputes between studios — we list everyone fairly, regardless of which school anyone learned from.

Behavior that targets people for who they are, rather than what they're proposing, isn't welcome. Maintainers will remove comments and, if needed, block accounts. There's no formal CoC document yet because the project is small enough not to need one; if you'd like to write one, that's a welcome PR.

## Questions

Open a [discussion](https://github.com/ranveeraggarwal/swsthlm/discussions) for anything that isn't a bug or a concrete proposal. Email `swing@walagran.com` for anything you'd rather not put in public.

Thanks for helping keep Stockholm dancing.
