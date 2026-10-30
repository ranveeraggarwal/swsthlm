'use client';

// The full event card, used in the highlighted grid at the top of the homepage.
// `EventRow` is the compact form for events further out.
//
// It's drawn as the night's music: a stamped ticket, punched out at its stub
// and at its actions, for a live band; a record sleeve for a DJ set. The header
// band carries the time and the badges; see `EventCardHeader`.
//
// Cancelled and ended cards are de-emphasised with border, background tint,
// stripe, badge and (for cancelled) strikethrough — deliberately *not* opacity,
// which would drag all the descendant text below the WCAG AA contrast threshold.

import React, { useEffect, useRef, useState } from 'react';
import { Ticket } from 'lucide-react';
import type { Music } from '@/lib/data/types';
import type { Now } from '@/lib/date/clock';
import { ReportCorrectionButton } from '@/features/corrections/ReportCorrectionButton';
import { domIdFor, type EventGroup } from '../model/event';
import { getTemporalBadge } from '../model/temporal';
import { useLocale } from '@/components/providers/LocaleProvider';
import { AddToCalendarButton } from './AddToCalendarButton';
import { EventCardHeader, TicketNotches, type CardShape } from './EventCardHeader';
import { BeginnerChip, NightsChip, StyleChip, TasterClassChip } from './EventChips';
import { EventFacts } from './EventFacts';
import { FloorTypeBadge } from './FloorTypeBadge';
import { ShareButton } from './ShareButton';
import { badgeStripeClass } from './TemporalBadgeDisplay';

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

// A band on stage gets a ticket; a DJ set gets a record sleeve. `mixed` has a
// band, so it's a ticket — the same call the "Live Music Only" filter makes in
// `../model/sections.ts`. Structure rather than a word or a colour, so it stays
// here, like `FloorTypeBadge`'s icons.
const SHAPE: Record<Music, CardShape> = {
  live: 'ticket',
  mixed: 'ticket',
  dj: 'sleeve',
};

export function EventCard({ group, isThisWeek, showDate, now }: EventCardProps) {
  const { bundle } = useLocale();
  const { event, dates, nightCount } = group;

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  // Touch has no hover, so a tap toggles the lift instead (see `.lift-card`).
  const [lifted, setLifted] = useState(false);
  const lastPointer = useRef('');
  const cardRef = useRef<HTMLDivElement>(null);

  // A tap anywhere outside a lifted card puts it back down.
  useEffect(() => {
    if (!lifted) return;
    const onOutside = (e: PointerEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) setLifted(false);
    };
    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  }, [lifted]);
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
  const shape = SHAPE[event.music];

  // A red halo while it's on. An outline, not a `ring-*`: rings are drawn as a
  // box-shadow, and `.lift-card`'s unlayered box-shadow — the sticker offset —
  // beats every Tailwind utility, so the ring this used to be never rendered.
  const halo = !event.cancelled && badge === 'happening-now' ? 'outline-2 outline-[var(--live)]/30' : '';

  return (
    // A one-column grid, each section pinned to its own row, so a ticket's
    // notches can share a cell with the band or the actions; and no
    // `overflow-hidden`, so they can paint over this card's own border.
    // `isolate` keeps the stripe's z-index below inside the card.
    <div
      ref={cardRef}
      data-lifted={lifted}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType;
      }}
      onClick={(e) => {
        if (lastPointer.current === 'touch' && !(e.target as HTMLElement).closest('a, button')) {
          setLifted((v) => !v);
        }
      }}
      className={`relative isolate lift-card rounded border-2 grid grid-cols-1 text-[var(--on-surface)] ${
        event.cancelled
          ? 'border-[var(--error)]/50 bg-[var(--error-container)]/40'
          : badge === 'ended'
            ? 'border-[var(--ended-surface-outline)] bg-[var(--ended-surface)]'
            : 'border-[var(--border-ink)] bg-[var(--surface-container-low)]'
      } ${halo}`}
    >
      {/* Accent stripe — red for cancelled, temporal colour otherwise. Rounded
          itself, as the card no longer clips its corners, and lifted over the
          header band, which can now have a fill (and a stamp) of its own. */}
      {event.cancelled ? (
        <div className="absolute z-[1] top-0 left-0 right-0 h-1.5 rounded-t-sm bg-[var(--error)]" />
      ) : (
        (isThisWeek || badge) && (
          <div
            className={`absolute z-[1] top-0 left-0 right-0 h-1.5 rounded-t-sm ${badgeStripeClass(badge, isThisWeek)}`}
          />
        )
      )}

      <EventCardHeader group={group} shape={shape} badge={badge} showDate={showDate} />

      <div className="col-start-1 row-start-2 p-5">
        <h3
          title={event.title}
          className={`font-serif text-xl font-bold tracking-tight text-[var(--on-surface)] leading-snug mb-1.5 truncate ${event.cancelled ? 'line-through' : ''}`}
        >
          {event.title}
        </h3>

        {/* The header band already says whether it's a band or a DJ, so
            only a performer's name earns a line here. */}
        <EventFacts
          event={event}
          struckThrough={event.cancelled}
          namedPerformersOnly
          className="mb-4"
        />

        <div className="flex flex-wrap items-center gap-2 font-sans">
          <StyleChip style={event.style} layout="card" />
          <FloorTypeBadge floorType={event.floorType} />
          <NightsChip nightCount={nightCount} />
          <BeginnerChip beginnerClass={event.beginnerClass} />
          <TasterClassChip tasterClass={event.tasterClass} />
        </div>

        {/* Here rather than with the actions, so the header band and the
            actions keep the same height from card to card; only this middle
            section grows with the organizer's prose. */}
        {event.body && (
          <div className="mt-4 font-sans">
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
                className="mt-1 font-sans text-xs font-bold uppercase tracking-wider text-[var(--primary)] hover:underline transition-colors cursor-pointer"
              >
                {descriptionExpanded ? bundle.card.showLess : bundle.card.readMore}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="col-start-1 row-start-3 border-t-2 border-[var(--border-ink)] p-5 flex items-center gap-2 font-sans">
        {event.ticket && (
          <a
            href={event.ticket}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary"
          >
            <Ticket aria-hidden="true" className="w-4 h-4" />
            {bundle.card.source}
            <span className="sr-only">{bundle.card.opensInNewTab}</span>
          </a>
        )}
        <AddToCalendarButton event={event} />
        <ShareButton event={event} />
        <ReportCorrectionButton event={event} dates={dates} />
      </div>

      {shape === 'ticket' && <TicketNotches className="col-start-1 row-start-3 ticket-notch-top" />}
    </div>
  );
}
