'use client';

import React, { useState } from 'react';
import { MapPin, Music, Disc, Ticket, GraduationCap, Moon, ChevronDown, Banknote } from 'lucide-react';
import { SwingEvent } from '@/types/event';
import { ShareButton } from '@/components/ShareButton';

interface EventRowProps {
  event: SwingEvent;
  dates: string[];
  nightCount: number;
  currentDate: string;
  currentTime: string;
}

export function EventRow({ event, dates, nightCount }: EventRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.address}`)}`;
  const priceDisplay = event.price ? `${event.price}${event.payment ? ` (${event.payment})` : ''}` : null;

  const getStyleLabel = (style: string) => {
    switch (style.toLowerCase()) {
      case 'lindy': return 'Lindy Hop';
      case 'balboa': return 'Balboa';
      case 'blues': return 'Blues';
      case 'all': return 'All styles';
      default: return style.charAt(0).toUpperCase() + style.slice(1);
    }
  };

  const getStyleColor = (style: string) => {
    switch (style.toLowerCase()) {
      case 'lindy': return 'bg-[var(--tertiary)]/10 text-[var(--tertiary)] border-[var(--tertiary)]/20';
      case 'balboa': return 'bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20';
      case 'blues': return 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]';
      default: return 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] border-[var(--surface-container-highest)]';
    }
  };

  const musicRows: { type: 'live' | 'dj'; name?: string }[] = [];
  if (event.band) musicRows.push({ type: 'live', name: event.band });
  if (event.dj) musicRows.push({ type: 'dj', name: event.dj });
  if (musicRows.length === 0) {
    if (event.music === 'live') musicRows.push({ type: 'live' });
    else if (event.music === 'dj') musicRows.push({ type: 'dj' });
    else if (event.music === 'mixed') musicRows.push({ type: 'live' }, { type: 'dj' });
  }

  const venueLabel = [event.venue, event.neighborhood].filter(Boolean).join(' · ');
  const byLine = [venueLabel, event.organizer && `By ${event.organizer}`, event.address].filter(Boolean).join(' · ');

  // Compact row date: "Wed 26 Aug" for single, "26–27 Aug" / "26 Aug–1 Sep" for multi-night.
  // Uses en-GB (no comma, day-first) and UTC day extraction to avoid timezone shifts.
  const compactDateLabel = (() => {
    const fmtMonth = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short' });
    if (nightCount > 1) {
      const first = new Date(dates[0]);
      const last = new Date(dates[dates.length - 1]);
      const sameMonth = first.getUTCMonth() === last.getUTCMonth();
      return sameMonth
        ? `${first.getUTCDate()}–${last.getUTCDate()} ${fmtMonth(last)}`
        : `${first.getUTCDate()} ${fmtMonth(first)}–${last.getUTCDate()} ${fmtMonth(last)}`;
    }
    const d = new Date(dates[0]);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  })();

  return (
    <div className={`border-b border-[var(--surface-container-highest)] last:border-b-0 ${event.cancelled ? 'opacity-60' : ''}`}>
      {/* Row */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        className="w-full text-left py-2.5 px-1 hover:bg-[var(--surface-container-low)] transition-colors cursor-pointer"
      >
        {/* Primary line */}
        <div className="flex items-baseline gap-2">
          {/* Date col: desktop only — on mobile it moves to the secondary line */}
          <span className="hidden sm:block shrink-0 w-24 whitespace-nowrap font-sans text-xs font-medium text-[var(--on-surface-variant)]">
            {compactDateLabel}
          </span>
          {/* Title gets full width on mobile (~340px), narrowed on desktop by the date col */}
          <span className={`flex-1 min-w-0 font-serif font-bold text-sm text-[var(--on-surface)] truncate ${event.cancelled ? 'line-through' : ''}`}>
            {event.title}
          </span>
          {event.cancelled && (
            <span className="shrink-0 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] uppercase font-bold tracking-wider">
              Cancelled
            </span>
          )}
          <ChevronDown className={`w-4 h-4 shrink-0 text-[var(--on-surface-variant)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>

        {/* Secondary line: aligns under the title on desktop */}
        <div className="flex items-center gap-2 mt-0.5 sm:pl-[calc(6rem+8px)] overflow-hidden">
          {/* Date: mobile only (desktop shows it in the primary line) */}
          <span className="sm:hidden shrink-0 font-sans text-xs font-medium text-[var(--on-surface-variant)] whitespace-nowrap">
            {compactDateLabel}
          </span>
          <span className={`shrink-0 font-sans font-bold text-xs tabular-nums text-[var(--on-surface-variant)] ${event.cancelled ? 'line-through' : ''}`}>
            {event.start}–{event.end}
          </span>
          {/* Venue: desktop only — saves space on mobile for date+time+style */}
          <span className="hidden sm:block min-w-0 font-sans text-xs text-[var(--on-surface-variant)] truncate">
            {event.venue}{event.neighborhood ? ` · ${event.neighborhood}` : ''}
          </span>
          <span className="shrink-0 flex items-center gap-1 text-[var(--on-surface-variant)]">
            {musicRows.map((r) =>
              r.type === 'live'
                ? <Music key="live" className="w-3 h-3 text-amber-600" />
                : <Disc key="dj" className="w-3 h-3" />
            )}
          </span>
          <span className={`ml-auto shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStyleColor(event.style)}`}>
            {getStyleLabel(event.style)}
          </span>
        </div>
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="px-1 pb-4 pt-1 space-y-3 font-sans border-t border-[var(--surface-container-highest)] bg-[var(--surface-container-low)]">
          <div className="flex flex-wrap items-center gap-2 pt-2 px-1">
            {priceDisplay && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border bg-[var(--surface-container)] text-[var(--on-surface-variant)] border-[var(--surface-container-highest)]">
                <Banknote className="w-3.5 h-3.5 shrink-0" />
                {priceDisplay}
              </span>
            )}
            {nightCount > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] uppercase font-bold tracking-wider">
                <Moon className="w-3 h-3" /> {nightCount} nights
              </span>
            )}
            {event.beginnerClass && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-green-50 text-green-800 border border-green-200 text-[10px] uppercase font-bold tracking-wider">
                <GraduationCap className="w-3 h-3" />
                {event.beginnerClass.toLowerCase() === 'yes' ? 'Beginner friendly' : `Beginner class ${event.beginnerClass}`}
              </span>
            )}
          </div>

          {musicRows.some((r) => r.name) && (
            <div className="space-y-1 px-1">
              {musicRows.filter((r) => r.name).map((row) => (
                <div key={row.type} className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                  {row.type === 'live' ? <Music className="w-3.5 h-3.5 shrink-0" /> : <Disc className="w-3.5 h-3.5 shrink-0" />}
                  <span>{row.name}</span>
                </div>
              ))}
            </div>
          )}

          {byLine && (
            <div className="flex items-start gap-2 text-xs text-[var(--outline)] font-medium px-1">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] transition-colors">
                {byLine}
              </a>
            </div>
          )}

          {event.body && (
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line px-1">
              {event.body}
            </p>
          )}

          <div className="flex items-center gap-2 px-1">
            {event.ticket && (
              <a
                href={event.ticket}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded border border-[var(--on-surface)] bg-[var(--primary)] text-white hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs"
              >
                <Ticket className="w-4 h-4" />
                Get Tickets / Info
              </a>
            )}
            <ShareButton eventId={event.id} eventDate={event.date} eventTitle={event.title} />
          </div>
        </div>
      )}
    </div>
  );
}
