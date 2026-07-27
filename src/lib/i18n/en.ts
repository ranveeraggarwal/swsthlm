// The chrome dictionary — UI copy translated between English and Swedish.
// Nested by surface so each namespace stays easy to scan rather than one flat
// 80-key object. `sv.ts` must satisfy this shape exactly (see its header
// comment) — a missing Swedish key is a compile error, the same trick
// `features/events/model/labels.ts` uses with `Record<Style, StylePresentation>`.
//
// S1 (#260) seeded the per-route metadata every mirrored page needs to exist.
// S5 (#264) adds `common`, `about`, `changelog` and `contributors`. `nav`,
// `home`, `filters`, `card` and `empty` land with #262–#263.
//
// **Sentence fragments around inline links carry their own spacing and
// punctuation.** Where a paragraph wraps an `<a>` mid-sentence it is split into
// `…Lead` / link label / `…Tail` pieces, and the JSX between them is bare —
// no `{' '}` separators. English needs `" or "` where Swedish needs `", så "`,
// so whitespace and commas have to belong to the language, not the markup.
// Trailing and leading spaces in the strings below are load-bearing.
export const en = {
  meta: {
    home: {
      title: 'Stockholm Swing Dance Calendar | Lindy Hop, Balboa & Blues Events',
      description:
        'The complete guide to swing dancing in Stockholm. Find upcoming Lindy Hop, Balboa, Shag, and Blues socials, live music, and workshops across the city.',
    },
    about: {
      title: 'About | Stockholm Swing',
      description:
        'One place for every Lindy Hop, Balboa, Blues, and Shag social, workshop, and jam in Stockholm.',
    },
  },

  common: {
    /** Screen-reader suffix on every link that opens a new tab. */
    opensInNewTab: '(opens in a new tab)',
  },

  about: {
    /** The brand itself is a proper noun and stays untranslated in both. */
    titleLead: 'About ',
    tagline: 'One place for every social, workshop, and jam in Stockholm.',

    organizer: {
      heading: 'Are you an organizer?',
      introLead:
        'If you host a one-time or occasional Lindy Hop, Balboa, Blues, or Shag event in Stockholm, fill in our ',
      formLink: 'event submission form',
      introMid: ' or ',
      emailLink: 'send us an email',
      introTail:
        ". A bot turns form submissions into pull requests; a maintainer reviews and merges. You don't need a GitHub account.",
      seriesLead: 'Running a recurring weekly series? ',
      seriesLink: 'Contact us directly',
      seriesTail: " and we'll get it set up.",
    },

    corrections: {
      heading: 'Spotted something wrong?',
      bodyLead:
        "Prices change, DJs swap, and some weeks a regular series simply doesn't run. Every event has a ",
      flagButton: 'flag button',
      bodyTail:
        " that opens a short correction form — what's wrong, what it should say, and how you know. Sending it hands us an email with the listing's current details already attached, so we can find the row and fix it.",
      emailLead: 'You can also write to us directly at ',
      emailTail: '.',
    },

    mission: {
      heading: 'Our Mission',
      body: 'Stockholm Swing was born out of a desire to unite the local swing dance scene under one clear, lightweight, and easy-to-use platform. Instead of searching through fragmented social media feeds, different studio pages, and email newsletters, we aggregate everything in one central schedule.',
    },

    community: {
      heading: 'Community First',
      body: 'This project is built and maintained by members of the community for the community. We are not affiliated with any single dance studio or organization, meaning we showcase events, socials, tea dances, and workshops from all organizers across Stockholm fairly and transparently.',
      link: 'GitHub Community',
    },

    open: {
      heading: 'Built in the Open',
      body: "The entire site, its data, and the tools that maintain it live in a public GitHub repository. If you'd like to fix a listing, add a feature, or just see how it works, the code is right there. Contributions are welcome.",
      link: 'View on GitHub',
    },
  },

  changelog: {
    heading: "What's new",
    subheading: 'Major updates to the site, month by month',
    /**
     * Shown above the timeline only when the entries aren't in the reader's
     * language. The entries themselves stay English in every locale (#264):
     * they're adjacent to the git history, and giving each one `{ en, sv }`
     * would make every future feature PR an authoring job in two languages.
     * Empty here because for an English reader there is nothing to explain.
     */
    entriesLanguageNote: '',
  },

  contributors: {
    heading: 'Contributors',
    subheading: "The people who've built and maintained this site",
    /** Composed as `${contributor.name} ${onGitHub}` for the link's label. */
    onGitHub: 'on GitHub',
  },
} as const;

/**
 * The shape every locale must provide: `en`'s exact key structure, but with
 * the leaves widened from `as const` literals back to `string`. Without the
 * widening `satisfies Dictionary` would demand that Swedish copy be *identical*
 * to English, which is how S1 got away with mirroring it verbatim. Missing,
 * misspelled and misnested keys are still compile errors.
 */
export type Dictionary = Translated<typeof en>;

type Translated<T> = { [K in keyof T]: T[K] extends string ? string : Translated<T[K]> };
