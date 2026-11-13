'use client';

// The full event card, used in the highlighted grid at the top of the homepage.
// `EventRow` is the compact form for events further out.
//
// Combines the tactile whimsy of the header band with an Editorial Playbill body:
// 1. `EventCardHeader` (`row-start-1`): a perforated manila ticket stub with
//    punch-outs and a rotating bandstand piece (horn, ribbon mic, or kick drum)
//    for live-band nights, or a record sleeve with a spinning 78 for DJ nights —
//    carrying the time, Live/DJ pill, and Tonight / Tomorrow / This Week badge.
// 2. Editorial Playbill body (`row-start-2`, `1fr`): calm tracked eyebrow
//    (`STYLE · INTRO 19:00`), Besley slab title, concise `price · performer`
//    line, and optional 2-line expandable prose.
// 3. Venue & 5-segment `DanceabilityMeter` band (`row-start-3`): paper-tinted
//    strip so dedicated dance studios (`5/5`) and cozy listening pubs (`1/5`)
//    read apart from across the screen (#467).
// 4. Action footer (`row-start-4`): pinned at the bottom with a second pair of
//    ticket punch-outs on live-music cards (#465).
//
// Cancelled and ended cards are de-emphasised with border, background tint,
// stripe, badge and (for cancelled) strikethrough — deliberately *not* opacity,
// which would drag descendant text below WCAG AA contrast.

import React, { useEffect, useRef, useState } from 'react';
import { Ticket } from 'lucide-react';
import type { Music } from '@/lib/data/types';
import type { Now } from '@/lib/date/clock';
import { ReportCorrectionButton } from '@/features/corrections/ReportCorrectionButton';
import { domIdFor, type EventGroup } from '../model/event';
import {
  beginnerEyebrowLabel,
  cardLiftTilt,
  formatPriceLine,
  isFreePrice,
  musicLines,
  styleEyebrowClass,
  styleLabel,
  tasterEyebrowLabel,
} from '../model/labels';
import { getTemporalBadge } from '../model/temporal';
import { useLocale } from '@/components/providers/LocaleProvider';
import { AddToCalendarButton } from './AddToCalendarButton';
import { DanceabilityMeter } from './DanceabilityMeter';
import { EventCardHeader, TicketNotches, type CardShape } from './EventCardHeader';
import { VenueFact } from './EventFacts';
import { ShareButton } from './ShareButton';
import { badgeStripeClass } from './TemporalBadgeDisplay';

interface EventCardProps {
  group: EventGroup;
  /** Drives the accent stripe when no higher-priority temporal badge applies. */
  isThisWeek: boolean;
  /** Force the date line on, for a card whose section heading doesn't carry it. */
  showDate?: boolean;
  now: Now;
  /** Optional controlled expansion so `HighlightedEvents` can lock sibling heights. */
  expanded?: boolean;
  onToggleExpand?: () => void;
  /** Locked collapsed height while another card in the same grid is expanded. */
  minHeight?: number;
}

/** How many lines of the organizer's description to show before "Read more". */
const DESCRIPTION_CLAMP = 'line-clamp-2';

// A band on stage gets a perforated ticket; a DJ set gets a record sleeve; a
// bill with both (`mixed`) tucks the 78 behind the stamped ticket stub.
const SHAPE: Record<Music, CardShape> = {
  live: 'ticket',
  mixed: 'mixed',
  dj: 'sleeve',
};

export function EventCard({
  group,
  isThisWeek,
  showDate,
  now,
  expanded,
  onToggleExpand,
  minHeight,
}: EventCardProps) {
  const { locale, bundle } = useLocale();
  const { event, dates, nightCount } = group;

  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);
  const descriptionExpanded = expanded ?? uncontrolledExpanded;
  const toggleDescription = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setUncontrolledExpanded((v) => !v);
    }
  };

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
  const isTicket = shape === 'ticket' || shape === 'mixed';
  const isOver = event.cancelled || badge === 'ended';
  const isFree = isFreePrice(event.price) && !isOver;
  const priceLine = formatPriceLine(event.price, event.payment);
  const titleKey = event.title.trim().toLowerCase();
  const namedPerformers = musicLines(event).filter(
    (line) => line.name && line.name.trim().toLowerCase() !== titleKey
  );
  const hasSubline = Boolean(priceLine) || namedPerformers.length > 0;

  // A red halo while it's on. An outline, not a `ring-*`: rings are drawn as a
  // box-shadow, and `.lift-card`'s unlayered box-shadow — the sticker offset —
  // beats every Tailwind utility.
  const halo = !event.cancelled && badge === 'happening-now' ? 'outline-2 outline-[var(--live)]/30' : '';

  const cardStyle: React.CSSProperties = {
    ...(minHeight ? { minHeight } : undefined),
    ...(!isOver ? ({ '--card-tilt': `${cardLiftTilt(event.id)}deg` } as React.CSSProperties) : undefined),
  };

  return (
    // A one-column grid, each section pinned to its own row, so a ticket's
    // notches can share a cell with the header band or the actions; and no
    // `overflow-hidden`, so they can paint over this card's own border.
    // `isolate` keeps the stripe's z-index inside the card.
    <div
      ref={cardRef}
      data-card-id={event.id}
      data-lifted={lifted}
      style={cardStyle}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType;
      }}
      onClick={(e) => {
        if (lastPointer.current === 'touch' && !(e.target as HTMLElement).closest('a, button')) {
          setLifted((v) => !v);
        }
      }}
      className={`relative isolate lift-card rounded border-2 grid grid-cols-1 grid-rows-[auto_1fr_auto_auto] text-[var(--on-surface)] ${
        event.cancelled
          ? 'border-[var(--error)]/50 bg-[var(--error-container)]/40'
          : badge === 'ended'
            ? 'border-[var(--ended-surface-outline)] bg-[var(--ended-surface)]'
            : 'border-[var(--border-ink)] bg-[var(--surface-container-low)]'
      } ${halo}`}
    >
      {/* Accent stripe — red for cancelled, temporal colour otherwise. Rounded
          itself, as the card doesn't clip its corners, and lifted over the
          header band. */}
      {event.cancelled ? (
        <div className="absolute z-[1] top-0 left-0 right-0 h-1.5 rounded-t-sm bg-[var(--error)]" />
      ) : (
        (isThisWeek || badge) && (
          <div
            className={`absolute z-[1] top-0 left-0 right-0 h-1.5 rounded-t-sm ${badgeStripeClass(badge, isThisWeek)}`}
          />
        )
      )}

      {/* Row 1: Tactile ticket stub / record sleeve header + temporal badges */}
      <EventCardHeader group={group} shape={shape} badge={badge} showDate={showDate} />

      {/* Row 2: Editorial Playbill body */}
      <div className="col-start-1 row-start-2 p-5 flex flex-col">
        {/* Calm tracked eyebrow: style + multi-night + intro/taster callouts */}
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[11px] font-bold uppercase tracking-widest mb-1.5 font-sans">
          <span className={isOver ? 'text-[var(--on-surface-variant)]' : styleEyebrowClass(event.style)}>
            {styleLabel(event.style, { compact: true }, locale)}
          </span>
          {nightCount > 1 && (
            <>
              <span aria-hidden="true" className="text-[var(--outline)]">
                ·
              </span>
              <span
                className={
                  isOver ? 'text-[var(--on-surface-variant)]' : 'text-[var(--on-info-container)]'
                }
              >
                {nightCount} {bundle.card.nights.other}
              </span>
            </>
          )}
          {event.beginnerClass && (
            <>
              <span aria-hidden="true" className="text-[var(--outline)]">
                ·
              </span>
              <span
                className={
                  isOver ? 'text-[var(--on-surface-variant)]' : 'text-[var(--on-success-container)]'
                }
              >
                {beginnerEyebrowLabel(event.beginnerClass, locale)}
              </span>
            </>
          )}
          {event.tasterClass && (
            <>
              <span aria-hidden="true" className="text-[var(--outline)]">
                ·
              </span>
              <span
                className={
                  isOver ? 'text-[var(--on-surface-variant)]' : 'text-[var(--on-info-container)]'
                }
              >
                {tasterEyebrowLabel(event.tasterClass, locale)}
              </span>
            </>
          )}
        </div>

        <h3
          title={event.title}
          className={`font-serif text-xl font-bold tracking-tight text-[var(--on-surface)] leading-snug line-clamp-2 ${
            event.cancelled ? 'line-through' : ''
          }`}
        >
          {event.title}
        </h3>

        {/* Flowing Playbill subline: price · named performer */}
        {hasSubline && (
          <p className="mt-1.5 font-sans text-sm text-[var(--on-surface-variant)] leading-relaxed">
            {priceLine && (
              <span className={isFree ? 'font-semibold text-[var(--on-success-container)]' : ''}>
                {isFree && (
                  <span aria-hidden="true" className="mr-1">
                    ✦
                  </span>
                )}
                {priceLine}
              </span>
            )}
            {namedPerformers.map((line, index) => (
              <React.Fragment key={line.type}>
                {(priceLine || index > 0) && (
                  <span aria-hidden="true" className="mx-1.5 text-[var(--outline)]">
                    ·
                  </span>
                )}
                <span>
                  <span className="sr-only">
                    {line.type === 'live' ? bundle.card.livePrefix : bundle.card.djPrefix}
                  </span>
                  <span className="font-medium text-[var(--on-surface)]">{line.name}</span>
                </span>
              </React.Fragment>
            ))}
          </p>
        )}

        {event.body && (
          <div className="mt-3 font-sans">
            <p
              ref={descriptionRef}
              id={descriptionId}
              className={`text-sm text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line ${
                descriptionExpanded ? '' : DESCRIPTION_CLAMP
              }`}
            >
              {event.body}
            </p>
            {descriptionTruncated && (
              <button
                type="button"
                onClick={toggleDescription}
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

      {/* Row 3: Venue & full-width 5-segment danceability band */}
      <div
        className={`col-start-1 row-start-3 px-5 py-3.5 border-t border-[var(--surface-container-highest)] font-sans text-xs ${
          isOver ? '' : 'bg-[var(--surface-container)]'
        }`}
      >
        <VenueFact event={event} struckThrough={event.cancelled} />
        <DanceabilityMeter danceability={event.danceability} muted={isOver} className="mt-2.5" />
      </div>

      {/* Row 4: Action footer — perforated like the header stub on ticket cards */}
      <div
        className={`col-start-1 row-start-4 border-t-2 px-5 py-3.5 flex items-center gap-2 font-sans ${
          isTicket ? 'border-dashed border-[var(--shadow-ink)]' : 'border-[var(--border-ink)]'
        }`}
      >
        {event.ticket && (
          <a
            href={event.ticket}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary"
          >
            <Ticket aria-hidden="true" className="w-4 h-4 ticket-snip" />
            {bundle.card.source}
            <span className="sr-only">{bundle.card.opensInNewTab}</span>
          </a>
        )}
        <AddToCalendarButton event={event} />
        <ShareButton event={event} />
        <ReportCorrectionButton event={event} dates={dates} />
      </div>

      {isTicket && <TicketNotches className="col-start-1 row-start-4 ticket-notch-top" />}
    </div>
  );
}
