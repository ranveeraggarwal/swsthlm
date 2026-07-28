// The set of locales the site supports and the constants that identify them.
// One definition each — nothing else in the repo may redeclare a locale list,
// a default, or the storage key.

export type Locale = 'en' | 'sv';

export const LOCALES: Locale[] = ['en', 'sv'];

/** What the server always renders. The served HTML is English, so the first
 *  client render must be too — see `LocaleProvider` for why. */
export const DEFAULT_LOCALE: Locale = 'en';

/** `localStorage` key for the stored preference. Read and written by S6; S1
 *  only reserves the name so the two don't drift. */
export const LOCALE_STORAGE_KEY = 'locale';
