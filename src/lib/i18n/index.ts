import { en } from './en';
import { sv } from './sv';
import type { Locale } from './locale';

export type { Locale } from './locale';
export { DEFAULT_LOCALE, LOCALES, localePath, stripLocale } from './locale';

const dictionaries = { en, sv } as const;

/**
 * Chrome copy for a locale. Deliberately synchronous — `en`/`sv` are static
 * imports, so server components can call this directly inside
 * `generateMetadata` without an `await`.
 */
export function dictionary(locale: Locale) {
  return dictionaries[locale];
}
