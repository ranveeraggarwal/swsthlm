'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { CONTRIBUTORS } from './contributors';
import { useLocale } from '@/components/providers/LocaleProvider';

const PANEL_ID = 'contributors-panel';

/**
 * Collapsed-by-default disclosure listing everyone who has contributed to the
 * site. Content lives in `./contributors.ts`; this component only renders it.
 */
export function ContributorsWall() {
  const { bundle } = useLocale();
  const t = bundle.contributors;
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
        <ul
          id={PANEL_ID}
          className="border-t-2 border-[var(--border-ink)] p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {CONTRIBUTORS.map((contributor) => (
            <li
              key={contributor.name}
              className="p-3 rounded border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex items-center justify-between gap-2"
            >
              <span className="font-sans text-sm font-bold text-[var(--on-surface)]">
                {contributor.name}
              </span>
              {contributor.githubUrl && (
                <a
                  href={contributor.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.onGitHub.replace('{name}', contributor.name)}
                  title={t.onGitHub.replace('{name}', contributor.name)}
                  className="shrink-0 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
                >
                  <GitHubIcon className="w-4 h-4" />
                  <span className="sr-only">{bundle.card.opensInNewTab}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
