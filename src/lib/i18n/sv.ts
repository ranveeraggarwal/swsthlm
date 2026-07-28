// Swedish chrome copy. `satisfies Dictionary` means a key missing here (or
// misspelled, or wrongly nested) fails `tsc` — deleting a key to test this is
// part of #260's acceptance criteria.
//
// S1 (#260) mirrored the English values verbatim so `/sv` could prerender and
// round-trip before a single Swedish word shipped. S7 (#266) replaces the
// `meta` namespace with real Swedish, because metadata is the one surface that
// has to be right *before* anyone links to `/sv`: it's what Google indexes,
// and the point of prerendering the tree at all is the dancer searching
// "lindy hop stockholm ikväll" or "socialdans stockholm".
//
// These are translated for search intent, not calqued. "Swing dancing" is
// *swingdans*, a social is a *socialdans*, and workshops are *kurser* — those
// are the words people type. A literal translation of the English titles would
// rank for nothing. The remaining namespaces land with #262–#264.
import type { Dictionary } from './en';

export const sv = {
  meta: {
    site: {
      description: 'Socialdans i lindy hop, balboa, shag och blues i Stockholm.',
    },
    home: {
      title: 'Swingdans i Stockholm | Kalender för lindy hop och socialdans',
      description:
        'Hela Stockholms swingdanskalender på ett ställe. Hitta socialdanser, livemusik och kurser i lindy hop, balboa, shag och blues – ikväll och veckorna framåt.',
    },
    about: {
      title: 'Om sidan | Stockholm Swing',
      description:
        'En samlad kalender för alla socialdanser, kurser och jams i lindy hop, balboa, blues och shag i Stockholm – oavsett vem som arrangerar.',
    },
    event: {
      venuePreposition: 'på',
    },
  },
} satisfies Dictionary;
