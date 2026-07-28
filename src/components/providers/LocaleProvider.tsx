'use client';

// The client-side home of the current `Locale`, plus the `useLocale()` hook
// that reads it. This is the piece S6's toggle will call `setLocale` through;
// S1 only builds the shape.
//
// The initial state is `DEFAULT_LOCALE`, always — on the server, and on the
// client's first render, before any effect has run. The served HTML is
// English, so a first client render in Swedish would be a hydration mismatch
// on every text node the bundle touches. S6 reads the stored preference and
// calls `setLocale` from an effect, after mount; nothing here reads
// `localStorage` during render, on purpose.
//
// This is the same shape as `useLiveStockholmClock` in
// `features/events/components/EventCalendar.tsx`: static HTML can't know a
// value that only exists on the client (the visitor's clock, their stored
// language), so the first render seeds a safe default and an effect hands
// off to the real one after hydration.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { bundle, DEFAULT_LOCALE, type Locale, type LocaleBundle } from '@/i18n';

interface LocaleContextValue {
  locale: Locale;
  bundle: LocaleBundle;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  // Recompute the bundle only when the locale actually changes, not on every
  // render of every consumer.
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, bundle: bundle(locale), setLocale }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** The active locale, its word bundle, and the setter the language toggle
 *  (S6) will call. Must be read from inside `LocaleProvider`. */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
