'use client';

// The full event card, used in the highlighted grid at the top of the homepage.
// `EventRow` is the compact form for events further out.
//
// Cancelled and ended cards are de-emphasised with border, background tint,
// stripe, badge and (for cancelled) strikethrough — deliberately *not* opacity,
// which would drag all the descendant text below the WCAG AA contrast threshold.

import React, { useEffect, useRef, useState } from 'react';
import { Ticket } from 'lucide-react';
import type { Now } from '@/lib/date/clock';
import { formatEventDateRange, formatEventDateShort } from '@/lib/date/format';
import { ReportCorrectionButton } from '@/features/corrections/ReportCorrectionButton';
import { domIdFor, type EventGroup } from '../model/event';
import { getTemporalBadge } from '../model/temporal';
import { useLocale } from '@/components/providers/LocaleProvider';
import { AddToCalendarButton } from './AddToCalendarButton';
import { BeginnerChip, NightsChip, StyleChip } from './EventChips';
import { EventFacts } from './EventFacts';
import { FloorTypeBadge } from './FloorTypeBadge';
import { ShareButton } from './ShareButton';
import { TemporalBadgeDisplay, badgeStripeClass } from './TemporalBadgeDisplay';

interface EventCardProps {
  group: EventGroup;
  /** Drives the "This Week" badge, and the accent stripe when no other badge applies. */
  isThisWeek: boolean;
  /** Force the date line on, for a card whose section heading doesn't carry it. */
  showDate?: boolean;
  now: Now;
}

/** How many lines of the organizer's description to show before "Read more". */
const DESCRIPTION_CLAMP = 'line-clamp-2';

export function EventCard({ group, isThisWeek, showDate, now }: EventCardProps) {
  const { locale, bundle } = useLocale();
  const { event, dates, nightCount } = group;

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionTruncated, setDescriptionTruncated] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const descriptionId = domIdFor(event, 'event-desc');

  // "Read more" only appears if the text is actually clipped, which can only be
  // measured after layout.
  useEffect(() => {
    const el = descriptionRef.current;
    if (!el || descriptionExpanded) return;
    setDescriptionTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [event.body, descriptionExpanded]);

  const badge = getTemporalBadge(event, now, isThisWeek);
  const isMultiNight = nightCount > 1;

  return (
    <div
      className={`relative lift-card rounded border-2 overflow-hidden flex flex-col text-[var(--on-surface)] ${
        event.cancelled
          ? 'border-[var(--error)]/50 bg-[var(--error-container)]/40'
          : badge === 'ended'
            ? 'border-[var(--ended-surface-outline)] bg-[var(--ended-surface)]'
            : 'border-[var(--border-ink)] bg-[var(--surface-container-low)]'
      } ${!event.cancelled && badge === 'happening-now' ? 'ring-2 ring-[var(--live)]/30' : ''}`}
    >
      {/* Accent stripe — red for cancelled, temporal colour otherwise. */}
      {event.cancelled ? (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--error)]" />
      ) : (
        (isThisWeek || badge) && (
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${badgeStripeClass(badge, isThisWeek)}`}
          />
        )
      )}

      <div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              {(isMultiNight || showDate) && (
                <div className="font-sans text-xs text-[var(--on-surface-variant)] mb-0.5 font-medium">
                  {isMultiNight
                    ? formatEventDateRange(dates[0], dates[dates.length - 1], locale)
                    : formatEventDateShort(dates[0], locale)}
                </div>
              )}
              <span
                className={`font-sans font-bold text-base tabular-nums tracking-tight text-[var(--on-surface)] ${event.cancelled ? 'line-through' : ''}`}
              >
                {event.start} – {event.end}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {event.cancelled ? (
                <span className="px-2.5 py-0.5 rounded bg-[var(--error)] text-[var(--on-error)] text-[10px] uppercase font-bold tracking-wider">
                  {bundle.card.cancelled}
                </span>
              ) : (
                <TemporalBadgeDisplay badge={badge} />
              )}
            </div>
          </div>

          <h3
            title={event.title}
            className={`font-serif text-xl font-bold tracking-tight text-[var(--on-surface)] leading-snug mb-1.5 truncate ${event.cancelled ? 'line-through' : ''}`}
          >
            {event.title}
          </h3>

          <EventFacts event={event} struckThrough={event.cancelled} className="mb-4" />

          <div className="flex flex-wrap items-center gap-2 font-sans">
            <StyleChip style={event.style} layout="card" />
            <FloorTypeBadge floorType={event.floorType} />
            <NightsChip nightCount={nightCount} />
            <BeginnerChip beginnerClass={event.beginnerClass} />
          </div>
        </div>

        <div className="border-t-2 border-[var(--border-ink)] p-5 space-y-3 font-sans">
          {event.body && (
            <div>
              <p
                ref={descriptionRef}
                id={descriptionId}
                className={`text-sm text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line ${descriptionExpanded ? '' : DESCRIPTION_CLAMP}`}
              >
                {event.body}
              </p>
              {descriptionTruncated && (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded((v) => !v)}
                  aria-expanded={descriptionExpanded}
                  aria-controls={descriptionId}
                  className="mt-1 font-sans text-xs font-bold uppercase tracking-wider text-[var(--primary)] hover:underline"
                >
                  {descriptionExpanded ? bundle.card.showLess : bundle.card.readMore}
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {event.ticket && (
              <a
                href={event.ticket}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary"
              >
                <Ticket className="w-4 h-4" />
                {bundle.card.source}
                <span className="sr-only">{bundle.card.sourceHint}</span>
              </a>
            )}
            <AddToCalendarButton event={event} />
            <ShareButton event={event} />
            <ReportCorrectionButton event={event} dates={dates} />
          </div>
        </div>
      </div>
    </div>
  );
}
