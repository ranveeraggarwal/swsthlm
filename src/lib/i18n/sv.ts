// Swedish chrome copy. `satisfies Dictionary` means a key missing here (or
// misspelled, or wrongly nested) fails `tsc` — deleting a key to test this is
// part of #260's acceptance criteria.
//
// S1 (#260) mirrors the English values verbatim on purpose: `/sv` needs to
// prerender and round-trip correctly before a single Swedish word ships.
// Nothing links to `/sv` yet (that's #265), so it's safe to merge
// half-translated. #262–#264 replace these with real translations as each
// surface is tackled.
import type { Dictionary } from './en';

export const sv = {
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
} satisfies Dictionary;
