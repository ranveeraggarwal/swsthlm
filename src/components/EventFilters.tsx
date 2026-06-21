'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, CalendarDays, SlidersHorizontal, MapPin, Sparkles, Music, X } from 'lucide-react';
import { SwingEvent, EventCard as EventCardType } from '@/types/event';
import { EventCard } from './EventCard';
import { EventRow } from './EventRow';
import { SubscribeButton } from './SubscribeButton';
import {
  isCurrentWeek,
  isNextWeek,
  isSunday,
  formatEventDate,
  formatEventDateRange,
  getMonthKey,
  formatMonthHeading,
  getStockholmCurrentDate,
  getStockholmCurrentTime,
} from '@/lib/datetime';
import { groupMultiDayOneoffs } from '@/lib/events-grouping';

interface EventFiltersProps {
  events: SwingEvent[];
  // Build-time Stockholm date/time used to seed the first render so SSR and
  // hydration agree; the real client clock takes over in the effect below.
  currentDate: string;
  currentTime: string;
}

export function EventFilters({ events, currentDate: initialDate, currentTime: initialTime }: EventFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [liveMusicOnly, setLiveMusicOnly] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // "Now" can't be known by static HTML, so the temporal badges and the
  // This Week / Upcoming split are computed client-side after hydration.
  // Seeded with the build-time values to keep the first paint mismatch-free.
  const [now, setNow] = useState({ date: initialDate, time: initialTime });
  useEffect(() => {
    const tick = () => setNow({ date: getStockholmCurrentDate(), time: getStockholmCurrentTime() });
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  const currentDate = now.date;
  const currentTime = now.time;

  // Dynamically extract unique venues from the events list
  const venuesList = useMemo(() => {
    const venues = new Set<string>();
    events.forEach((e) => {
      if (e.venue && e.venue.trim().toLowerCase() !== 'all') {
        venues.add(e.venue.trim());
      }
    });
    return ['all', ...Array.from(venues).sort()];
  }, [events]);

  // Extract unique styles
  const stylesList = useMemo(() => {
    const styles = new Set<string>();
    events.forEach((e) => {
      if (e.style && e.style.trim().toLowerCase() !== 'all') {
        styles.add(e.style.toLowerCase());
      }
    });
    return ['all', ...Array.from(styles).sort()];
  }, [events]);

  // Normalizes styles for comparison
  const normalizeStyleLabel = (style: string) => {
    switch (style.toLowerCase()) {
      case 'all':
        return 'All Styles';
      case 'lindy':
        return 'Lindy Hop';
      case 'balboa':
        return 'Balboa';
      case 'blues':
        return 'Blues';
      default:
        return style.charAt(0).toUpperCase() + style.slice(1);
    }
  };

  // Filter events based on selections
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // 1. Search Query Filter (Title, Venue, Band, DJ, Organizer, Description)
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        event.title.toLowerCase().includes(q) ||
        event.venue.toLowerCase().includes(q) ||
        (event.band && event.band.toLowerCase().includes(q)) ||
        (event.dj && event.dj.toLowerCase().includes(q)) ||
        event.organizer.toLowerCase().includes(q) ||
        event.body.toLowerCase().includes(q);

      // 2. Style Filter
      const matchesStyle =
        selectedStyle === 'all' ||
        event.style.toLowerCase() === 'all' ||
        event.style.toLowerCase() === selectedStyle.toLowerCase();

      // 3. Venue Filter
      const matchesVenue = selectedVenue === 'all' || event.venue.trim() === selectedVenue;

      // 4. Live Music Filter
      const matchesLiveMusic = !liveMusicOnly || event.music === 'live' || event.music === 'mixed';

      return matchesSearch && matchesStyle && matchesVenue && matchesLiveMusic;
    });
  }, [events, searchQuery, selectedStyle, selectedVenue, liveMusicOnly]);

  // Collapse multi-day one-offs into single cards (presentation layer only).
  // groupMultiDayOneoffs expects events sorted ascending by date, which
  // filteredEvents already is (expandAll sorts them).
  const groupedCards = useMemo(() => groupMultiDayOneoffs(filteredEvents), [filteredEvents]);

  // Group event cards by their representative date (first night) into
  // "This Week" / "Next Week" vs "Upcoming".
  // On Sundays, or when the current week has zero events, we promote next
  // week's events into the highlighted section so people can plan ahead.
  const eventSections = useMemo(() => {
    const REFERENCE_DATE = currentDate;

    const thisWeekCards: EventCardType[] = [];
    const nextWeekCards: EventCardType[] = [];
    const upcomingCards: EventCardType[] = [];

    groupedCards.forEach((card) => {
      const d = card.dates[0];
      if (isCurrentWeek(d, REFERENCE_DATE)) {
        thisWeekCards.push(card);
      } else if (isNextWeek(d, REFERENCE_DATE)) {
        nextWeekCards.push(card);
      } else {
        upcomingCards.push(card);
      }
    });

    const showNextWeek = isSunday(REFERENCE_DATE) || thisWeekCards.length === 0;
    const highlightedCards = showNextWeek
      ? [...thisWeekCards, ...nextWeekCards]
      : thisWeekCards;
    const finalUpcoming = showNextWeek ? upcomingCards : [...nextWeekCards, ...upcomingCards];

    const groupByDate = (list: EventCardType[]) => {
      const groups: Record<string, EventCardType[]> = {};
      list.forEach((card) => {
        const key = card.dates[0];
        if (!groups[key]) groups[key] = [];
        groups[key].push(card);
      });
      return groups;
    };

    return {
      thisWeek: groupByDate(highlightedCards),
      upcomingCards: finalUpcoming,
      hasThisWeek: highlightedCards.length > 0,
      hasUpcoming: finalUpcoming.length > 0,
      showNextWeek,
    };
  }, [groupedCards, currentDate]);

  // Total count for filters label (cards, not raw occurrences).
  const totalCount = groupedCards.length;
  const hasActiveFilters = selectedStyle !== 'all' || selectedVenue !== 'all' || !!searchQuery || liveMusicOnly;

  // Smart filter status message
  const filterStatusMessage = useMemo(() => {
    if (!hasActiveFilters) {
      return <>Showing all <strong>{totalCount}</strong> event{totalCount !== 1 ? 's' : ''}</>;
    }

    const parts: string[] = [];
    if (selectedStyle !== 'all') {
      parts.push(normalizeStyleLabel(selectedStyle));
    }
    if (liveMusicOnly) {
      parts.push('Live Music');
    }

    let message = `${totalCount} ${parts.length > 0 ? parts.join(' ') + ' ' : ''}event${totalCount !== 1 ? 's' : ''}`;

    if (selectedVenue !== 'all') {
      message += ` at ${selectedVenue}`;
    }

    if (searchQuery) {
      message += ` matching "${searchQuery}"`;
    }

    return <>Showing <strong>{message}</strong></>;
  }, [totalCount, selectedStyle, selectedVenue, searchQuery, hasActiveFilters, liveMusicOnly]);

  return (
    <div className="w-full">
      {/* Top Status and Toggle for Filters */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--surface-container-highest)] font-sans text-xs text-zinc-500 uppercase tracking-wider font-semibold">
        <span>{filterStatusMessage}</span>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          <SubscribeButton />
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            aria-expanded={isFilterExpanded}
            aria-controls="filters-panel"
            className={`flex items-center gap-1.5 hover:underline font-bold transition-colors cursor-pointer ${
              isFilterExpanded ? 'text-[var(--primary)]' : 'text-[var(--secondary)]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isFilterExpanded ? 'Hide Filters' : 'Filter & Search'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStyle('all');
                setSelectedVenue('all');
                setLiveMusicOnly(false);
              }}
              className="text-[var(--primary)] hover:underline font-bold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters panel - Collapsible */}
      {isFilterExpanded && (
        <div id="filters-panel" className="border border-[var(--surface-container-highest)] bg-[var(--surface-container-low)] rounded-lg p-6 mb-12 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-[var(--surface-container-highest)] pb-4 mb-2">
              <SlidersHorizontal className="w-5 h-5 text-[var(--secondary)]" />
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--on-surface)]">
                Filters <span className="italic">& Search</span>
              </h2>
            </div>

            {/* Search Bar - Premium Neobrutalist Block Container */}
            <div className="relative w-full bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded shadow-[2px_2px_0px_var(--on-surface)] transition-all focus-within:shadow-[4px_4px_0px_var(--primary)] focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
              <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--outline)]" />
              <input
                type="text"
                aria-label="Search events"
                placeholder="Search by band, DJ, venue, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-transparent border-0 text-[var(--on-surface)] placeholder-[var(--outline)] focus:outline-none focus:ring-0 font-sans font-body-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Style & Music Filters */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <span className="flex items-center gap-2 font-sans text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" /> Filter by Style
                </span>
                <div className="filter-scroll-container">
                  <div className="flex overflow-x-auto pb-2 -mb-2 gap-2.5 snap-x md:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {stylesList.map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        aria-pressed={selectedStyle === style}
                        className={`snap-start whitespace-nowrap px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border-2 border-[var(--on-surface)] transition-all cursor-pointer ${
                          selectedStyle === style
                            ? 'bg-[var(--primary)] text-white font-bold shadow-[2px_2px_0px_0px_var(--on-surface)] -translate-y-0.5 -translate-x-0.5'
                            : 'bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] shadow-[0px_0px_0px_0px_var(--on-surface)]'
                        }`}
                      >
                        {normalizeStyleLabel(style)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:w-48">
                <span className="flex items-center gap-2 font-sans text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                  <Music className="w-3.5 h-3.5 text-amber-600" /> Music
                </span>
                <button
                  onClick={() => setLiveMusicOnly(!liveMusicOnly)}
                  aria-pressed={liveMusicOnly}
                  className={`w-full whitespace-nowrap px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border-2 border-[var(--on-surface)] transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    liveMusicOnly
                      ? 'bg-amber-500 text-white font-bold shadow-[2px_2px_0px_0px_var(--on-surface)] -translate-y-0.5 -translate-x-0.5'
                      : 'bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] shadow-[0px_0px_0px_0px_var(--on-surface)]'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  Live Music Only
                </button>
              </div>
            </div>

            {/* Venue Filters */}
            <div>
              <span className="flex items-center gap-2 font-sans text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                <MapPin className="w-3.5 h-3.5 text-[var(--secondary)]" /> Filter by Venue
              </span>
              <div className="filter-scroll-container">
                <div className="flex overflow-x-auto pb-2 -mb-2 gap-2.5 snap-x md:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {venuesList.map((venue) => (
                    <button
                      key={venue}
                      onClick={() => setSelectedVenue(venue)}
                      aria-pressed={selectedVenue === venue}
                      className={`snap-start whitespace-nowrap px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border-2 border-[var(--on-surface)] transition-all cursor-pointer ${
                        selectedVenue === venue
                          ? 'bg-[var(--secondary)] text-white font-bold shadow-[2px_2px_0px_0px_var(--on-surface)] -translate-y-0.5 -translate-x-0.5'
                          : 'bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] shadow-[0px_0px_0px_0px_var(--on-surface)]'
                      }`}
                    >
                      {venue === 'all' ? 'All Venues' : venue}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Results Section */}
      <div className="space-y-12">
        {totalCount === 0 ? (
          <div className="text-center py-16 border border-dashed border-[var(--surface-container-highest)] rounded bg-[var(--surface-container-low)] p-8">
            <SlidersHorizontal className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-1">No events match your filters</h3>
            <p className="font-sans font-body-md text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search terms or filters to find dance events.
            </p>
          </div>
        ) : (
          <>
            {/* THIS WEEK EVENTS SECTION */}
            {eventSections.hasThisWeek && (
              <div>
                <div className="flex items-center gap-3 mb-6 border-b border-[var(--surface-container-highest)] pb-3">
                  <CalendarDays className="w-5 h-5 text-[var(--primary)]" />
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-[var(--on-surface)]">
                    {eventSections.showNextWeek
                      ? <><span className="italic">Coming Up</span></>
                      : <>Happening <span className="italic">This Week</span></>}
                  </h2>
                </div>

                <div className="space-y-8">
                  {Object.entries(eventSections.thisWeek).map(([date, dateCards]) => (
                    <div key={date} className="space-y-4">
                      <h3 className="font-sans text-xs font-bold text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 py-1.5 px-3 rounded inline-block border border-[var(--primary)]/15">
                        {/* For multi-day cards, show the range in the section header. */}
                        {dateCards.length === 1 && dateCards[0].nightCount > 1
                          ? formatEventDateRange(dateCards[0].dates[0], dateCards[0].dates[dateCards[0].dates.length - 1])
                          : formatEventDate(date)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        {dateCards.map((card) => (
                          <EventCard
                            key={card.event.id}
                            event={card.event}
                            dates={card.dates}
                            nightCount={card.nightCount}
                            isThisWeek={isCurrentWeek(card.dates[0], currentDate)}
                            currentDate={currentDate}
                            currentTime={currentTime}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UPCOMING EVENTS SECTION */}
            {eventSections.hasUpcoming && (
              <div className="pt-4">
                <div className="flex items-center gap-3 mb-6 border-b border-[var(--surface-container-highest)] pb-3">
                  <CalendarDays className="w-5 h-5 text-zinc-600" />
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-[var(--on-surface)]">
                    {eventSections.showNextWeek
                      ? <><span className="italic">Later</span></>
                      : <>Upcoming <span className="italic">Events</span></>}
                  </h2>
                </div>

                <div>
                  {eventSections.upcomingCards.reduce<{ month: string; rows: React.ReactNode[] }>(
                    (acc, card) => {
                      const month = getMonthKey(card.dates[0]);
                      if (month !== acc.month) {
                        acc.rows.push(
                          <div key={`month-${month}`} className="flex items-center gap-3 mt-6 first:mt-0 mb-2">
                            <span className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                              {formatMonthHeading(month)}
                            </span>
                            <div className="flex-1 h-px bg-[var(--surface-container-highest)]" />
                          </div>
                        );
                        acc.month = month;
                      }
                      acc.rows.push(
                        <EventRow
                          key={card.event.id}
                          event={card.event}
                          dates={card.dates}
                          nightCount={card.nightCount}
                          currentDate={currentDate}
                          currentTime={currentTime}
                        />
                      );
                      return acc;
                    },
                    { month: '', rows: [] }
                  ).rows}
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
