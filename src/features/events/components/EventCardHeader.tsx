'use client';

// The band across the top of an event card, drawn as the night's music: a
// ticket stub, inked with an admission stamp, when a band is playing; a record
// sleeve with a 78 half out of it when a DJ is. It carries the time and the
// badges, so the kind of night reads before the title does.
//
// It's printed on the card's own paper, in the card's own ink — the shapes do
// the telling, not a new colour — so an ended or cancelled card's surface
// shows straight through it.

import React, { useId } from 'react';
import { formatEventDateRange, formatEventDateShort } from '@/lib/date/format';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { EventGroup } from '../model/event';
import { musicBadgeLabel } from '../model/labels';
import type { TemporalBadge } from '../model/temporal';
import { TemporalBadgeDisplay } from './TemporalBadgeDisplay';

export type CardShape = 'ticket' | 'sleeve';

/**
 * The header band, plus a ticket's punch-outs at the foot of it.
 *
 * The notches come back as the band's siblings, for the card's grid, rather
 * than inside it — see `TicketNotches`.
 */
export function EventCardHeader({
  group,
  shape,
  badge,
  showDate,
}: {
  group: EventGroup;
  shape: CardShape;
  badge: TemporalBadge;
  showDate?: boolean;
}) {
  const { locale, bundle } = useLocale();
  const { event, dates, nightCount } = group;
  const isTicket = shape === 'ticket';
  const isOver = event.cancelled || badge === 'ended';

  return (
    <>
      <div
        className={`relative col-start-1 row-start-1 rounded-t-sm border-b-2 border-[var(--border-ink)] overflow-hidden px-5 pt-5 pb-4 font-sans ${
          // The ticket's perforation, or the sleeve's edge — and room on the
          // right for the stamp or the record, which the band clips.
          isTicket ? 'border-dashed pr-26' : 'pr-32'
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

        {isTicket ? (
          <AdmissionStamp impression={event.id} faded={isOver} />
        ) : (
          <SleeveRecord faded={isOver} />
        )}
      </div>

      {isTicket && <TicketNotches className="col-start-1 row-start-1 ticket-notch-bottom" />}
    </>
  );
}

/**
 * A ticket's two punch-outs, one on each edge of the card, centred on the
 * bottom or top edge of the grid row `className` places them in.
 *
 * They have to be the card's own children: they take their rim colour from
 * the card's border (see `.ticket-notch` in `globals.css`). Sharing a grid
 * cell with the band or the actions is what lines them up with its
 * perforation or divider, whatever its height.
 */
export function TicketNotches({ className }: { className: string }) {
  return (
    <>
      <span aria-hidden="true" className={`ticket-notch ticket-notch-start ${className}`} />
      <span aria-hidden="true" className={`ticket-notch ticket-notch-end ${className}`} />
    </>
  );
}

/**
 * A small, stable number from a string: the same on the server and in the
 * browser, so anything drawn from it can't trip hydration.
 */
function hashOf(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/**
 * A live night's admission stamp, inked across the ticket's corner and half
 * off the edge, the way a hurried one at the door lands. Decoration only —
 * the badge beside the time is what says "Live band" — but its words are
 * still read from the locale bundle, since a Swedish visitor sees them.
 *
 * Rubber never prints clean, so it's inked like the real thing: flecks where
 * the ink didn't take, edges a touch ragged, one side pressed harder than the
 * other. And no two land alike — `impression` (the event's id) picks each
 * one's slant and fleck pattern, so a page of tickets isn't a page of clip-art.
 *
 * The lettering runs round two arcs with `<textPath>`, and the ink is a
 * filter and a mask, all of which need ids; each card's are its own, from
 * `useId`, so a page of stamps can't cross-wire.
 */
function AdmissionStamp({ impression, faded }: { impression: string; faded: boolean }) {
  const { bundle } = useLocale();
  const id = `stamp-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const words = bundle.card.admissionStamp;
  const hash = hashOf(impression);
  const tilt = -(9 + (hash % 9)); // -9° to -17°
  const seed = hash % 997;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 120 120"
      style={{ '--stamp-tilt': `${tilt}deg` } as React.CSSProperties}
      className={`ticket-stamp absolute -top-1.5 -right-0.5 w-24 h-24 ${
        faded ? 'text-[var(--outline)]' : 'text-[var(--primary)]'
      }`}
    >
      <defs>
        {/* Over the top, left to right, letters standing outward... */}
        <path id={`${id}-top`} d="M22 60a38 38 0 0 1 76 0" />
        {/* ...and under the bottom, left to right, letters standing inward. */}
        <path id={`${id}-bottom`} d="M14 60a46 46 0 0 0 92 0" />

        <filter id={`${id}-ink`} x="-5%" y="-5%" width="110%" height="110%">
          {/* Ragged edges: nudge every line by a pixel or so of noise... */}
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={seed} result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale={1} xChannelSelector="R" yChannelSelector="G" result="ragged" />
          {/* ...then knock out flecks where the noise runs high: full ink
              below 0.6, none above 0.7. */}
          <feTurbulence type="fractalNoise" baseFrequency={0.45} numOctaves={3} seed={seed + 1} result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -10 0 0 0 7" result="flecks" />
          <feComposite in="ragged" in2="flecks" operator="in" />
        </filter>

        {/* Pressed harder at the top left, lifting off towards the bottom right. */}
        <linearGradient id={`${id}-press`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.25" stopOpacity={1} />
          <stop offset="1" stopOpacity={0.7} />
        </linearGradient>
        <mask id={`${id}-pressure`} style={{ maskType: 'alpha' }}>
          <rect width="120" height="120" fill={`url(#${id}-press)`} />
        </mask>
      </defs>

      <g mask={`url(#${id}-pressure)`}>
        <g filter={`url(#${id}-ink)`}>
          <g className="fill-none stroke-current">
            <circle cx="60" cy="60" r="56" strokeWidth={3.5} />
            <circle cx="60" cy="60" r="51" strokeWidth={1.2} />
            <circle cx="60" cy="60" r="33" strokeWidth={1.2} />
          </g>
          <g className="fill-current font-sans uppercase" fontSize={9.5} fontWeight={800} letterSpacing={1.5}>
            <text>
              <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">
                {words.top}
              </textPath>
            </text>
            <text>
              <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle">
                {words.bottom}
              </textPath>
            </text>
            <circle cx="18" cy="60" r="1.8" />
            <circle cx="102" cy="60" r="1.8" />
            <polygon points="60,47 63.23,55.55 72.36,55.98 65.23,61.7 67.64,70.52 60,65.5 52.36,70.52 54.77,61.7 47.64,55.98 56.77,55.55" />
          </g>
        </g>
      </g>
    </svg>
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
      className={`sleeve-record absolute right-3 ${faded ? 'grayscale opacity-50' : ''}`}
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
