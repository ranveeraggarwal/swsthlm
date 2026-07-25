'use client';

// The collapsible search-and-filter panel. Presentational: it renders the current
// filter state and reports changes upward. What the filters *do* is
// `../model/sections.ts`; what the chips are called is `../model/labels.ts`.

import React from 'react';
import { MapPin, Music, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { Style } from '@/lib/data/types';
import { styleFilterLabel } from '../model/labels';
import { venueFilterLabel, type EventFilters } from '../model/sections';

interface FilterPanelProps {
  id: string;
  filters: EventFilters;
  onChange: (patch: Partial<EventFilters>) => void;
  styles: Style[];
  venues: string[];
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const SCROLLER =
  'flex overflow-x-auto pb-2 -mb-2 gap-2.5 snap-x md:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]';

const CHIP_BASE =
  'snap-start whitespace-nowrap px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border-2 border-[var(--border-ink)] transition-all cursor-pointer';

const CHIP_IDLE =
  'bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] shadow-[0px_0px_0px_0px_var(--shadow-ink)]';

// The lifted "pressed" look, one variant per facet accent. Written out in full
// rather than interpolated: Tailwind only generates classes it can see as
// literal strings in the source.
const CHIP_SELECTED = {
  primary:
    'bg-[var(--primary)] text-[var(--on-primary)] font-bold shadow-[2px_2px_0px_0px_var(--shadow-ink)] -translate-y-0.5 -translate-x-0.5',
  secondary:
    'bg-[var(--secondary)] text-[var(--on-secondary)] font-bold shadow-[2px_2px_0px_0px_var(--shadow-ink)] -translate-y-0.5 -translate-x-0.5',
  tertiary:
    'bg-[var(--tertiary)] text-[var(--on-tertiary)] font-bold shadow-[2px_2px_0px_0px_var(--shadow-ink)] -translate-y-0.5 -translate-x-0.5',
} as const;

const FACET_LABEL =
  'flex items-center gap-2 font-sans text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-widest mb-3';

export function FilterPanel({
  id,
  filters,
  onChange,
  styles,
  venues,
  searchInputRef,
}: FilterPanelProps) {
  return (
    <div
      id={id}
      className="border border-[var(--surface-container-highest)] bg-[var(--surface-container-low)] rounded-lg p-6 mb-12 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-[var(--surface-container-highest)] pb-4 mb-2">
          <SlidersHorizontal aria-hidden="true" className="w-5 h-5 text-[var(--secondary)]" />
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--on-surface)]">
            Filters <span className="italic">&amp; Search</span>
          </h2>
        </div>

        {/* Search */}
        <div className="relative w-full bg-[var(--surface-container-lowest)] border-2 border-[var(--border-ink)] rounded shadow-[2px_2px_0px_var(--shadow-ink)] transition-all focus-within:shadow-[4px_4px_0px_var(--primary)] focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
          <Search
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--outline)]"
          />
          <input
            ref={searchInputRef}
            type="text"
            aria-label="Search events"
            placeholder="Search by band, DJ, venue, title..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-11 pr-10 py-3.5 bg-transparent border-0 text-[var(--on-surface)] placeholder-[var(--outline)] focus:outline-none focus:ring-0 font-sans font-body-md"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => {
                onChange({ search: '' });
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
              title="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            // The "/" shortcut hint. Hidden on mobile, where there's no keyboard.
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
              <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 font-sans text-xs font-bold text-[var(--on-surface-variant)] bg-[var(--surface-container)] border border-[var(--border-ink)] rounded shadow-[1px_1px_0px_0px_var(--shadow-ink)]">
                /
              </kbd>
            </div>
          )}
        </div>

        {/* Style + music */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <span id={`${id}-style-label`} className={FACET_LABEL}>
              <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-[var(--primary)]" /> Filter by
              Style
            </span>
            <div className="filter-scroll-container">
              <div role="group" aria-labelledby={`${id}-style-label`} className={SCROLLER}>
                {styles.map((style) => (
                  <button
                    key={style}
                    onClick={() => onChange({ style })}
                    aria-pressed={filters.style === style}
                    className={`${CHIP_BASE} ${filters.style === style ? CHIP_SELECTED.primary : CHIP_IDLE}`}
                  >
                    {styleFilterLabel(style)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:w-48">
            <span className={FACET_LABEL}>
              <Music aria-hidden="true" className="w-3.5 h-3.5 text-[var(--tertiary)]" /> Music
            </span>
            <button
              onClick={() => onChange({ liveMusicOnly: !filters.liveMusicOnly })}
              aria-pressed={filters.liveMusicOnly}
              className={`w-full flex items-center justify-center gap-2 ${CHIP_BASE} ${filters.liveMusicOnly ? CHIP_SELECTED.tertiary : CHIP_IDLE}`}
            >
              <Music className="w-3.5 h-3.5" />
              Live Music Only
            </button>
          </div>
        </div>

        {/* Venue */}
        <div>
          <span id={`${id}-venue-label`} className={FACET_LABEL}>
            <MapPin aria-hidden="true" className="w-3.5 h-3.5 text-[var(--secondary)]" /> Filter by
            Venue
          </span>
          <div className="filter-scroll-container">
            <div role="group" aria-labelledby={`${id}-venue-label`} className={SCROLLER}>
              {venues.map((venue) => (
                <button
                  key={venue}
                  onClick={() => onChange({ venue })}
                  aria-pressed={filters.venue === venue}
                  className={`${CHIP_BASE} ${filters.venue === venue ? CHIP_SELECTED.secondary : CHIP_IDLE}`}
                >
                  {venueFilterLabel(venue)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
