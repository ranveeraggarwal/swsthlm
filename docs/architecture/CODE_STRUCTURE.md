# Code structure

How `src/` is organised, and the rules that keep it that way. Read this before
adding a file — "where does this go?" should take ten seconds, not a discussion.

There is **no lint rule enforcing any of this**. That is a deliberate choice: the
boundaries here are judgment calls, and a check that fired on every PR would
train everyone to ignore it. It's enforced by review, which means this document
has to be short enough to actually be read.

Which is a claim about length, so here is what keeps it honest: **a rule lives
here only as long as it takes to state; the story that justifies it lives in the
file it governs.** Rule 4 below states the split and why the typing matters — the
account of the four diverging copies, and which drift was deliberate, sits in the
header of `features/events/model/labels.ts`, where someone about to edit that
table actually meets it. Rule 4 is also the longest entry here, which makes it
the ceiling rather than the target: if a rule needs more room than that to
defend itself, the defence belongs in the code and this file should link to it.

## The tree

```
src/
  app/                      Next.js routes. Thin: wiring, metadata, layout.
    page.tsx                  homepage
    about/                    about page
    event/[id]/[date]/        permalink + its OG image
    calendar.ics/             the ICS subscription feed
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx
    layout.tsx globals.css

  features/                 One folder per thing the site does.
    events/                   the calendar — 90% of the app
      loader.ts                 SERVER ONLY. /data → SwingEvent[]
      ics.ts jsonld.ts          output formats
      model/                    pure logic, no JSX
        event.ts                  the SwingEvent type + id/URL helpers
        labels.ts                 every value → English or colour mapping
        grouping.ts               multi-night runs → one card
        sections.ts               filtering, faceting, week/month bucketing
        temporal.ts               "happening now / tonight / ended"
      components/               the UI
        EventCalendar.tsx         the homepage listing (stateful; the only one)
        FilterPanel.tsx EmptyState.tsx EventSections.tsx
        EventCard.tsx EventRow.tsx
        EventFacts.tsx EventChips.tsx FloorTypeBadge.tsx TemporalBadgeDisplay.tsx
        AddToCalendarButton.tsx ShareButton.tsx SubscribeButton.tsx
    corrections/              "Wrong info?" dialog + the mailto it builds
    changelog/               "What's new" timeline + its entries

  components/               Shared across features. Nothing domain-specific.
    layout/                   Header, Footer, ThemeToggle, InstallToast,
                              FreshnessSignal, HomeHero, SkipToContentLink
    providers/                LocaleProvider — cross-cutting client context
    ui/                       Modal, IconButton, GitHubIcon, CalendarProviderMarks

  i18n/                     Every translatable word, one file per language.
    locale.ts                 LOCALES, the Locale type derived from it, DEFAULT_LOCALE
    bundle.ts                 LocaleBundle — the contract
    en.ts  sv.ts              nothing but words
    template.ts               splitting a sentence around a placeholder

  lib/                      Domain-agnostic. Would work on any site.
    site.ts                   URLs, emails, feed paths — one definition each
    date/                     clock.ts (impure), calendar.ts, format.ts
    data/                     csv.ts (SERVER ONLY), expand.ts, types.ts
```

`i18n/` sits beside `lib/` at the bottom of the dependency order: everything
imports it, it imports nothing (bar the data contract's enums, to key its word
tables). It isn't a feature, and it carries dance vocabulary, so it isn't
domain-agnostic enough to be `lib/`.

## The rules

**1. Dependencies point one way: `app` → `features` → `components` → `lib`.**

Never the reverse. A file in `lib/` that imports from `features/` is the signal
that it isn't really a library. Sideways imports between features are allowed but
worth a second look — `corrections` importing the `SwingEvent` type is fine;
`corrections` importing a chip component is a smell.

**2. Routes are thin.** `app/` reads data, sets metadata, and renders a
component. If a route file grows logic worth testing, that logic belongs in a
feature's `model/`.

**3. `model/` has no JSX, `components/` has no business rules.**

This is the split that pays for itself. "Why is this event in the Coming Up
section?" is answered by reading `sections.ts` — forty lines of pure functions
with the reference date passed in — not by scrolling a component looking for a
`useMemo`. Every function in `model/` takes its inputs explicitly, including
"now", which is also what makes them testable and what keeps SSR and hydration in
agreement.

**4. Colours live in `labels.ts`, words live in the locale bundle — exactly one
table of each.**

No component owns a `switch (style)`. This existed four times over before, and
the copies had diverged: the same style read "Social – all styles" on a card and
"All styles" in the list below it. If a value needs different wording on
different surfaces, add a named variant rather than a local mapping.

The split is by *kind*, not by convenience. `features/events/model/labels.ts`
holds `chipClass` and the accessors (`styleLabel`, `floorTypeLabel`, …) —
structure and colour. `src/i18n/<locale>.ts` holds what those accessors return —
words. A translator should open one file, not four; before this split they'd have
had to edit `labels.ts`, `format.ts`, `sections.ts` and the dictionary, one of
them interleaved with Tailwind classes.

Both tables stay keyed by the data contract's own unions (`Record<Style, …>`), so
a style added to `lib/data/types.ts` is a compile error until it has a colour
*and* a word in every locale. That exhaustiveness is the point of this rule; it
depends on how the tables are typed, not where they live.

**5. Constants that name the outside world live in `lib/site.ts`.** The
production URL, the submission form, the GitHub repo, the contact addresses.
`const SITE_URL = 'https://stockholmswing.com'` was copy-pasted into six files;
a domain change should be a one-line diff.

**6. The server/client boundary is `loader.ts` and `lib/data/csv.ts`.**

Those two are the only files that touch `node:fs` or PapaParse. Importing either
from a `'use client'` component fails the build — that's the enforcement, and it's
a build error rather than a friendly message, so keep the I/O in those files.
Everything downstream consumes `SwingEvent[]` and never sees a CSV.

**7. One type crosses the data boundary: `SwingEvent`.**

`lib/data/types.ts` describes the CSV rows and the expanded `Occurrence`.
`features/events/model/event.ts` defines `SwingEvent` — an `Occurrence` with its
venue joined — and that is what the homepage, permalinks, ICS feed and JSON-LD all
render. It reuses the data layer's enums (`Style`, `Music`, `FloorType`) rather
than re-declaring them, so a value outside the data contract is a type error
instead of a blank badge.

Presentation shapes derived from it (`EventGroup`, a card that may cover several
consecutive nights) live beside it and are named for what they are.

**8b. Locale: pass it in, exactly like the reference date.**

Swedish is a client-side preference, not a second build — there is no `/sv` and
nothing localized exists at its own URL (see PROJECT.md for why). The current
locale lives in `LocaleProvider`, and a component reads it with `useLocale()`.

**Nothing in `model/` calls that hook.** Pure functions take `locale` as their
last argument, defaulting to `DEFAULT_LOCALE`, for the same reason they take
`now`: a function that reaches for ambient state isn't testable without a React
tree. The component reads the locale and passes it down.

The consequence to know before adding a component: **anything that renders a word
has to be a client component**, because the locale only exists on the client.
That's why `EventFacts`, `EventChips`, `FloorTypeBadge` and `TemporalBadgeDisplay`
carry `'use client'` themselves — the permalink route is a server component and
renders them directly, so they can't inherit it from a client parent. Data
loading is unaffected: rule 6 still holds, `loader.ts` still runs at build, and
`SwingEvent[]` still arrives as props.

**8. Dates: pass the reference date in, never read a clock in a pure function.**

`lib/date/clock.ts` is the only impure module. Everything else takes a
`YYYY-MM-DD` string. Static HTML can't know the current time, so pages seed the
first render with the build-time reading and the client takes over after
hydration; a component that read the clock during render would mismatch.

Everything in `lib/date/calendar.ts` is UTC-midnight arithmetic **on strings** —
no `Date` method without `UTC` in its name, and no reference to the runtime's
local timezone. If you add a function there, build it on `addDays` and keep it
string-in/string-out. This is not stylistic: the week predicates used to read
UTC-midnight dates back with local-time methods, which shifted the weekday by a
day for viewers west of Greenwich and silently suppressed the Sunday "Coming Up"
promotion (#248, fixed). `calendar.test.ts` pins the behaviour under five host
timezones.

## Where does my change go?

| I'm changing… | Go to |
|---|---|
| any word a visitor reads | `src/i18n/en.ts` **and** `src/i18n/sv.ts` |
| adding a language | one entry in `LOCALES`, one new bundle file — nothing else |
| what a badge or chip says | `src/i18n/<locale>.ts`; its colour is `labels.ts` |
| which section an event lands in | `features/events/model/sections.ts` |
| when a card says "Happening Now" | `features/events/model/temporal.ts` |
| how multi-night events merge | `features/events/model/grouping.ts` |
| a card's or row's markup | `features/events/components/` |
| the ICS feed or JSON-LD output | `features/events/ics.ts` / `jsonld.ts` |
| a new CSV column | `lib/data/types.ts` → `csv.ts` → `loader.ts`, then the UI |
| a date format | `lib/date/format.ts` |
| the production URL or a contact address | `lib/site.ts` |
| a modal's behaviour (focus, Escape, scroll lock) | `components/ui/Modal.tsx` — once, for all three |
