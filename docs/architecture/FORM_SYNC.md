# Form sync (issue #5)

How Stockholm Swing turns organizer-submitted Google Form responses into
review pull requests, with no maintainer involvement until the review step.

> **Read first:** [`docs/DATA.md`](../DATA.md) is the data contract this
> system writes against. Where they disagree, DATA.md wins.

## Purpose & principle

Organizers fill in the [intake form](https://docs.google.com/forms/d/e/1FAIpQLSd87pOy31N_3xKthqalT-sDrFB2yoe74Z8HGr8q1HSs6Pis2g/viewform)
(linked from the site footer, About page, and empty states); they never open
PRs. A scheduled GitHub Action polls the form's responses sheet and opens
**one** review PR (`bot/form-sync`), same shape as the nightly scraper:

> **Humans review diffs; robots produce them.**

- The Action **never writes to `main`.** It proposes a diff on a fixed branch
  that a human merges or closes.
- Every proposed row goes in as `status=live` — the same PR-review gate the
  scraper relies on (a human reads the diff and merges or closes it) is the
  only gate here too. There used to be a second `draft`-then-promote step,
  but it added a second manual edit on top of a review a human was already
  doing in the same sitting, with no real safety benefit — merging the PR
  *is* the deliberate "yes, this is real" moment.
- The same delta-validation gate as the scraper runs before every write
  ([`scripts/validate-data.mjs`](../../scripts/validate-data.mjs)).

## No service account — published-CSV instead

Issue #5's original spec called for a service account reading the Sheets API.
This implementation uses the sheet's **"Publish to web" CSV export** instead:
one-time setup in the Google Sheet UI, no JSON key, no GitHub secret holding
long-lived credentials — matching the "no secrets" shape the nightly scraper
already established. The tradeoff: the published CSV is reachable by anyone
with the URL. Two things make that acceptable here:

- The URL itself isn't discoverable — it's a long, unguessable Google-issued
  path, not a plain sheet ID.
- The **Timestamp** and **Email address** columns Google Forms adds
  automatically are never written into `oneoffs.csv` or the report body,
  even though they pass through the fetched CSV. Everything else in the
  sheet is organizer-submitted event info that's headed for the public site
  anyway.

Store the published URL as a **repository secret** (`FORM_RESPONSES_CSV_URL`),
not a plain variable, precisely because the raw feed carries that PII even
though the derived output doesn't — least-privilege for the one value that
matters.

### One-time setup

1. Open the form's responses spreadsheet → **File → Share → Publish to web**.
2. Select the responses sheet/tab (not "Entire document" if there are other
   tabs), output format **CSV**, and publish.
3. Copy the resulting URL (`https://docs.google.com/spreadsheets/d/e/<pub-id>/pub?gid=<gid>&single=true&output=csv`).
4. Add it as a repo secret: **Settings → Secrets and variables → Actions →
   New repository secret**, name `FORM_RESPONSES_CSV_URL`.

Until this is done, `.github/workflows/form-sync.yml` runs and fails fast with
a clear error rather than silently doing nothing.

## Field mapping (form question → `oneoffs` column)

| `oneoffs` column | Form question | Notes |
|---|---|---|
| `id` | derived | `slug(Event Name)-date`, deterministic — see "Idempotency" below. |
| `name` | Event Name | |
| `style` | Dance Style | Keyword-normalized to the enum; unrecognized answers default to `all` (the safe "social" fallback) with a report note, rather than failing the row. |
| `venue_id` | Venue | Matched against `venues.csv` `name`. Never invented — see below. |
| `date` | Start Date | Tolerant date parser (ISO, `D/M/Y` day-first, named-month). Unparseable → row withheld, flagged. |
| `end_date` | End Date | Same parser; optional. |
| `start` | Doors open / Start time | Tolerant time parser (24h, `H:MM AM/PM`). |
| `end` | End time | Same. |
| `price` | Price | Pass-through. |
| `payment` | Accepted Payment Methods | Pass-through. |
| `beginner_class` | Beginner Class? + Beginner class start time | A parseable start time wins; otherwise `yes`/empty from the Yes/No answer. |
| `music` | Music | Normalized to `live`/`dj`/`mixed`; if the answer doesn't parse, inferred from whichever of Band Name / DJ Name was actually filled in — never a blind guess. |
| `dj` | DJ Name | |
| `band` | Band Name | |
| `organizer` | Organizer Name | The org/collective, not the submitter. |
| `url` | Event Page / Ticket URL | |
| `description` | Event description | Whitespace-collapsed to a single line (see below). |
| `status` | — | Always `live`. |

**Never written anywhere:** `Timestamp`, `Email address`, `Your Name` (the
submitter's personal name — distinct from `Organizer Name`, the public "By"
line). No column exists for them, and they're not needed once the row is
mapped.

**Every answer is whitespace-collapsed to one line** before it's mapped
(`\s+` → single space), same as the scrapers already do for scraped text
(e.g. `staclara.mjs`). Google Forms' "paragraph" question type returns the
organizer's line breaks literally; left alone, an embedded newline survives
into a quoted multi-line CSV field, and a single new event turns into a
diff spanning dozens of added lines — hard to review, and easy to mistake
for several rows instead of one. Every other row in `oneoffs.csv` is a
single physical line; this keeps form-sync's output consistent with that.

## Data-safety rules (mirrors `docs/architecture/SCRAPERS.md`)

- **Never invent a venue.** If the `Venue` answer doesn't match an existing
  `venues.csv` row, the submission is withheld from `oneoffs.csv` and
  surfaced in the PR body under "New venues proposed" for a human to add
  first. The form's "Other" option (free-text name/address/neighborhood
  fields) is checked against `venues.csv` by name too, since the form's
  dropdown can lag behind `venues.csv` — an organizer picking "Other" may
  still be naming a venue that already exists, and that should resolve to
  the existing row rather than being flagged as new.
- **Never guess a date or time wrong.** Unparseable `Start Date`/`End Date`/
  time fields withhold the row entirely (flagged as "incomplete") rather than
  writing a value that might be transposed day/month.
- **Never auto-apply a correction.** The form's "Is this a correction to an
  existing listing?" field routes the submission to a dedicated report
  section with the organizer's free-text description of what's wrong. It is
  **not** matched against an existing row and merged automatically — free text
  is too unreliable a key to safely mutate someone else's listing. A human
  applies the fix by hand and the submission itself is never written as a row.

## Idempotency

Same trick as the scraper: the proposed `id` is deterministic
(`slug(Event Name)-date`), and each run starts from `main`'s `oneoffs.csv`,
so:

- Re-running before the previous `bot/form-sync` PR is merged reproduces the
  same rows — no separate "already processed" state to maintain.
- Once a row is merged into `main`, its `id` already exists there, so the
  next run skips that submission (`existingIds` check in
  `scripts/form-sync.mjs`).
- Two different submissions with the same event name and date would collide
  on `id` — same as a human hand-entering two events with the same slug would.
  This is rare in practice (organizer intake, not high-volume scraping) and
  surfaces as a normal duplicate-id CI failure if it happens, same backstop
  the schema validator already provides.

## Cadence

Every 2 hours (`workflow_dispatch` also available for an on-demand run).
Cheap — an idle poll produces no diff and no PR, same as the nightly scraper.

## Corrections — future work

The current correction flow is intentionally a one-way report, not a fix
pipeline: it tells a human "organizer X says event Y is wrong," and a human
edits `series.csv`/`oneoffs.csv`/`exceptions.csv` by hand. Automating the
match-and-patch step would need a stable way to reference an existing event
from the form (e.g. a dropdown of current listings) rather than free text —
left for a follow-up if correction volume grows.
