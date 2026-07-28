// The contract: every string a human translates lives on this type, in
// exactly one place. `en.ts` and `sv.ts` each `satisfies LocaleBundle`, so a
// key that's missing or misspelled in either file is a compile error — the
// same enforcement `features/events/model/labels.ts` gets from
// `Record<Style, StylePresentation>`, no lint rule or script involved.
//
// S1 defines chrome only: the header nav and the skip-to-content link, enough
// to prove the machinery end to end. Later sub-issues grow this type as they
// wire more surfaces:
//   - S2 adds a `dates` block — weekday/month name arrays and format
//     templates, so `lib/date/format.ts` can stop being English-only.
//   - S3 adds `Record<Style, …>`, `Record<Music, …>`, `Record<FloorType, …>`
//     word tables, mirroring `features/events/model/labels.ts`.
// Neither slot is stubbed in below. An empty object or placeholder string
// would have to be filled with something to satisfy the type today, and that
// something would be fake — worse than the slot not existing yet.

export interface LocaleBundle {
  /** The header: the two primary links plus the mobile menu toggle's label
   *  (used as both `aria-label` and the hover `title`, per Header.tsx). */
  nav: {
    calendar: string;
    about: string;
    openMenu: string;
    closeMenu: string;
  };
  /** Strings for assistive tech that aren't part of the visible chrome above. */
  a11y: {
    skipToContent: string;
  };
}
