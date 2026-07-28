// The lookup the rest of the app uses instead of importing `en`/`sv` directly
// — one place that maps a `Locale` to its `LocaleBundle`, so adding a locale
// means adding one entry here rather than hunting down every import site.

import type { Locale } from './locale';
import type { LocaleBundle } from './bundle';
import { en } from './en';
import { sv } from './sv';

const BUNDLES: Record<Locale, LocaleBundle> = { en, sv };

export function bundle(locale: Locale): LocaleBundle {
  return BUNDLES[locale];
}

export type { Locale, LocaleBundle };
export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  LOCALE_TOGGLE_ID,
  LOCALE_PENDING_ATTR,
} from './locale';
