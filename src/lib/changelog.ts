// The site's public changelog: one entry per month, newest first.
//
// This is a *curated* list of major, user-visible feature work — the things a
// returning dancer would notice. It is deliberately not a commit log: data
// additions, scraper runs, dependency bumps, copy tweaks, and internal
// refactors don't belong here. A rough bar: if you couldn't explain the change
// to someone standing on the dance floor, leave it out.
//
// Maintaining it is a manual step. When a major feature merges, add a line to
// the current month's entry (creating the month if it's the first one), keeping
// `CHANGELOG` sorted newest-month-first.

export interface ChangelogItem {
  /** Short, user-facing name for the change. Sentence case, no trailing period. */
  title: string;
  /** One sentence on what it means for someone using the site. */
  description: string;
}

export interface ChangelogEntry {
  /** "YYYY-MM" — the month the work reached the live site. */
  month: string;
  /** The month's theme in a few words, shown next to the date. */
  summary: string;
  /** Major changes that shipped that month, roughly most-significant first. */
  items: ChangelogItem[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    month: '2026-07',
    summary: 'Dark mode, organizer intake, and a big polish pass',
    items: [
      {
        title: 'Dark mode',
        description:
          'A sun/moon toggle in the header switches the whole site to a warm after-midnight palette, and remembers the choice on your next visit.',
      },
      {
        title: 'Organizers can submit their own events',
        description:
          'Submissions from the event form now become pull requests automatically, so a maintainer only has to review and merge them.',
      },
      {
        title: 'Report wrong information',
        description:
          'Every listing has a flag button that opens a short correction form and sends us the event details along with your answer.',
      },
      {
        title: 'Redesigned event cards',
        description:
          'Cards now show the facts that decide your evening — time, venue, price, live band or DJ — without a tap, with the organizer description tucked into an expander.',
      },
      {
        title: 'Dancefloor types on venues',
        description:
          'Venues say whether you are dancing in a studio, a hall, a bar, or outdoors, so you know what shoes to bring.',
      },
      {
        title: 'Easier to find, easier to use',
        description:
          'A sitemap, canonical links, and structured metadata help search engines surface events, while a keyboard shortcut for search, better focus handling, and a proper heading order make the site friendlier to navigate.',
      },
    ],
  },
  {
    month: '2026-06',
    summary: 'The site launches and the schedule becomes self-maintaining',
    items: [
      {
        title: 'Stockholm Swing launches',
        description:
          'One page listing every Lindy Hop, Balboa, Blues, and Shag social, workshop, and jam in the city, filterable by style, day, and live music.',
      },
      {
        title: 'Calendar subscription',
        description:
          'Subscribe once and the whole schedule appears in your calendar app, or download a single event with "Add to calendar".',
      },
      {
        title: 'Shareable event links',
        description:
          'Every event has its own page with a share button, and links unfurl with a branded preview card in chats and social feeds.',
      },
      {
        title: 'Cards that answer the real questions',
        description:
          'Price, beginner class, live band versus DJ, and cancellations moved out of organizer prose and onto the card itself.',
      },
      {
        title: 'Listings update themselves overnight',
        description:
          'Nightly checks of venue pages propose new and changed events for review, so the schedule stays current without anyone retyping it.',
      },
      {
        title: 'Add the site to your home screen',
        description:
          'Stockholm Swing installs like an app on phones, opening straight to this week without a browser bar.',
      },
    ],
  },
];
