'use client';

// The band across the top of an event card, drawn as the night's music: a
// ticket stub when a band is playing, a record sleeve with a 78 peeking out
// when a DJ is. It carries the time and the badges, so the kind of night
// reads before the title does.
//
// It's printed on the card's own paper, in the card's own ink — the shapes do
// the telling, not a new colour — so an ended or cancelled card's surface
// shows straight through it.

import React from 'react';
import type { Music } from '@/lib/data/types';
import { formatEventDateRange, formatEventDateShort } from '@/lib/date/format';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { EventGroup } from '../model/event';
import { musicBadgeLabel } from '../model/labels';
import type { TemporalBadge } from '../model/temporal';
import { TemporalBadgeDisplay } from './TemporalBadgeDisplay';

// A band on stage gets a ticket stub; a DJ set gets a record sleeve. `mixed`
// has a band, so it's a ticket — the same call the "Live Music Only" filter
// makes in `../model/sections.ts`. Structure rather than a word or a colour,
// so it stays here, like `FloorTypeBadge`'s icons.
const SHAPE: Record<Music, 'ticket' | 'sleeve'> = {
  live: 'ticket',
  mixed: 'ticket',
  dj: 'sleeve',
};

/**
 * The header band, plus a ticket's two punch-out notches.
 *
 * The notches come back as the band's siblings, for the card's grid, rather
 * than inside it: they take their rim colour from the card's border (see
 * `.ticket-notch` in `globals.css`), which only works for the card's own
 * children. Sharing the band's grid cell is what puts them on its bottom
 * edge, whatever its height.
 */
export function EventCardHeader({
  group,
  badge,
  showDate,
}: {
  group: EventGroup;
  badge: TemporalBadge;
  showDate?: boolean;
}) {
  const { locale, bundle } = useLocale();
  const { event, dates, nightCount } = group;
  const isTicket = SHAPE[event.music] === 'ticket';

  return (
    <>
      <div
        className={`relative col-start-1 row-start-1 rounded-t-sm border-b-2 border-[var(--border-ink)] px-5 pt-5 pb-4 font-sans ${
          // The ticket's perforation; the sleeve's edge, and room on the right
          // for the record.
          isTicket ? 'border-dashed' : 'overflow-hidden pr-28'
        }`}
      >
        {(nightCount > 1 || showDate) && (
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-0.5">
            {nightCount > 1
              ? formatEventDateRange(dates[0], dates[dates.length - 1], locale)
              : formatEventDateShort(dates[0], locale)}
          </div>
        )}
        <div
          className={`text-lg font-bold tabular-nums tracking-tight leading-tight text-[var(--on-surface)] ${event.cancelled ? 'line-through' : ''}`}
        >
          {event.start} – {event.end}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="px-2.5 py-0.5 rounded border border-[var(--border-ink)] text-[var(--on-surface)] text-[11px] font-bold uppercase tracking-wider">
            {musicBadgeLabel(event.music, locale)}
          </span>
          {event.cancelled ? (
            <span className="px-2.5 py-0.5 rounded bg-[var(--error)] text-[var(--on-error)] text-[10px] uppercase font-bold tracking-wider">
              {bundle.card.cancelled}
            </span>
          ) : (
            <TemporalBadgeDisplay badge={badge} />
          )}
        </div>

        {!isTicket && <SleeveRecord faded={event.cancelled || badge === 'ended'} />}
      </div>

      {isTicket && (
        <>
          <span aria-hidden="true" className="ticket-notch ticket-notch-start col-start-1 row-start-1" />
          <span aria-hidden="true" className="ticket-notch ticket-notch-end col-start-1 row-start-1" />
        </>
      )}
    </>
  );
}

/** An SVG subpath for a circle of radius `r`, centred in a 100×100 viewBox. */
const circle = (r: number) =>
  `M${50 - r} 50a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;

/**
 * The 78 in a DJ card's sleeve, drawn flat in the card's own ink: disc,
 * grooves, two glints and a label, with the spindle hole cut clean through so
 * the card shows behind it. The glints are what make the hover turn visible —
 * a plain disc looks the same at any angle.
 */
function SleeveRecord({ faded }: { faded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      className={`sleeve-record absolute -right-4 top-3 w-28 h-28 ${faded ? 'grayscale opacity-50' : ''}`}
    >
      <path className="fill-[var(--border-ink)]" fillRule="evenodd" d={circle(50) + circle(2.5)} />
      <g className="fill-none stroke-[var(--outline)]" strokeOpacity={0.45} strokeWidth={0.75}>
        <circle cx="50" cy="50" r="44" />
        <circle cx="50" cy="50" r="37" />
        <circle cx="50" cy="50" r="30" />
      </g>
      {/* 200°–240° and 20°–60° (clockwise from three o'clock), at r=41. */}
      <g className="fill-none stroke-[var(--outline)]" strokeWidth={2} strokeLinecap="round">
        <path d="M11.47 35.98A41 41 0 0 1 29.5 14.49" />
        <path d="M88.53 64.02A41 41 0 0 1 70.5 85.51" />
      </g>
      <path className="fill-[var(--primary)]" fillRule="evenodd" d={circle(17) + circle(2.5)} />
    </svg>
  );
}
