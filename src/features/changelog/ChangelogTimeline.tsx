'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatMonthHeading } from '@/lib/date/format';
import { dictionary, type Locale } from '@/lib/i18n';
import { CHANGELOG } from './entries';

const PANEL_ID = 'changelog-panel';

/**
 * Collapsed-by-default disclosure listing major feature work month by month.
 * Content lives in `./entries.ts`; this component only renders it.
 *
 * The chrome around the timeline is translated, the entries inside it are not
 * (#264): a changelog sits next to the git history, and giving every entry an
 * `{ en, sv }` pair would turn each future feature PR into a two-language
 * authoring job forever. Non-English readers get `entriesLanguageNote` above
 * the list saying so.
 */
export function ChangelogTimeline({ locale = 'en' }: { locale?: Locale }) {
  const t = dictionary(locale).changelog;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="rounded-lg border-2 border-[var(--border-ink)] bg-[var(--surface-container-low)] shadow-[3px_3px_0px_0px_var(--shadow-ink)] overflow-hidden">
      {/* Heading wraps the trigger so the disclosure stays in the h1 → h2 → h3
          outline while the whole bar remains one control. */}
      <h2>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          aria-controls={PANEL_ID}
          className="w-full flex items-center justify-between gap-4 p-4 text-left cursor-pointer hover:bg-[var(--surface-container)] transition-colors"
        >
          <span>
            <span className="block font-serif text-xl font-bold text-[var(--on-surface)]">
              {t.heading}
            </span>
            <span className="block mt-0.5 font-sans text-sm font-normal text-[var(--on-surface-variant)]">
              {t.subheading}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`w-5 h-5 shrink-0 text-[var(--on-surface-variant)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </h2>

      {isExpanded && (
        <div id={PANEL_ID} className="border-t-2 border-[var(--border-ink)] p-4 sm:p-6">
          {/* Empty in English, where there is nothing to explain. */}
          {t.entriesLanguageNote && (
            <p className="mb-6 font-sans text-sm text-[var(--on-surface-variant)] leading-relaxed">
              {t.entriesLanguageNote}
            </p>
          )}
          <ol className="space-y-8">
            {CHANGELOG.map((entry, index) => (
              <li key={entry.month} className="relative pl-8">
                {/* Timeline rail + marker. Decorative: the month heading carries
                    the meaning. The rail is skipped on the last entry so the
                    line stops at the oldest month instead of dangling. */}
                {index < CHANGELOG.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[5px] top-4 -bottom-8 w-0.5 bg-[var(--outline-variant)]"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-[var(--border-ink)] bg-[var(--primary)]"
                />

                <h3 className="font-sans text-xs font-bold uppercase tracking-[0.05em] text-[var(--on-surface-variant)]">
                  {formatMonthHeading(entry.month)}
                </h3>
                <p className="mt-1 font-serif text-lg font-bold text-[var(--on-surface)] leading-snug">
                  {entry.summary}
                </p>

                <ul className="mt-3 space-y-3">
                  {entry.items.map((item) => (
                    <li
                      key={item.title}
                      className="p-3 rounded border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                    >
                      <span className="block font-sans text-sm font-bold text-[var(--on-surface)]">
                        {item.title}
                      </span>
                      <span className="block mt-0.5 font-sans text-sm text-[var(--on-surface-variant)] leading-relaxed">
                        {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
