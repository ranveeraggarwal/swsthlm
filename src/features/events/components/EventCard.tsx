'use client';

// The full event card, used in the highlighted grid at the top of the homepage.
// `EventRow` is the compact form for events further out.
//
// Structured as an Editorial Playbill:
// 1. Calm tracked eyebrow (style + intro/taster callout on the left, live/DJ
//    indicator on the right — no competing pill boxes), Besley slab title,
//    flowing dateline sentence (time · price · named performer), and optional
//    2-line organizer prose.
// 2. Full-width paper-tinted venue & 5-segment danceability band pinned above
//    the footer so studios (`5/5`) and cozy listening pubs (`1/5`) read apart
//    from across the screen (#467).
// 3. Action footer pinned at the bottom of the card so cards sharing a row
//    align cleanly (#465).
//
// Cancelled and ended cards are de-emphasised with border, background tint,
// stripe, badge and (for cancelled) strikethrough — deliberately *not* opacity,
// which would drag descendant text below WCAG AA contrast.

import React, { useEffect, useRef, useState } from 'react';
import { Ticket } from 'lucide-react';
import type { Now } from '@/lib/date/clock';
import { formatEventDateRange, formatEventDateShort } from '@/lib/date/format';
import { ReportCorrectionButton } from '@/features/corrections/ReportCorrectionButton';
import { domIdFor, type EventGroup } from '../model/event';
import {
  beginnerEyebrowLabel,
  formatPriceLine,
  isFreePrice,
  musicBadgeLabel,
  musicLines,
  styleEyebrowClass,
  styleLabel,
  tasterEyebrowLabel,
} from '../model/labels';
import { getTemporalBadge } from '../model/temporal';
import { useLocale } from '@/components/providers/LocaleProvider';
import { AddToCalendarButton } from './AddToCalendarButton';
import { DanceabilityMeter } from './DanceabilityMeter';
import { VenueFact } from './EventFacts';
import { ShareButton } from './ShareButton';
import { badgeStripeClass, TemporalBadgeDisplay } from './TemporalBadgeDisplay';

interface EventCardProps {
  group: EventGroup;
  /** Drives the accent stripe when no higher-priority temporal badge applies. */
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
  const isOver = event.cancelled || badge === 'ended';
  const showUrgentBadge = badge === 'happening-now' || badge === 'ended';
  const showDateLine = nightCount > 1 || Boolean(showDate);
  const priceLine = formatPriceLine(event.price, event.payment);
  const titleKey = event.title.trim().toLowerCase();
  const namedPerformers = musicLines(event).filter(
    (line) => line.name && line.name.trim().toLowerCase() !== titleKey
  );
  const isLiveMusic = event.music === 'live' || event.music === 'mixed';

  // A red halo while it's on. An outline, not a `ring-*`: rings are drawn as a
  // box-shadow, and `.lift-card`'s unlayered box-shadow — the sticker offset —
  // beats every Tailwind utility.
  const halo = !event.cancelled && badge === 'happening-now' ? 'outline-2 outline-[var(--live)]/30' : '';

  return (
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
      className={`relative isolate lift-card rounded border-2 overflow-hidden grid grid-cols-1 grid-rows-[1fr_auto_auto] text-[var(--on-surface)] ${
        event.cancelled
          ? 'border-[var(--error)]/50 bg-[var(--error-container)]/40'
          : badge === 'ended'
            ? 'border-[var(--ended-surface-outline)] bg-[var(--ended-surface)]'
            : 'border-[var(--border-ink)] bg-[var(--surface-container-low)]'
      } ${halo}`}
    >
      {/* Accent stripe — red for cancelled, temporal colour otherwise. */}
      {event.cancelled ? (
        <div className="absolute z-[1] top-0 left-0 right-0 h-1.5 bg-[var(--error)]" />
      ) : (
        (isThisWeek || badge) && (
          <div
            className={`absolute z-[1] top-0 left-0 right-0 h-1.5 ${badgeStripeClass(badge, isThisWeek)}`}
          />
        )
      )}

      {/* Zone 1: Editorial Playbill body */}
      <div className="p-5 pt-5 flex flex-col">
        {(event.cancelled || showUrgentBadge || showDateLine) && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 font-sans">
            {showDateLine ? (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
                {nightCount > 1
                  ? `${formatEventDateRange(dates[0], dates[dates.length - 1], locale)} · ${nightCount} ${bundle.card.nights.other}`
                  : formatEventDateShort(dates[0], locale)}
              </span>
            ) : (
              <span />
            )}
            {event.cancelled ? (
              <span className="px-2 py-0.5 rounded bg-[var(--error)] text-[var(--on-error)] text-[10px] uppercase font-bold tracking-wider">
                {bundle.card.cancelled}
              </span>
            ) : (
              showUrgentBadge && <TemporalBadgeDisplay badge={badge} />
            )}
          </div>
        )}

        {/* Calm tracked eyebrow: style + class on left, live/DJ accent on right */}
        <div className="flex items-baseline justify-between gap-3 text-[11px] font-bold uppercase tracking-widest mb-2 font-sans">
          <div className="min-w-0 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className={isOver ? 'text-[var(--on-surface-variant)]' : styleEyebrowClass(event.style)}>
              {styleLabel(event.style, { compact: true }, locale)}
            </span>
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

          <span
            className={`shrink-0 whitespace-nowrap ${
              isLiveMusic && !isOver ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'
            }`}
          >
            {isLiveMusic && <span aria-hidden="true">● </span>}
            {musicBadgeLabel(event.music, locale)}
          </span>
        </div>

        <h3
          title={event.title}
          className={`font-serif text-xl font-bold tracking-tight text-[var(--on-surface)] leading-snug mb-2 line-clamp-2 ${
            event.cancelled ? 'line-through' : ''
          }`}
        >
          {event.title}
        </h3>

        {/* Flowing dateline sentence: time · price · named performer */}
        <p className="font-sans text-sm text-[var(--on-surface-variant)] leading-relaxed">
          <span
            className={`font-bold tabular-nums text-[var(--on-surface)] whitespace-nowrap ${
              event.cancelled ? 'line-through' : ''
            }`}
          >
            {event.start}–{event.end}
          </span>
          {priceLine && (
            <>
              <span aria-hidden="true" className="mx-1.5 text-[var(--outline)]">
                ·
              </span>
              <span
                className={
                  isFreePrice(event.price) && !isOver
                    ? 'font-semibold text-[var(--on-success-container)]'
                    : ''
                }
              >
                {priceLine}
              </span>
            </>
          )}
          {namedPerformers.map((line) => (
            <React.Fragment key={line.type}>
              <span aria-hidden="true" className="mx-1.5 text-[var(--outline)]">
                ·
              </span>
              <span>
                <span className="sr-only">
                  {line.type === 'live' ? bundle.card.livePrefix : bundle.card.djPrefix}
                </span>
                <span className="font-medium text-[var(--on-surface)]">{line.name}</span>
              </span>
            </React.Fragment>
          ))}
        </p>

        {event.body && (
          <div className="mt-3.5 font-sans">
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

      {/* Zone 2: Venue & full-width 5-segment danceability band */}
      <div
        className={`px-5 py-3.5 border-t border-[var(--surface-container-highest)] font-sans text-xs ${
          isOver ? '' : 'bg-[var(--surface-container)]'
        }`}
      >
        <VenueFact event={event} struckThrough={event.cancelled} />
        <DanceabilityMeter danceability={event.danceability} muted={isOver} className="mt-2.5" />
      </div>

      {/* Zone 3: Action footer */}
      <div className="border-t-2 border-[var(--border-ink)] px-5 py-3.5 flex items-center gap-2 font-sans">
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
    </div>
  );
}
