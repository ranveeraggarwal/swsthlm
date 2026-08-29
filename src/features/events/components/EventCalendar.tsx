'use client';

// The homepage event listing: filter state, the live clock, and the two lists.
//
// This is the only stateful component in the feature. It holds four things and
// delegates everything else:
//
//   • the filter state           → `FilterPanel` renders it, `../model/sections.ts` applies it
//   • "now", ticking every minute → the badges and the This Week / Later split
//   • whether the panel is open   → plus the `/` and Escape shortcuts
//   • the derived lists           → `EventSections`
//
// It was previously called `EventFilters` and was 662 lines, because it also
// owned the filter markup, both list layouts, the empty state, the month
// headings, the style labels and the multi-night grouping.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { stockholmNow, type Now } from '@/lib/date/clock';
import { useLocale } from '@/components/providers/LocaleProvider';
import { splitTemplate } from '@/i18n/template';
import type { SwingEvent } from '../model/event';
import { groupMultiDayOneoffs } from '../model/grouping';
import {
  NO_FILTERS,
  availableStyles,
  availableVenues,
  buildSections,
  filterEvents,
  hasActiveFilters,
  summariseFilters,
  type EventFilters,
} from '../model/sections';
import { EmptyState } from './EmptyState';
import { FilterPanel } from './FilterPanel';
import { HighlightedEvents, UpcomingEvents } from './EventSections';
import { SubscribeButton } from './SubscribeButton';

const FILTER_PANEL_ID = 'filters-panel';
const CLOCK_TICK_MS = 60_000;

interface EventCalendarProps {
  events: SwingEvent[];
  /** The build-time Stockholm clock, seeding the first render so that SSR and
   *  hydration agree. The real client clock takes over in an effect. */
  initialNow: Now;
}

export function EventCalendar({ events, initialNow }: EventCalendarProps) {
  const { locale, bundle } = useLocale();
  const [filters, setFilters] = useState<EventFilters>(NO_FILTERS);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const panelToggleRef = useRef<HTMLButtonElement>(null);

  const now = useLiveStockholmClock(initialNow);

  const updateFilters = useCallback(
    (patch: Partial<EventFilters>) => setFilters((current) => ({ ...current, ...patch })),
    [],
  );

  // Focus returns to the toggle so a keyboard user isn't dropped at the top of
  // the document after clearing.
  const clearFilters = useCallback(() => {
    setFilters(NO_FILTERS);
    setTimeout(() => panelToggleRef.current?.focus(), 0);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => panelToggleRef.current?.focus(), 0);
  }, []);

  useSearchShortcut({
    isPanelOpen,
    openAndFocusSearch: () => {
      setIsPanelOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 0);
    },
    closePanel,
  });

  // Facets come from the unfiltered list: a style chip should stay available so
  // you can switch to it, not vanish because the current filter excludes it.
  const styles = useMemo(() => availableStyles(events), [events]);
  const venues = useMemo(() => availableVenues(events), [events]);

  const groups = useMemo(
    () => groupMultiDayOneoffs(filterEvents(events, filters, now)),
    [events, filters, now],
  );
  const sections = useMemo(() => buildSections(groups, now.date), [groups, now.date]);

  // Cards, not raw occurrences — a three-night workshop counts once.
  const summary = summariseFilters(filters, groups.length, locale);
  const filtersActive = hasActiveFilters(filters);

  // The count and the filter description render bold inside the sentence, so
  // the template is split around the placeholder rather than substituted into
  // it — see `@/i18n/template`.
  const summaryNode =
    summary.kind === 'all'
      ? renderWithEmphasis(
          bundle.listing.showingAll.replace(
            '{noun}',
            summary.count === 1 ? bundle.filters.eventNoun.one : bundle.filters.eventNoun.other,
          ),
          'count',
          summary.count,
        )
      : renderWithEmphasis(bundle.listing.showingFiltered, 'description', summary.description);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--surface-container-highest)] font-sans text-xs text-[var(--on-surface-variant)] uppercase tracking-wider font-semibold">
        <span aria-live="polite" aria-atomic="true">
          {summaryNode}
        </span>

        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          <SubscribeButton />
          <button
            type="button"
            ref={panelToggleRef}
            onClick={() => setIsPanelOpen((open) => !open)}
            aria-expanded={isPanelOpen}
            aria-controls={FILTER_PANEL_ID}
            className={`flex items-center gap-1.5 hover:underline font-bold transition-colors cursor-pointer ${
              isPanelOpen ? 'text-[var(--primary)]' : 'text-[var(--secondary)]'
            }`}
          >
            <SlidersHorizontal aria-hidden="true" className="w-3.5 h-3.5" />
            {isPanelOpen ? bundle.listing.hideFilters : bundle.listing.showFilters}
          </button>
          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[var(--primary)] hover:underline font-bold cursor-pointer"
            >
              {bundle.listing.reset}
            </button>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <FilterPanel
          id={FILTER_PANEL_ID}
          filters={filters}
          onChange={updateFilters}
          styles={styles}
          venues={venues}
          searchInputRef={searchInputRef}
        />
      )}

      <div className="space-y-12">
        {groups.length === 0 ? (
          <EmptyState filters={filters} onClearFilters={clearFilters} />
        ) : (
          <>
            <HighlightedEvents
              sections={sections.highlighted}
              showNextWeek={sections.showNextWeek}
              now={now}
            />
            <UpcomingEvents
              sections={sections.upcoming}
              showNextWeek={sections.showNextWeek}
            />
          </>
        )}
      </div>
    </div>
  );
}

/** `Showing all <strong>12</strong> events` — the sentence from the locale
 *  file, with its one substituted value set bold. */
function renderWithEmphasis(template: string, token: string, value: React.ReactNode) {
  const [before, after] = splitTemplate(template, token);
  return (
    <>
      {before}
      <strong>{value}</strong>
      {after}
    </>
  );
}

/**
 * The Stockholm clock, seeded from the server and re-read every minute.
 *
 * Static HTML cannot know the current time, so the first paint uses the
 * build-time reading and the effect takes over after hydration. Without the seed,
 * the badges would mismatch and React would discard the server markup.
 */
function useLiveStockholmClock(initialNow: Now): Now {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const tick = () => setNow(stockholmNow());
    tick();
    const id = setInterval(tick, CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  return now;
}

/**
 * `/` opens the panel and focuses search; Escape closes it and returns focus to
 * the toggle. The `/` handler ignores keystrokes already going into a field, or
 * it would swallow a literal slash mid-search.
 */
function useSearchShortcut({
  isPanelOpen,
  openAndFocusSearch,
  closePanel,
}: {
  isPanelOpen: boolean;
  openAndFocusSearch: () => void;
  closePanel: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        openAndFocusSearch();
      } else if (e.key === 'Escape' && isPanelOpen) {
        e.preventDefault();
        closePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, openAndFocusSearch, closePanel]);
}
