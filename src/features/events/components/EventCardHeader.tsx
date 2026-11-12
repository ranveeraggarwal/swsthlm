'use client';

// The band across the top of an event card, drawn as the night's music: a
// ticket stub with the band's instruments propped in its corner (see
// `BandstandInstruments`) when a band is playing; a record
// sleeve with a style-labelled 78 half out of it when a DJ is; or both
// together when a band and a DJ share the bill. It carries the time and the
// badges, so the kind of night reads before the title does.
//
// It's printed in the card's own ink, and on its own paper — bar a ticket's
// stub, which is tan stock (`--ticket-stock`). The shapes do the telling, so
// an ended or cancelled card drops the tan and its muted surface shows
// straight through, with a rubber box overprint when the night is cancelled.

import React, { useId } from 'react';
import { Music as MusicNote, Music2 } from 'lucide-react';
import type { Style } from '@/lib/data/types';
import { formatEventDateRange, formatEventDateShort } from '@/lib/date/format';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { EventGroup } from '../model/event';
import { hashOf, musicBadgeLabel, recordLabelTone } from '../model/labels';
import type { TemporalBadge } from '../model/temporal';
import { BandstandInstruments } from './BandstandInstruments';
import { TemporalBadgeDisplay } from './TemporalBadgeDisplay';

export type CardShape = 'ticket' | 'sleeve' | 'mixed';

/**
 * The header band, plus a ticket's punch-outs at the foot of it (and floating
 * notes above the corner while the night is happening right now).
 *
 * The notches and notes come back as the band's siblings, for the card's grid,
 * rather than inside it — see `TicketNotches`.
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
  const isTicket = shape === 'ticket' || shape === 'mixed';
  const hasRecord = shape === 'sleeve' || shape === 'mixed';
  const isOver = event.cancelled || badge === 'ended';
  const isLiveNow = badge === 'happening-now' && !event.cancelled;

  const clearance =
    shape === 'mixed' ? 'pr-38' : isTicket ? 'pr-30' : 'pr-32';

  return (
    <>
      <div
        className={`relative col-start-1 row-start-1 rounded-t-sm border-b-2 overflow-hidden px-5 pt-5 pb-4 font-sans ${clearance} ${
          isTicket
            ? // The perforation: slots punched through the stock, so inked in
              // the deepest tone rather than as a keyline — the same as
              // --border-ink in light; in dark, an umber dash would vanish into
              // the kraft. Room on the right for the instruments (and on mixed
              // nights the 78 beside them), which the band clips. The stub is printed on
              // tan stock unless the night is over: then it takes the card's
              // own muted surface, like the rest.
              `border-dashed border-[var(--shadow-ink)] ${isOver ? '' : 'bg-[var(--ticket-stock)]'}`
            : // The sleeve's edge, and room on the right for the record.
              'border-[var(--border-ink)]'
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

        {hasRecord && (
          <SleeveRecord
            style={event.style}
            faded={isOver}
            spinning={isLiveNow}
            mixed={shape === 'mixed'}
          />
        )}
        {isTicket && !event.cancelled && (
          <BandstandInstruments
            style={event.style}
            faded={isOver}
            playing={isLiveNow}
            mixed={shape === 'mixed'}
          />
        )}
        {event.cancelled && <CancelledStamp impression={event.id} />}
      </div>

      {isTicket && <TicketNotches className="col-start-1 row-start-1 ticket-notch-bottom" />}
      {/* A band's horns blow their own notes; a lone turntable gets these. */}
      {isLiveNow && shape === 'sleeve' && <LiveHeaderNotes />}
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
 * Two eighth notes drifting up from the turntable corner while a DJ night is
 * event is happening right now. Placed on the outer grid cell so the header
 * band's `overflow-hidden` doesn't clip them at the top edge.
 */
function LiveHeaderNotes() {
  return (
    <span
      aria-hidden="true"
      className="col-start-1 row-start-1 justify-self-end self-start -mt-1.5 mr-6 z-[2] pointer-events-none flex items-center gap-1 text-[var(--live)]"
    >
      <MusicNote
        className="w-3.5 h-3.5 card-live-note"
        style={{ '--drift-x': '-8px', '--sway': '-18deg' } as React.CSSProperties}
      />
      <Music2
        className="w-3.5 h-3.5 card-live-note"
        style={
          {
            '--drift-x': '12px',
            '--sway': '16deg',
            animationDelay: '1.1s',
          } as React.CSSProperties
        }
      />
    </span>
  );
}

/**
 * Shared SVG `<defs>` for rubber-stamp ink: ragged edges via displacement
 * noise, dry-ink flecks knocked out where a coarser noise field peaks, and an
 * uneven hand-pressure alpha mask.
 */
function RubberInkDefs({ id, seed }: { id: string; seed: number }) {
  return (
    <>
      <filter id={`${id}-ink`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={0.9}
          numOctaves={2}
          seed={seed}
          result="wobble"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="wobble"
          scale={1}
          xChannelSelector="R"
          yChannelSelector="G"
          result="ragged"
        />
        <feTurbulence
          type="fractalNoise"
          baseFrequency={0.45}
          numOctaves={3}
          seed={seed + 1}
          result="grain"
        />
        <feColorMatrix
          in="grain"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -10 0 0 0 7"
          result="flecks"
        />
        <feComposite in="ragged" in2="flecks" operator="in" />
      </filter>

      <linearGradient id={`${id}-press`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0.25" stopOpacity={1} />
        <stop offset="1" stopOpacity={0.7} />
      </linearGradient>
      <mask id={`${id}-pressure`} style={{ maskType: 'alpha' }}>
        <rect width="140" height="140" fill={`url(#${id}-press)`} />
      </mask>
    </>
  );
}

/**
 * Double-ruled rectangular rubber overprint stamped across a cancelled card's
 * corner ("CANCELLED" / "INSTÄLLT"), textured with the same dry-ink grain.
 */
function CancelledStamp({ impression }: { impression: string }) {
  const { bundle } = useLocale();
  const id = `cancel-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const hash = hashOf(impression);
  const tilt = -(7 + (hash % 7)); // -7° to -13°
  const seed = (hash + 131) % 997;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 132 52"
      style={{ '--stamp-tilt': `${tilt}deg` } as React.CSSProperties}
      className="cancelled-stamp absolute top-3.5 right-1.5 w-27 h-11 z-[1] text-[var(--error)]"
    >
      <defs>
        <RubberInkDefs id={id} seed={seed} />
      </defs>
      <g mask={`url(#${id}-pressure)`}>
        <g filter={`url(#${id}-ink)`}>
          <g className="fill-none stroke-current">
            <rect x="3" y="3" width="126" height="46" rx="3" strokeWidth={3.2} />
            <rect x="7.5" y="7.5" width="117" height="37" rx="1.5" strokeWidth={1.1} />
          </g>
          <text
            x="66"
            y="30.5"
            textAnchor="middle"
            className="fill-current font-sans uppercase"
            fontSize={12}
            fontWeight={800}
            letterSpacing={2}
          >
            {bundle.card.cancelled}
          </text>
        </g>
      </g>
    </svg>
  );
}

/** An SVG subpath for a circle of radius `r`, centred in a 100×100 viewBox. */
const circle = (r: number) =>
  `M${50 - r} 50a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;

/**
 * The 78 in a DJ (or mixed) card's sleeve, drawn flat in the card's own ink:
 * shellac disc, grooves, two glints, and a Sonora/Cupol-inspired center label
 * tinted by dance style (`78 RPM` / `78 V/M`), with the spindle hole cut clean
 * through so the card shows behind it. When the event is happening right now,
 * `.sleeve-record-disc` spins continuously on the turntable.
 */
function SleeveRecord({
  style,
  faded,
  spinning,
  mixed,
}: {
  style: Style;
  faded: boolean;
  spinning?: boolean;
  mixed?: boolean;
}) {
  const { bundle } = useLocale();
  const id = `disc-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const labelTone = recordLabelTone(style);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      data-spinning={spinning ? 'true' : undefined}
      className={`sleeve-record absolute ${
        mixed ? 'sleeve-record-mixed right-1.5' : 'right-3'
      } ${faded ? 'grayscale opacity-50' : ''}`}
    >
      <defs>
        <path id={`${id}-speed`} d="M39.5 50a10.5 10.5 0 0 1 21 0" />
      </defs>
      <g className="sleeve-record-disc">
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
        <path className={labelTone.fillClass} fillRule="evenodd" d={circle(18.5) + circle(2.5)} />
        {/* Vintage shellac label trim: split outer ring + spindle collar + catalog rule. */}
        <g className={`fill-none ${labelTone.strokeClass}`} strokeOpacity={0.75}>
          <circle
            cx="50"
            cy="50"
            r="15.5"
            strokeWidth={0.9}
            strokeDasharray="38 10.7"
            strokeDashoffset="9.5"
          />
          <circle cx="50" cy="50" r="5.5" strokeWidth={0.7} />
          <path d="M43 59.5h14" strokeWidth={0.85} strokeLinecap="round" />
        </g>
        <text
          className={`${labelTone.textFillClass} font-sans uppercase`}
          fontSize={4.6}
          fontWeight={800}
          letterSpacing={0.65}
        >
          <textPath href={`#${id}-speed`} startOffset="50%" textAnchor="middle">
            {bundle.card.recordLabel}
          </textPath>
        </text>
      </g>
    </svg>
  );
}

