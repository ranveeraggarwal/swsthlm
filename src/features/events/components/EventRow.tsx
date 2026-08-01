'use client';

// The compact, expandable row used for events beyond the highlighted week. Same
// facts as `EventCard`, arranged for scanning fifty of them rather than reading
// six.
//
// Layout note: the date column is desktop-only in the primary line and moves to
// the secondary line on mobile, where there isn't room for date + time + venue +
// style on one row.

import React, { useState } from 'react';
import { ChevronDown, Disc, MapPin, Music, Ticket } from 'lucide-react';
import { formatCompactDateRange } from '@/lib/date/format';
import { useLocale } from '@/components/providers/LocaleProvider';
import { ReportCorrectionButton } from '@/features/corrections/ReportCorrectionButton';
import { domIdFor, venueMapsUrl, type EventGroup } from '../model/event';
import { musicLines } from '../model/labels';
import { AddToCalendarButton } from './AddToCalendarButton';
import { BeginnerChip, NightsChip, PaymentChip, PriceChip, StyleChip } from './EventChips';
import { FloorTypeBadge } from './FloorTypeBadge';
import { ShareButton } from './ShareButton';

export function EventRow({ group }: { group: EventGroup }) {
  const { event, dates, nightCount } = group;
  const [isExpanded, setIsExpanded] = useState(false);

  const { locale, bundle } = useLocale();
  const panelId = domIdFor(event, 'event-row-panel');
  const dateLabel = formatCompactDateRange(dates, locale);
  const performers = musicLines(event);
  const namedPerformers = performers.filter((line) => line.name);

  const byLine = [
    [event.venue, event.neighborhood].filter(Boolean).join(' · '),
    event.organizer && `By ${event.organizer}`,
    event.address,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="border-b border-[var(--surface-container-highest)] last:border-b-0">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="w-full text-left py-2.5 px-1 hover:bg-[var(--surface-container-low)] transition-colors cursor-pointer"
      >
        <div className="flex items-baseline gap-2">
          <span className="hidden sm:block shrink-0 w-24 whitespace-nowrap font-sans text-xs font-medium text-[var(--on-surface-variant)]">
            {dateLabel}
          </span>
          {/* Title takes the full width on mobile, narrowed on desktop by the date column. */}
          <span
            className={`flex-1 min-w-0 font-serif font-bold text-sm text-[var(--on-surface)] truncate ${event.cancelled ? 'line-through' : ''}`}
          >
            {event.title}
          </span>
          {event.cancelled && (
            <span className="shrink-0 px-2 py-0.5 rounded bg-[var(--error)] text-[var(--on-error)] text-[10px] uppercase font-bold tracking-wider">
              {bundle.card.cancelled}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={`w-4 h-4 shrink-0 text-[var(--on-surface-variant)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Secondary line, aligned under the title on desktop. */}
        <div className="flex items-center gap-2 mt-0.5 sm:pl-[calc(6rem+8px)] overflow-hidden">
          <span className="sm:hidden shrink-0 font-sans text-xs font-medium text-[var(--on-surface-variant)] whitespace-nowrap">
            {dateLabel}
          </span>
          <span
            className={`shrink-0 font-sans font-bold text-xs tabular-nums text-[var(--on-surface-variant)] ${event.cancelled ? 'line-through' : ''}`}
          >
            {event.start}–{event.end}
          </span>
          {/* Venue is desktop-only — mobile needs the space for date, time and style. */}
          <span className="hidden sm:block min-w-0 font-sans text-xs text-[var(--on-surface-variant)] truncate">
            {event.venue}
            {event.neighborhood ? ` · ${event.neighborhood}` : ''}
          </span>
          <span className="shrink-0 flex items-center gap-1 text-[var(--on-surface-variant)]">
            {performers.map((line) =>
              line.type === 'live' ? (
                <Music key="live" aria-hidden="true" className="w-3 h-3 text-[var(--tertiary)]" />
              ) : (
                <Disc key="dj" aria-hidden="true" className="w-3 h-3" />
              ),
            )}
          </span>
          <StyleChip style={event.style} layout="row" />
        </div>
      </button>

      {isExpanded && (
        <div
          id={panelId}
          className="px-1 pb-4 pt-1 space-y-3 font-sans border-t border-[var(--surface-container-highest)] bg-[var(--surface-container-low)]"
        >
          <div className="flex flex-wrap items-center gap-2 pt-2 px-1">
            <PriceChip price={event.price} />
            <PaymentChip payment={event.payment} />
            <NightsChip nightCount={nightCount} />
            <BeginnerChip beginnerClass={event.beginnerClass} />
            <FloorTypeBadge floorType={event.floorType} />
          </div>

          {namedPerformers.length > 0 && (
            <div className="space-y-1 px-1">
              {namedPerformers.map((line) => (
                <div
                  key={line.type}
                  className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]"
                >
                  {line.type === 'live' ? (
                    <Music aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Disc aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{line.name}</span>
                </div>
              ))}
            </div>
          )}

          {byLine && (
            <div className="flex items-start gap-2 text-xs text-[var(--on-surface-variant)] font-medium px-1">
              <MapPin aria-hidden="true" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <a
                href={venueMapsUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--primary)] transition-colors"
              >
                {byLine}
                <span className="sr-only">{bundle.card.opensInNewTab}</span>
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs"
              >
                <Ticket aria-hidden="true" className="w-4 h-4" />
                {bundle.card.source}
                <span className="sr-only">{bundle.card.sourceHint}</span>
              </a>
            )}
            <AddToCalendarButton event={event} />
            <ShareButton event={event} />
            <ReportCorrectionButton event={event} dates={dates} />
          </div>
        </div>
      )}
    </div>
  );
}
