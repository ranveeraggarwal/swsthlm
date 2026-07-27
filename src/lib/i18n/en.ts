// The chrome dictionary — UI copy translated between English and Swedish.
// Nested by surface so each namespace stays easy to scan rather than one flat
// 80-key object. `sv.ts` must satisfy this shape exactly (see its header
// comment) — a missing Swedish key is a compile error, the same trick
// `features/events/model/labels.ts` uses with `Record<Style, StylePresentation>`.
//
// S1 (#260) seeds only the per-route metadata every mirrored page needs to
// exist. `nav`, `home`, `filters`, `card`, `empty`, and `about` land as their
// surfaces get translated (#262–#264).
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
} as const;

export type Dictionary = typeof en;
