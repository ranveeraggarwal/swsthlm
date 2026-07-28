// The set of locales the site supports and the constants that identify them.
// One definition each — nothing else in the repo may redeclare a locale list,
// a default, or the storage key.

// The list is the source of truth and the type is derived from it, not the
// other way round. Declared as `LOCALES: Locale[]` instead, a locale added to
// the union would leave this array silently stale — `['en', 'sv']` still
// satisfies `Locale[]` when `Locale` gained a third member — and anything
// iterating it (the S6 toggle) would quietly omit the new language with no
// compile error. Derived, adding a locale is one edit here and every
// `Record<Locale, …>` in the repo fails until it's complete.
export const LOCALES = ['en', 'sv'] as const;

export type Locale = (typeof LOCALES)[number];

/** What the server always renders. The served HTML is English, so the first
 *  client render must be too — see `LocaleProvider` for why. */
export const DEFAULT_LOCALE: Locale = 'en';

/** `localStorage` key for the stored preference. Read and written by S6; S1
 *  only reserves the name so the two don't drift. */
export const LOCALE_STORAGE_KEY = 'locale';

/** DOM id of the language toggle's first button. The one-time prompt moves
 *  focus here when answered, so a keyboard user lands on the control for what
 *  they just decided rather than at the top of the document. */
export const LOCALE_TOGGLE_ID = 'language-toggle';
