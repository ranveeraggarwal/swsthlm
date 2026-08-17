# The member plane (Firebase)

How Stockholm Swing adds sign-in, event submission, a review queue, and
(later) social features — without touching the thing that works: a public
calendar statically built from CSVs.

> **Status: designed, not built.** This document is Phase 0 of the work; the
> phases below track what exists. **Read first:**
> [`../DATA.md`](../DATA.md) remains the authoritative contract for
> everything under `/data/`; where this document and DATA.md disagree about
> the CSVs, DATA.md wins.

## Why this exists

The project's intake today is a Google Form (clunky — issue #253), nightly
scrapers, and hand-written PRs. That excludes most of the community: an
organizer who dances every week still can't submit, review, or correct a
listing without either fighting the form or learning GitHub. Meanwhile the
"robots produce diffs, humans review them" pipeline has under-delivered —
the diffs robots produce have needed too much human repair for the review
step to be the cheap gate it was designed to be.

So the project grows a **member plane**: Firebase Auth + Firestore powering
a submission form, a role-scoped review queue, and eventually social
features. This reverses two recorded decisions (accounts and a database —
see [`../PROJECT.md`](../PROJECT.md) §2b for the decision record), and it
reverses them **in a deliberately scoped way**, which is what the rest of
this document defines.

## The boundary (the rule everything else serves)

**The public calendar never touches Firebase.** Its path is unchanged:
`/data/*.csv` → `expandAll` → static HTML, the ICS feed, and JSON-LD, all
at build time. No page a logged-out visitor sees performs a Firebase read.
If Firebase is down, misconfigured, or deleted, Thursday's schedule still
renders, the calendar feed still updates on the next data commit, and
nothing on the homepage knows anything happened.

Concretely:

- **`/data/` remains the single source of truth for events.** Firestore
  holds *submissions in flight* and *member data* — never calendar data the
  site renders. An approved submission becomes a CSV row via a commit; the
  Firestore document is thereafter history, not truth.
- **The build never reads Firestore.** Not at build time, not via ISR, not
  "just for freshness." The moment the build depends on Firebase, an outage
  can block a same-day cancellation from reaching the site.
- **Auth applies only to submitting, reviewing, and social features.**
  Viewing the calendar never requires an account, and never will.

### Considered and rejected: serving the calendar from Firestore

Once Firestore exists, "why keep the CSVs at all?" is the obvious next
question. It was asked during this design and answered no. Both versions
fail, differently:

- **Runtime reads** (pages query Firestore) put the only high-traffic
  surface on a quota with no auth gate in front of it, turn every static
  output — JSON-LD, OG images, permalinks, the ICS feed — into a dynamic
  code path, and make a Firebase outage blank the calendar live. This is
  precisely the architecture §2 exists to avoid.
- **Build-time reads** (the build pulls Firestore, output stays static)
  keep the pages static but move the dependency into the pipeline: during
  an outage the site serves stale HTML and *cannot rebuild*, so a same-day
  cancellation can't reach dancers — the one update the data contract cares
  most about. It also discards, rather than simplifies: git stops being the
  audit log of what was published, `validate-data.mjs` and the CI gate lose
  their subject, scrapers and form-sync write to a file nothing reads, and
  the "edit a CSV, save, reload" dev loop dies.

**The two stores are not duplicates.** Firestore holds *proposals in
flight* — mutable, unreviewed, member-owned. `/data` holds *what was
published* — validated, diffable, revertable history. The approval bridge
isn't a sync between two copies of one thing; it is the publish step, and
the commit it writes is simultaneously the audit record, the CI trigger,
and the deploy trigger. Rebuild-on-push already puts an approved event live
in a couple of minutes, so there is no latency argument either.

Reversing this means rewriting [`../PROJECT.md`](../PROJECT.md) §2 and §2b,
not just this section.

## The single human gate

The founding principle "humans review diffs; robots produce them" is
superseded — but only its second half. What replaces it:

> **Every change to `/data/` still lands as a commit — git remains the
> history and the audit log — but the human gate is the queue approval,
> not PR review. `scripts/validate-data.mjs` runs before every bot commit.**

An approver reading a submission in the review queue *is* the human review.
Stacking a PR review on top would repeat the mistake recorded in
[`FORM_SYNC.md`](FORM_SYNC.md) and issue #210: two manual gates where one
decision is being made. One human decision, still a diff, still validated
by the same CI contract as every hand-written change.

The scrapers and the Google Form sync keep opening PRs for now; they retire
on their own schedule once the member plane proves out (the form after
Phase 3, scrapers whenever their upkeep exceeds their value).

## Architecture

**Chosen stack: Firebase** — Firestore (multiple collections), Firebase
Auth with email-link ("magic link") sign-in, security rules + custom claims
for authorization. The alternatives considered and rejected, so nobody
re-litigates them without new facts:

- **Supabase** — better relational fit on paper, but its free tier pauses
  idle projects weekly; a project optimized for surviving inattention
  should not depend on a database that punishes it. Working around that
  meant a keep-alive cron forever.
- **Firebase SQL Connect (né Data Connect)** — real Postgres under Firebase,
  but it requires an always-billed Cloud SQL instance (~$9+/month floor)
  and a young, proprietary GraphQL layer. Wrong trade for a few hundred
  rows.
- **NoSQL-shape concerns** are real but bounded at this scale: the auth'd
  surfaces serve a few dozen people against a 50K-reads/day free quota.
  Relationships resolve as chunked `in` queries (≤30 ids per query) plus
  client-side joins — never write-time fan-out, which is the pattern that
  rots under a solo maintainer.

### Collections

| Collection | Holds | Client writes |
|---|---|---|
| `users/{uid}` | Display profile: name, optional photo. | Own doc, **display fields only** (rules constrain the update's `affectedKeys`). |
| `approvers/{uid}` | The venue scope for an approver: `venue_ids: string[]` matching `venues.csv` ids. | **None.** Admin-written only. |
| `role_grants/{id}` | Append-only audit of every role change: who changed whom, to what, when. Git covers data history; nothing else covers this. | **None.** Written server-side by the grant endpoint; readable by admins. |
| `submissions/{id}` | A proposed event (mirrors the `oneoffs.csv`/`series.csv` columns), plus `status: pending \| approved \| rejected`, submitter uid, timestamps. | Create by any member; edit own while `pending`, **never `status`**. Status transitions are approver/admin-only. |
| *(later)* `attendance`, `friends`, `contributions` | The social layer — deliberately **not designed in this document**; it gets its own design round with a privacy review before any code. | — |

### Roles

Four roles, none of them stored anywhere a client can write:

- **member** — the default for any signed-in user. Can submit and edit
  their own pending submissions.
- **approver** — has an `approvers/{uid}` doc listing the venues they
  steward. Can approve/reject submissions for those venues only. This is
  the per-venue-steward idea (issue #31) given teeth.
- **admin** — a **Firebase Auth custom claim**, settable only server-side.
  The whole review queue across every venue, plus appointing approvers and
  setting their venue scope.
- **superadmin** — a second custom claim. Grants and revokes **admin**,
  grants superadmin (succession), and performs anything destructive and
  irreversible (deleting a member account). Nothing day-to-day.

The shape to remember: **admins run the content; the superadmin runs the
people who run the content.** Admins appoint approvers; only the superadmin
appoints admins.

**Why the fourth role exists.** Not because admins are less trusted —
because almost everything an admin does is *revertable* and role changes
are not. A bad approval is a commit: `git revert` undoes it, with history.
A role grant lives in Firebase state, outside git, with no diff and no
audit trail, and a bad one can lock out everyone including the owner.
Fencing off exactly that operation is the whole point; the line is drawn
around irreversibility, not seniority.

**Superadmin is never grantable through the UI.** The claim is set only by
the bootstrap script, which requires the Firebase service-account key — so
"root" is a property of possessing the credential, not of a button someone
can click. That is the client-writable-roles rule applied one level up.

**Bus factor.** A single superadmin is a single point of failure: lose that
account and nobody can appoint an admin again. The recovery path is
possession of the Firebase console and the service-account key, which makes
it a `HANDOVER.md` concern (issue #30), not an argument for diluting the
role.

### The approval bridge

Approving a submission triggers the one server-side hop in the system: a
**Vercel route handler** that (1) verifies the caller's ID token and role
with `firebase-admin`, (2) renders the submission as a CSV row, (3) runs
the same validation logic as `scripts/validate-data.mjs` — never inventing
a venue, never guessing a date, (4) commits the row to `main` via the
GitHub API, which (5) triggers the Vercel rebuild. The commit message names
the approver. Route handlers instead of Cloud Functions keeps the project
off Firebase's paid Blaze plan entirely.

## Security model

**The trap this design exists to avoid:** authorization rules that filter
by *document ownership* do not restrict *fields*. A naïve "users may update
their own profile" rule would let any member write `role: "admin"` into
their own document — their doc, rule passes, total escalation. (The SQL
equivalent — RLS row policies without column grants — has the identical
hole. This is a property of row-scoped authorization, not of Firebase.)
Hence the two structural rules above:

1. **Roles never live in client-writable documents.** Admin and superadmin
   are custom claims; approver scope is an admin-only collection. There is
   no `role` field anywhere a client can reach, and no client path writes
   either claim — superadmin isn't even settable through an authenticated
   endpoint, only by the bootstrap script holding the service-account key.
2. **Every client-writable document's rules enumerate the writable
   fields** (via `request.resource.data.diff().affectedKeys().hasOnly(…)`),
   so adding a privileged field to a document later can't silently become
   client-writable.

The rest of the posture:

- **Rules and indexes are code.** `firestore.rules` and
  `firestore.indexes.json` live in this repo, deploy via `firebase-tools`,
  and change only by PR — the one place the member plane keeps the old
  review-the-diff discipline, because a rules bug is a data breach, not a
  typo'd DJ name.
- **Rules get emulator tests in CI** (the Firestore emulator, wired into
  the existing test job): at minimum, "member cannot write `status`,"
  "member cannot create `approvers` docs," "approver cannot approve
  outside their venues," "admin cannot grant admin or superadmin," and
  "nobody can write `role_grants`."
- **One long-lived secret:** the `firebase-admin` service-account key, held
  as a Vercel env var, used only by route handlers. It joins the quarterly
  access review ([`../PROJECT.md`](../PROJECT.md) §6) alongside the domain,
  Vercel, and the repo. `firebase-admin` must never be imported from client
  code — same class of boundary as `node:fs` in `csv.ts`, and the build
  fails the same way if violated.

## Query and caching patterns

- **"Fetch then chunk":** read the user's own list doc (friends, venues),
  then query the target collection with `where(id, 'in', chunk)` — chunks
  of ≤30, client-side merge. At this community's size that is 2–3 round
  trips, well inside free quota.
- **The review queue uses live listeners, not cache.** An approver acting
  on a stale submission is the one place staleness costs something.
- Everything else leans on the Firestore SDK's built-in persistence
  (IndexedDB) — repeat visits re-read only changed documents, and cache
  hits aren't billed. The cache is per-device; it hides latency, it is not
  a shared layer, and no query pattern may *require* it to be affordable.

## Cost

Everything runs on the **Spark (free) plan with no billing account
attached**: Firestore free quotas (50K reads / 20K writes per day, 1 GiB),
free email-link auth, no Cloud Functions. The Spark plan does not pause
idle projects. Expected steady-state usage is under 1% of every quota; if
the project ever nears a limit, that's a scale success worth paying for,
not an architecture failure.

## Dependency budget

Three packages, total:

| Package | Where | Why |
|---|---|---|
| `firebase` | client components only | Auth + Firestore SDK |
| `firebase-admin` | Vercel route handlers only | token verification, the approval bridge |
| `firebase-tools` | devDependency | rules/index deploys, the emulator for CI |

Anything beyond these — an ORM, a form library, a state manager, an
Octokit client (the bridge uses plain `fetch` against the GitHub API) —
gets proposed in an issue before it's added. That's the standing rule for
this subsystem, not a one-time note.

## Failure modes

| What breaks | What the public sees | What members see |
|---|---|---|
| Firebase outage / project deleted | **Nothing.** Calendar, ICS, permalinks all static. | Sign-in and submissions down until it recovers. |
| Vercel route handlers down | Nothing (pages are static). | Approvals queue up; nothing is lost — submissions sit in Firestore. |
| GitHub API down | Nothing. | Approval succeeds in the queue but the commit retries/fails visibly; the approver sees the error, nothing silently drops. |
| Bad rules deploy | Nothing. | Possibly locked-out writes — annoying, recoverable, and why rules changes go through PR + emulator tests. |

## Phases

Small on purpose; each lands alone and is useful alone.

0. **Docs** — this document and the amendments around it. *(You are here.)*
1. **Foundation** — Firebase project, auth config, `firestore.rules` +
   emulator tests in CI, the collections above, and a bootstrap script that
   sets the first superadmin claim from the service-account key. No UI.
   Deliverable: reviewable rules that pass the escalation tests.
2. **Submission form** — `/submit` (client component, both locales),
   writing to `submissions` with form-sync's normalization discipline:
   never invent a venue, withhold unparseable dates.
3. **Review queue + the bridge** — `/review`, venue-scoped; approval
   commits the row. The Google Form retires after this proves out.
4. **Later, each with its own design round:** series & correction
   submissions, the contribution graph, and the invite-only social layer —
   the last one only after a privacy review; "which friends are going
   where" is a different category of data from anything the site holds
   today.

## What this document does not cover

The social layer's data model (deliberately), the submission form's field
design (Phase 2's job, against DATA.md), and any change to the CSV
contract (there is none — the member plane writes rows that already fit
it).
