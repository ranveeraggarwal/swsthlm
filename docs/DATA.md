# Data contract

The source of truth for the calendar is four CSV files under `/data/`. The site is built from them; nothing else feeds the calendar at runtime. A fifth file, `bands.csv`, is an auxiliary registry (the swing-band trust roster the scraper reads) — it never produces calendar entries. This document is the contract: what each column means, what values are valid, and how the pieces fit together. CI validates every PR against this schema, so if you stay inside it your change will land.

Two principles before the columns:

1. **Structured fields beat prose.** If a fact has a column, it goes in the column. Don't restate it in the description. Times, prices, dates, venue names, DJ/band — these are never written in prose, ever.
2. **Cancellations are exceptions, not deletions.** People who already saw the listing need to see the cancellation. The exception flow handles that; deleting the row hides it from everyone.

## Files

| File | What's in it |
|---|---|
| `venues.csv` | The venue registry. One row per physical location. |
| `series.csv` | Recurring weekly events (P-Tzz-Dah, Chicago Wednesdays, Zinken's…). |
| `exceptions.csv` | Per-date overrides for a series — a different DJ this week, a cancelled Thursday, a one-off time change. |
| `oneoffs.csv` | Genuine single-occurrence events (Danshuset, a workshop social, a touring band's night). |
| `bands.csv` | Auxiliary: the swing-band registry / scraper trust roster. Not expanded into occurrences. |

A build step expands `series` plus `exceptions` into concrete occurrences for the next ~10 weeks, then merges with `oneoffs`. That's what the site, the ICS feed, and the JSON-LD all consume.

## Conventions

- **Times** are `HH:MM` 24-hour, Europe/Stockholm local. The build handles DST. Past midnight is fine — `end` can be less than `start` (`20:00`–`00:30`).
- **Dates** are `YYYY-MM-DD`, Stockholm local.
- **IDs** are kebab-case slugs, stable forever. `p-tzz-dah`, not `event-47`. Once an ID is in production, treat it as immutable; renaming it breaks ICS subscriptions, permalinks, and the JSON-LD UID chain.
- **Empty cells** mean "unknown" or "use the default." They never mean "no" — for booleans, write `yes`/`no` explicitly.
- **Enums** are lowercase. The CI lint will yell if you invent a new value.

## `venues.csv`

| Column | Required | Type / values | Notes |
|---|---|---|---|
| `id` | yes | slug | Stable. `chicago`, `sprallen`, `norrport`, `sss`, `augustas`, `scala`, `stadshuset`, `vinterviken`. |
| `name` | yes | string | Display name. "Chicago Swing Dance Studio". |
| `address` | yes | string | Street and number. "Hornsgatan 75". |
| `neighborhood` | yes | string | "Söder", "Vasastan", "Norrmalm", "Hammarby Sjöstad", "Skanstull", "Östermalm", "Solna". |
| `lat`, `lng` | no | float | For future map use. Skip if unknown. |
| `maps_url` | no | URL | Override the default Maps link. Usually leave empty. |

Adding a new venue is a separate PR from the event that needed it — keeps the diff focused.

## `series.csv`

The most-edited file. Most weekly entries live here.

| Column | Required | Type / values | Notes |
|---|---|---|---|
| `id` | yes | slug | `p-tzz-dah`, `chicago-live-weds`, `zinkens-rhythm-club`. |
| `name` | yes | string | Display name. |
| `style` | yes | `lindy-hop` \| `balboa` \| `blues` \| `shag` \| `all` | `all` means "social, all styles welcome." Renders as "Social – all styles," never as "All Swing Styles." |
| `venue_id` | yes | venue slug | Must exist in `venues.csv`. |
| `weekday` | yes | `monday`…`sunday` | Lowercase. |
| `start`, `end` | yes | `HH:MM` | 24h, Stockholm local. |
| `price` | yes | string | "50 kr", "100/80 kr", "Free", "By donation". Free-form but short. Empty means unknown — get it filled in. |
| `payment` | no | string | "Swish", "cash", "card", "Swish/cash". |
| `beginner_class` | no | `HH:MM` \| `yes` \| empty | A time means "beginner class starts at this time." `yes` means "beginner-friendly social, no separate class." Empty means neither. |
| `music` | yes | `live` \| `dj` \| `mixed` | `mixed` is rare — only if a single night reliably has both. |
| `dj` | no | string | Default DJ if it's always the same person. Otherwise leave empty and set per-week in `exceptions.csv`. |
| `band` | no | string | Same logic; usually empty for weeklies. |
| `organizer` | yes | string | "By" line on the card. "Sprallen", not the venue name (unless they're the same). |
| `url` | yes | URL | Ticket or info link. Must respond 200. |
| `description` | no | string | Prose blurb. See "Description hygiene" below. |
| `status` | yes | `draft` \| `live` \| `ended` | `draft` doesn't render. `ended` doesn't render and produces no future occurrences. |
| `valid_from` | yes | `YYYY-MM-DD` | First date the series runs. |
| `valid_to` | no | `YYYY-MM-DD` | Last date inclusive. Empty = open-ended. |

## `exceptions.csv`

Per-date overrides for one series occurrence. Composite key: `(series_id, date)`. Blank cells mean "use the series default."

| Column | Required | Type / values | Notes |
|---|---|---|---|
| `series_id` | yes | series slug | Must exist in `series.csv`. |
| `date` | yes | `YYYY-MM-DD` | The specific occurrence being modified. Must fall on the series' weekday. |
| `cancelled` | no | `yes` \| empty | If `yes`, the card renders struck-through with a red badge; ICS emits `STATUS:CANCELLED`; JSON-LD emits `EventCancelled`. All other override columns ignored. |
| `start`, `end` | no | `HH:MM` | Override times for this date only. |
| `dj` | no | string | Override DJ for this date. |
| `band` | no | string | Override band for this date. |
| `music` | no | enum | Override music type (e.g. usually-DJ series has a live band this once). |
| `price` | no | string | Override price (e.g. special event surcharge). |
| `note` | no | string | One-line note shown above the description ("Special guest band this week"). |
| `description` | no | string | Full description override. Use sparingly — usually `note` is enough. |

**Common cases.** Adding the DJ for next Tuesday: one row, `series_id=p-tzz-dah`, `date=2026-06-16`, `dj=Emma Lundqvist`. Cancelling Thursday's Zinken's: `series_id=zinkens-rhythm-club`, `date=2026-06-25`, `cancelled=yes`. A live band replacing the DJ once: `dj=` left blank in series, exception sets `music=live` and `band=Tommy Löbel Swing Band`.

## `oneoffs.csv`

Same shape as `series.csv` minus the recurrence columns, plus explicit dates.

| Column | Required | Type / values | Notes |
|---|---|---|---|
| `id` | yes | slug | Include the month or year for uniqueness if needed: `danshuset-2026-08`. |
| `name` | yes | string | |
| `style` | yes | enum | Same as series. |
| `venue_id` | yes | venue slug | |
| `date` | yes | `YYYY-MM-DD` | The event date. |
| `end_date` | no | `YYYY-MM-DD` | Set for multi-day continuous events (e.g. Danshuset Fri+Sat). Inclusive. Build expands to one occurrence per day, sharing one card. |
| `start`, `end` | yes | `HH:MM` | |
| `price`, `payment`, `beginner_class`, `music`, `dj`, `band`, `organizer`, `url`, `description` | as for series | | |
| `status` | yes | `draft` \| `live` \| `ended` \| `cancelled` | `cancelled` is a row-level status for one-offs (no exception to attach). `ended` is terminal: the event happened and the row is **kept for the archive**, but it never renders on the live calendar. |

For multi-day events with different content per day (e.g. a festival with separate band lineups), use one row per day with distinct IDs. The dedupe-collapse logic on the renderer only merges rows that share an ID.

**Past one-offs are retained, not deleted.** Once an event is over, set its `status` to `ended` rather than removing the row — we keep the history for a future archive view. The build excludes anything that isn't `live` from the calendar, so an `ended` row is invisible today but available later. (Leaving a past event as `live` fails CI — see the validation rules.)

## `bands.csv`

The swing-band registry. One row per band the project has an opinion about. Its job today is the **scraper trust roster**: at mixed venues (jazz/blues pubs that also host non-dance acts) the nightly scraper only auto-proposes a night if its band is trusted here. It's a `/data` file with stable ids — rather than throwaway scraper config — because it's also the seed of a future band entity (band pages, event→band links, JSON-LD performers).

| Column | Required | Type / values | Notes |
|---|---|---|---|
| `id` | yes | slug | Stable, immutable. `tommy-lobel-swing-band`. |
| `name` | yes | string | Display name. "Tommy Löbel Swing Band". |
| `aliases` | no | `\|`-separated strings | Alternate spellings the scraper should also recognise. `Tommy Löbel\|Tommy Lobel`. |
| `style` | yes | style enum | Same set as elsewhere: `lindy-hop` \| `balboa` \| `blues` \| `shag` \| `all`. |
| `swing` | yes | `yes` \| `no` \| `unknown` | The trust gate. `yes` = trusted swing band; `no` = known not-swing (scraper suppresses it); `unknown` = surfaced, awaiting a human decision. |
| `notes` | no | string | Free-form. |

**The `swing` flag is how the scraper decides.** At a mixed venue it classifies each act: `yes` → propose the event; `no` → drop silently; band absent from the file → it's new, surfaced in a separate "new bands" review PR (proposed as a row with `swing=unknown`). Set it to `yes`/`no` and merge that PR to record your decision — `no` is what stops a non-dance act being re-surfaced every night. Swing-dedicated venues (a Lindy studio) don't consult the roster at all. Full mechanics in `docs/architecture/SCRAPERS.md`.

## Description hygiene

Descriptions are flavor, not interface. Things that don't belong:

- **Dates and weekdays.** The structured `date` is the date. If a scrape brings in "Lördag 14/3", strip it. CI flags any `\d{1,2}/\d{1,2}` or weekday+date pattern in descriptions.
- **Times.** Use `start`/`end`. Don't write "kl 19:00 - 22:00" in the prose.
- **Prices.** Use `price`. Don't write "100:- vid dörren" in the prose.
- **Venue addresses.** Use `venue_id`. Don't write "Roslagsgatan 38" in the prose.

What does belong: what the night is about, who the band is (one or two sentences of bio is fine), what makes this evening distinctive, any organizer flavor. Swedish and English are both fine — leave whatever the organizer wrote in their language. The card truncates to ~200 characters by default; full text is behind "Show more."

## Validation rules (enforced by CI)

The schema check runs on every PR touching `/data/`. It fails the PR on:

- Missing required column or unknown column name
- Enum values not in the allowed set (`style`, `music`, `status`, etc.)
- Dates that don't parse, or times that don't match `HH:MM`
- A series weekday that doesn't match an exception's date
- An exception or oneoff referencing a `venue_id` or `series_id` that doesn't exist
- A `live` oneoff entirely in the past (mark it `ended` to keep it for the archive)
- A duplicate `id` within a file
- A date-like string inside a description (warning, not fail)
- A URL that doesn't respond 200 (warning, not fail — Facebook events fail constantly)

Lints that open a comment but don't fail:

- TBA in `dj` or `band` for any live event within 7 days
- Series approaching `valid_to` (within 4 weeks)
- A source whose scraper hasn't produced a non-empty diff in 3+ weeks

## Examples

**Add a new weekly series.** One row in `series.csv`:

```
id,name,style,venue_id,weekday,start,end,price,payment,beginner_class,music,dj,band,organizer,url,description,status,valid_from,valid_to
augustas-thursdays,Augustas Thursday Swing,lindy-hop,augustas,thursday,19:00,22:00,80 kr,Swish,19:00,dj,,,Augustas Folksalong,https://example.com,A relaxed Thursday social with a half-hour beginner class.,live,2026-09-01,
```

**Change the DJ for one Tuesday.** One row in `exceptions.csv`:

```
series_id,date,cancelled,start,end,dj,band,music,price,note,description
p-tzz-dah,2026-06-16,,,,Emma Lundqvist,,,,,
```

**Cancel a single Thursday.** One row:

```
zinkens-rhythm-club,2026-07-02,yes,,,,,,,Venue closed for renovation,
```

**End a series.** Edit the row in `series.csv`: set `valid_to` to the last date, and `status` to `live` until that date passes. After the date, set `status=ended`. Don't delete the row — it's referenced by historical exceptions.

**Add Danshuset (two-day one-off).** One row in `oneoffs.csv` with `date=2026-08-28`, `end_date=2026-08-29`. The build creates two occurrences sharing one card.

**Replace a venue's address.** Edit the row in `venues.csv` in place — `venue_id` references stay valid. Don't create a new venue unless it's a genuinely different location.

## What this contract does not cover

Series-of-series (a 6-week class block, a touring workshop weekend) aren't first-class yet — express them as multiple one-offs sharing an `id` prefix, or as a series with tight `valid_from`/`valid_to`. If you find yourself working around this, open an issue.
