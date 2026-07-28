// The chrome dictionary — UI copy translated between English and Swedish.
// Nested by surface so each namespace stays easy to scan rather than one flat
// 80-key object. `sv.ts` must satisfy this shape exactly (see its header
// comment) — a missing Swedish key is a compile error, the same trick
// `features/events/model/labels.ts` uses with `Record<Style, StylePresentation>`.
//
// S1 (#260) seeds only the per-route metadata every mirrored page needs to
// exist. `nav`, `home`, `filters`, `card`, `empty`, and `about` land as their
// surfaces get translated (#262–#264).
//
// The `meta` namespace is what search engines read, so the Swedish side is
// translated for *search intent* rather than word-for-word (#266): Swedes
// google "socialdans", "swingdans" and "lindy hop stockholm", so those are the
// strings that have to appear, not a literal rendering of the English.
export const en = {
  meta: {
    site: {
      /** Root-layout fallback description. Every route overrides it, so this
       *  only surfaces if one ever forgets to — but a Swedish tree falling
       *  back to English copy is precisely the bug #266 is about. */
      description: 'Lindy Hop, Balboa, Shag, and Blues social dancing in Stockholm.',
    },
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
    event: {
      /** Joins the date and the venue in a permalink's title: "… — Wed, Jun 3
       *  at Chicago". The rest of that title and its description come from the
       *  CSV row, which stays in the organizer's own language (PROJECT.md §5). */
      venuePreposition: 'at',
    },
  },
} as const;

/**
 * The *shape* of a dictionary: same keys, same nesting, but any string at the
 * leaves.
 *
 * The widening matters. `en` is `as const`, so `typeof en` types every leaf as
 * its own literal — `'at'`, not `string`. `sv satisfies typeof en` therefore
 * demanded the Swedish values be *character-identical to the English ones*,
 * which compiled only for as long as `sv.ts` was the verbatim placeholder copy
 * S1 shipped; the first real translation failed to build (#266). Mapping the
 * leaves to `string` keeps what the check was for — a missing, misspelled or
 * wrongly-nested key is still a compile error, because a mapped type requires
 * every key and `satisfies` rejects extras — while allowing the translations
 * to differ, which is the entire point of having them.
 */
export type Dictionary = Translated<typeof en>;

type Translated<T> = {
  [K in keyof T]: T[K] extends string ? string : Translated<T[K]>;
};
