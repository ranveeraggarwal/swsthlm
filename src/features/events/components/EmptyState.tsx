'use client';

// Shown when the filters match nothing. A resting upright bass stands in for a
// quiet bandstand (click it and it plucks a low note), followed by what emptied
// the page, a reset button, and — because "no events" is also the moment
// someone is most likely to help — links to the feed and the organizer inbox.

import React, { useState } from 'react';
import { Music, Music2 } from 'lucide-react';
import { CALENDAR_WEBCAL_URL, CONTACT_EMAIL } from '@/lib/site';
import { emptyStateHeading, hasActiveFilters, type EventFilters } from '../model/sections';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  filters: EventFilters;
  onClearFilters: () => void;
}

const PURFLING_PATH =
  'M52 39 C44 40 37.5 45 37.5 52.8 C37.5 57.2 42 59.8 42 63.8 C42 68.5 30.2 71.2 30.2 81.8 C30.2 89.8 39 93.2 52 93.2 C65 93.2 73.8 89.8 73.8 81.8 C73.8 71.2 62 68.5 62 63.8 C62 59.8 66.5 57.2 66.5 52.8 C66.5 45 60 40 52 39 Z';

export function EmptyState({ filters, onClearFilters }: EmptyStateProps) {
  const { locale, bundle } = useLocale();
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(false);

  const pluck = () => {
    setBeat((b) => b + 1);
    setPlaying(true);
  };

  return (
    <div className="text-center py-14 sm:py-16 border-2 border-dashed border-[var(--outline-variant)] rounded-lg bg-[var(--surface-container-low)] p-8">
      <div className="flex justify-center mb-3">
        <button
          type="button"
          onClick={pluck}
          aria-label={bundle.empty.pluckBass}
          title={bundle.empty.pluckBass}
          className="relative inline-flex items-center justify-center rounded-lg px-3 py-1 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 104 118"
            className="w-24 h-28 overflow-visible"
          >
            {/* Floor shadow beneath the brass endpin */}
            <ellipse
              cx="52"
              cy="112"
              rx="22"
              ry="3.8"
              className="fill-[var(--shadow-ink)]"
              fillOpacity={0.14}
            />

            <g key={`bass-${beat}`} className={playing ? styles.thump : ''}>
              <g transform="rotate(-8 52 110)">
                {/* Brass endpin + rubber foot */}
                <path
                  d="M52 96L52 110"
                  className="fill-none stroke-[var(--tertiary)]"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
                <circle cx="52" cy="110" r="2" className="fill-[var(--border-ink)]" />
                <rect
                  x="49"
                  y="94.5"
                  width="6"
                  height="3.5"
                  rx="1"
                  className="fill-[var(--tertiary)] stroke-[var(--border-ink)]"
                  strokeWidth={1.2}
                />

                {/* Brass tuning machines + carved scroll */}
                <g
                  className="fill-[var(--tertiary)] stroke-[var(--tertiary)]"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                >
                  <path d="M44 12.5H49" />
                  <path d="M44 17.5H49" />
                  <path d="M55 14H60" />
                  <path d="M55 19H60" />
                  <circle cx="43.2" cy="12.5" r="1.4" />
                  <circle cx="43.2" cy="17.5" r="1.4" />
                  <circle cx="60.8" cy="14" r="1.4" />
                  <circle cx="60.8" cy="19" r="1.4" />
                </g>
                <rect
                  x="49"
                  y="9.5"
                  width="6"
                  height="13"
                  rx="1.5"
                  className="fill-[var(--shadow-ink)] stroke-[var(--border-ink)]"
                  strokeWidth={1.1}
                />
                <circle
                  cx="52"
                  cy="7.5"
                  r="3.5"
                  className="fill-[var(--primary)] stroke-[var(--border-ink)]"
                  strokeWidth={1.6}
                />

                {/* Sloped-shoulder upright double bass body + purfling */}
                <path
                  d="M52 36 C43 37 35 43 35 52 C35 57 40 60 40 64 C40 69 27 72 27 83 C27 92 37 96 52 96 C67 96 77 92 77 83 C77 72 64 69 64 64 C64 60 69 57 69 52 C69 43 61 37 52 36 Z"
                  className="fill-[var(--primary)] stroke-[var(--border-ink)]"
                  strokeWidth={2.2}
                />
                <path
                  d={PURFLING_PATH}
                  className="fill-none stroke-[var(--on-primary)]"
                  strokeOpacity={0.32}
                  strokeWidth={0.9}
                />

                {/* Ebony fingerboard */}
                <path
                  d="M49.5 21.5L54.5 21.5L55.8 61.5L48.2 61.5Z"
                  className="fill-[var(--shadow-ink)]"
                />

                {/* Classic f-holes */}
                <g
                  className="fill-none stroke-[var(--shadow-ink)]"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                >
                  <path d="M41 64 C38.5 64 38.5 69 39.5 72 C40.5 75 40.5 79 38 79" />
                  <path d="M37.8 71.5H41.2" />
                  <path d="M63 64 C65.5 64 65.5 69 64.5 72 C63.5 75 63.5 79 66 79" />
                  <path d="M62.8 71.5H66.2" />
                </g>

                {/* Carved maple bridge + ebony tailpiece */}
                <rect
                  x="45.5"
                  y="70"
                  width="13"
                  height="3.5"
                  rx="1"
                  className="fill-[var(--ticket-stock)] stroke-[var(--shadow-ink)]"
                  strokeWidth={1.2}
                />
                <path
                  d="M48.5 81L55.5 81L53.8 94.5L50.2 94.5Z"
                  className="fill-[var(--shadow-ink)]"
                />

                {/* Outer strings (steady) + inner strings (shimmer when plucked) */}
                <g
                  className="fill-none stroke-[var(--on-primary)]"
                  strokeOpacity={0.78}
                  strokeWidth={0.85}
                >
                  <path d="M50.2 21.5L47.8 71.5L49.6 81" />
                  <path d="M53.8 21.5L56.2 71.5L54.4 81" />
                </g>
                <g
                  className={`fill-none stroke-[var(--on-primary)] ${playing ? styles.strings : ''}`}
                  strokeOpacity={0.95}
                  strokeWidth={1}
                >
                  <path d="M51.4 21.5L50.5 71.5L51.2 81" />
                  <path d="M52.6 21.5L53.5 71.5L52.8 81" />
                </g>
              </g>
            </g>
          </svg>

          {playing && (
            <span key={`notes-${beat}`} aria-hidden="true">
              <Music className={`${styles.note} ${styles.first} text-[var(--primary)]`} />
              <Music2
                className={`${styles.note} ${styles.second} text-[var(--tertiary)]`}
                onAnimationEnd={() => setPlaying(false)}
              />
            </span>
          )}
        </button>
      </div>

      <h2 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-1">
        {emptyStateHeading(filters, locale)}
      </h2>
      <p className="font-sans font-body-md text-[var(--on-surface-variant)] max-w-sm mx-auto mb-6">
        {bundle.empty.body}
      </p>

      {hasActiveFilters(filters) && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center justify-center px-4 py-2 rounded border-2 border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary transition-all cursor-pointer"
        >
          {bundle.empty.clearAll}
        </button>
      )}

      <p className="font-sans text-xs text-[var(--on-surface-variant)] mt-6">
        <a
          href={CALENDAR_WEBCAL_URL}
          className="text-[var(--primary)] underline hover:no-underline"
        >
          {bundle.empty.subscribeCta}
        </a>
        {' · '}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-[var(--primary)] underline hover:no-underline"
        >
          {bundle.empty.organizersCta}
        </a>
      </p>
    </div>
  );
}
