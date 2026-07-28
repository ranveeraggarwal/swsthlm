'use client';

// The EN | SV control, next to the theme toggle in the header.
//
// One button per locale rather than a single two-state switch: with a third
// language the switch has nothing sensible to do, while this grows a button
// and needs no code change. It's the same reason `LOCALES` drives everything
// else here.
//
// Each button shows that language's *own* short code, so the control reads
// "EN | SV" whichever language you're in — someone hunting for English
// shouldn't have to recognise the Swedish word for it first. The accessible
// names do follow the current locale ("Switch to Swedish" / "Byt till
// engelska"), because those are read to someone already reading this page.

import React, { useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { bundle as bundleFor, LOCALES, LOCALE_TOGGLE_ID, type Locale } from '@/i18n';

export function LanguageToggle() {
  const { locale, bundle, setLocale } = useLocale();
  const [announcement, setAnnouncement] = useState('');
  const t = bundle.language;

  const choose = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    // Switching language silently is disorienting when you can't see the page
    // change. The announcement is built from the *incoming* locale's bundle,
    // so it's spoken in the language being switched to.
    const incoming = bundleFor(next).language;
    setAnnouncement(incoming.changed.replace('{language}', incoming.names[next]));
  };

  return (
    <>
      <div
        role="group"
        aria-label={t.label}
        className="flex items-center rounded border border-[var(--outline-variant)] overflow-hidden"
      >
        {LOCALES.map((option, index) => {
          const active = option === locale;
          return (
            <button
              key={option}
              // Focus target for the one-time prompt. First button only —
              // there's one toggle rendered at a time (desktop nav or the
              // mobile menu), so the id stays unique.
              id={index === 0 ? LOCALE_TOGGLE_ID : undefined}
              type="button"
              onClick={() => choose(option)}
              aria-pressed={active}
              aria-label={t.switchTo.replace('{language}', t.names[option])}
              title={t.switchTo.replace('{language}', t.names[option])}
              className={`px-2 py-1 font-sans text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                active
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'text-[var(--on-surface-variant)] hover:text-[var(--primary)]'
              }`}
            >
              {bundleFor(option).language.code}
            </button>
          );
        })}
      </div>

      {/* Polite, so it waits for a gap rather than cutting across whatever is
          being read. Rendered always, not conditionally: a live region has to
          exist before its content changes for the change to be announced. */}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
