// Which of the languages we ship does this visitor actually want?
//
// Pure and browser-free on purpose: this is the one piece of the language
// feature with real branching, and the repo has no component tests, so a
// function taking `navigator.languages` as an argument is the difference
// between "covered" and "hope".
//
// It never switches anything by itself. The answer feeds a prompt that asks
// (see `LanguagePrompt`), because a static site can't vary its response and a
// wrong *guess* would make every visitor who prefers the default watch the
// page flip on every load. A wrong *question* costs one "no thanks".

import { DEFAULT_LOCALE, LOCALES, type Locale } from './locale';

/** `sv-SE` → `sv`, `EN-gb` → `en`. Empty or malformed tags yield ''. */
function primarySubtag(tag: string): string {
  return tag.trim().toLowerCase().split('-')[0] ?? '';
}

/**
 * The locale to offer, or `null` for "say nothing".
 *
 * Walks the visitor's languages **in preference order** and takes the first
 * one we ship. Order is the whole point: `['en-GB', 'sv-SE']` means someone
 * who reads both and prefers English, and they should never see a prompt —
 * matching "is Swedish in the list anywhere" would pester them.
 *
 * Returns `null` when the best match is what they're already reading, so the
 * caller doesn't have to special-case it.
 */
export function offerableLocale(
  languages: readonly string[],
  current: Locale = DEFAULT_LOCALE,
): Locale | null {
  for (const tag of languages) {
    const primary = primarySubtag(tag);
    if (!primary) continue;

    const supported = LOCALES.find((locale) => locale === primary);
    if (!supported) continue;

    // First supported hit wins, even when it's the current locale: reaching
    // `en` first means English is preferred, and the answer is "say nothing"
    // rather than "keep looking for something to offer".
    return supported === current ? null : supported;
  }

  return null;
}

/** `navigator.languages` where available, falling back to the single
 *  `navigator.language`. Split out so the component stays free of `window`
 *  guards and the logic above stays testable. */
export function browserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    return navigator.languages;
  }
  return navigator.language ? [navigator.language] : [];
}
