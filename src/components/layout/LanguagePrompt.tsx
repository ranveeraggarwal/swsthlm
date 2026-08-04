'use client';

// Asked once: "your browser prefers Swedish — want the site in Swedish?"
//
// This is what makes the original request in #259 ("default to the system
// locale") work on a static site. We can't *default* to it: the HTML is built
// once, in English, so acting on `navigator.language` would flip the page
// after every load for everyone whose browser lists a language we ship —
// including the people who prefer English and would have to undo it each
// time. Asking has no such failure mode. A wrong question costs one "no
// thanks"; a wrong guess costs a permanent annoyance.
//
// The offer is not Swedish-specific. `offerableLocale` picks the visitor's
// most-preferred language that we ship, so adding a bundle is all it takes for
// a new language to be offered to the people who read it.

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { bundle as bundleFor, LOCALE_TOGGLE_ID, type Locale } from '@/i18n';
import { browserLanguages, offerableLocale } from '@/i18n/detect';

export function LanguagePrompt() {
  const { locale, setLocale, preferenceStatus } = useLocale();
  const [offer, setOffer] = useState<Locale | null>(null);
  const decided = useRef(false);

  // Runs after mount, never during render: the served HTML is identical for
  // everyone, so a prompt rendered on the server would be shown to all.
  //
  // It waits for `preferenceStatus` to leave `'unknown'`. The provider can
  // only read storage in its own mount effect, which lands in the same commit
  // as this one — checking a boolean here would have read "nothing stored"
  // from a check that hadn't happened, and re-asked people who had already
  // answered. The `decided` ref then makes sure this fires at most once, so
  // answering (which flips the status to `'stored'`) can't re-trigger it.
  useEffect(() => {
    if (preferenceStatus === 'unknown' || decided.current) return;
    decided.current = true;
    if (preferenceStatus === 'stored') return;
    setOffer(offerableLocale(browserLanguages(), locale));
    // `locale` is read once, at the moment the status resolves; it isn't a
    // dependency, or switching by hand would re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferenceStatus]);

  // Answering unmounts this, so focus would land on <body> — a known repeat
  // bug in this codebase. The language toggle is the right destination: it's
  // the control for the thing just decided, and it's where someone goes to
  // change their mind.
  const answer = (choice: Locale) => {
    setLocale(choice);
    setOffer(null);
    setTimeout(() => document.getElementById(LOCALE_TOGGLE_ID)?.focus(), 0);
  };

  // Escape declines. Cheaper than hunting for the button, and a prompt that
  // can only be dismissed by mouse is a trap on a keyboard.
  useEffect(() => {
    if (!offer) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') answer(locale);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer, locale]);

  if (!offer) return null;

  // Every string comes from the *offered* locale — it's addressed to someone
  // who reads that language.
  const t = bundleFor(offer).languagePrompt;

  return (
    <div
      role="region"
      aria-label={t.question}
      aria-live="polite"
      lang={offer}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border-ink)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] lift-card"
    >
      <p className="flex-1 min-w-0 font-sans font-bold text-sm">{t.question}</p>

      <button
        type="button"
        onClick={() => answer(offer)}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[var(--primary)] text-[var(--on-primary)] font-bold uppercase tracking-wider text-xs lift-btn-primary cursor-pointer"
      >
        {t.accept}
      </button>

      <button
        type="button"
        onClick={() => answer(locale)}
        className="shrink-0 px-2 py-2 font-sans text-xs font-bold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] cursor-pointer"
      >
        {t.decline}
      </button>

      <button
        type="button"
        onClick={() => answer(locale)}
        aria-label={t.dismiss}
        title={t.dismiss}
        className="shrink-0 p-1 rounded text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] cursor-pointer"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
