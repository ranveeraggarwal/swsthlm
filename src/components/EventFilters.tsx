'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, CalendarDays, SlidersHorizontal, MapPin, Sparkles, Music } from 'lucide-react';
import { SwingEvent } from '@/types/event';
import { EventCard } from './EventCard';
import {
  isCurrentWeek,
  formatEventDate,
  getStockholmCurrentDate,
  getStockholmCurrentTime,
} from '@/lib/datetime';

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

  // Group events by date into "This Week" vs "Upcoming"
  const eventSections = useMemo(() => {
    // Current date reference for "This Week" detection (local time)
    const REFERENCE_DATE = currentDate;

    const thisWeekEvents: SwingEvent[] = [];
    const upcomingEvents: SwingEvent[] = [];

    filteredEvents.forEach((event) => {
      if (isCurrentWeek(event.date, REFERENCE_DATE)) {
        thisWeekEvents.push(event);
      } else {
        upcomingEvents.push(event);
      }
    });

    // Helper to group by date
    const groupByDate = (list: SwingEvent[]) => {
      const groups: Record<string, SwingEvent[]> = {};
      list.forEach((event) => {
        if (!groups[event.date]) {
          groups[event.date] = [];
        }
        groups[event.date].push(event);
      });
      return groups;
    };

    return {
      thisWeek: groupByDate(thisWeekEvents),
      upcoming: groupByDate(upcomingEvents),
      hasThisWeek: thisWeekEvents.length > 0,
      hasUpcoming: upcomingEvents.length > 0,
    };
  }, [filteredEvents, currentDate]);

  // Total count for filters label
  const totalCount = filteredEvents.length;
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
  }, [totalCount, selectedStyle, selectedVenue, searchQuery, hasActiveFilters]);

  return (
    <div className="w-full">
      {/* Search and Filters panel */}
      <div className="border border-[var(--surface-container-highest)] bg-[var(--surface-container-low)] rounded-lg p-6 mb-10 shadow-sm">
        <div className="flex flex-col gap-6">
          {/* Search Bar - Premium Neobrutalist Block Container */}
          <div className="relative w-full bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded shadow-[2px_2px_0px_var(--on-surface)] transition-all focus-within:shadow-[4px_4px_0px_var(--primary)] focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--outline)]" />
            <input
              type="text"
              placeholder="Search by band, DJ, venue, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-transparent border-0 text-[var(--on-surface)] placeholder-[var(--outline)] focus:outline-none focus:ring-0 font-sans font-body-md"
            />
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

        {/* Smart filter status bar */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--surface-container-highest)] font-sans text-xs text-zinc-500 uppercase tracking-wider font-semibold">
          <span>{filterStatusMessage}</span>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStyle('all');
                setSelectedVenue('all');
                setLiveMusicOnly(false);
              }}
              className="text-[var(--primary)] hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

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
                    Happening <span className="italic">This Week</span>
                  </h2>
                </div>

                <div className="space-y-8">
                  {Object.entries(eventSections.thisWeek).map(([date, dateEvents]) => (
                    <div key={date} className="space-y-4">
                      <h3 className="font-sans text-xs font-bold text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 py-1.5 px-3 rounded inline-block border border-[var(--primary)]/15">
                        {formatEventDate(date)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        {dateEvents.map((event) => (
                          <EventCard key={event.id} event={event} isThisWeek={true} currentDate={currentDate} currentTime={currentTime} />
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
                    Upcoming <span className="italic">Events</span>
                  </h2>
                </div>

                <div className="space-y-8">
                  {Object.entries(eventSections.upcoming).map(([date, dateEvents]) => (
                    <div key={date} className="space-y-4">
                      <h3 className="font-sans text-xs font-bold text-zinc-600 uppercase tracking-widest bg-[var(--surface-container-low)] py-1.5 px-3 rounded inline-block border border-[var(--surface-container-highest)]">
                        {formatEventDate(date)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        {dateEvents.map((event) => (
                          <EventCard key={event.id} event={event} isThisWeek={false} currentDate={currentDate} currentTime={currentTime} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
