'use client';

// The client-side home of the current `Locale`, plus the `useLocale()` hook
// that reads it and the toggle's `setLocale`.
//
// The initial state is `DEFAULT_LOCALE`, always — on the server, and on the
// client's first render, before any effect has run. The served HTML is
// English, so a first client render in Swedish would be a hydration mismatch
// on every text node the bundle touches. The stored preference is read in an
// effect, after mount; nothing here reads `localStorage` during render, on
// purpose. A Swedish reader therefore sees English for one paint — that is
// the accepted cost of not prerendering a second copy of the site (see #259).
//
// This is the same shape as `useLiveStockholmClock` in
// `features/events/components/EventCalendar.tsx`: static HTML can't know a
// value that only exists on the client (the visitor's clock, their stored
// language), so the first render seeds a safe default and an effect hands
// off to the real one after hydration.
//
// There is deliberately **no `navigator.language` sniffing**. Guessing means
// every visitor with a Swedish browser watches the page flip on every load,
// including the ones who prefer English and have to undo it each time.
// Defaulting without a flash needs a server that can vary its response, which
// a static site hasn't got. One press of a visible toggle is the better deal.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { bundle, DEFAULT_LOCALE, LOCALES, LOCALE_STORAGE_KEY, type Locale, type LocaleBundle } from '@/i18n';

interface LocaleContextValue {
  locale: Locale;
  bundle: LocaleBundle;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // After mount only. A stored value that isn't a locale we ship — a stale
  // preference from a language since removed, or something else writing to the
  // key — is ignored rather than trusted into a crash.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(stored)) setLocaleState(stored);
    } catch {
      // private-mode Safari and friends: the site stays in the default
      // language, which is a worse experience than a crash but not by much.
    }
  }, []);

  // `<html lang>` is served as `en` and has to follow. Not cosmetic: a screen
  // reader pronouncing Swedish text with an English voice is genuinely hard to
  // listen to. `documentElement` is outside React's tree, so writing to it in
  // an effect is safe — the same trick the theme boot script uses.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      bundle: bundle(locale),
      setLocale: (next: Locale) => {
        setLocaleState(next);
        try {
          localStorage.setItem(LOCALE_STORAGE_KEY, next);
        } catch {
          // Choice still applies for this session, it just won't survive a reload.
        }
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** The active locale, its word bundle, and the setter the language toggle
 *  calls. Must be read from inside `LocaleProvider`. */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
