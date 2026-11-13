'use client';

// The band across the top of an event card, drawn as the night's music: a
// perforated ticket stub with a rotating bandstand piece (jazz horn, ballroom
// ribbon mic, or painted kick drum) when a band is playing; a record sleeve
// with a style-labelled 78 half out of it when a DJ is; or both together when
// a band and a DJ share the bill. It carries the time and the badges, so the
// kind of night reads before the title does.
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
import {
  bandstandMotif,
  hashOf,
  musicBadgeLabel,
  recordLabelTone,
  type RecordLabelTone,
} from '../model/labels';
import type { TemporalBadge } from '../model/temporal';
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
    shape === 'mixed' ? 'pr-34' : isTicket ? 'pr-28' : 'pr-32';

  return (
    <>
      <div
        className={`relative col-start-1 row-start-1 rounded-t-sm border-b-2 overflow-hidden px-5 pt-5 pb-4 font-sans ${clearance} ${
          isTicket
            ? // The perforation: slots punched through the stock, so inked in
              // the deepest tone rather than as a keyline — the same as
              // --border-ink in light; in dark, an umber dash would vanish into
              // the kraft. Room on the right for the bandstand piece (and on
              // mixed nights the 78 beside it), which the band clips. The stub
              // is printed on tan stock unless the night is over: then it takes
              // the card's own muted surface, like the rest.
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

        {isTicket && !event.cancelled && (
          <BandstandArt
            id={event.id}
            style={event.style}
            faded={isOver}
            playing={isLiveNow}
            mixed={shape === 'mixed'}
          />
        )}
        {hasRecord && (
          <SleeveRecord
            style={event.style}
            faded={isOver}
            spinning={isLiveNow}
            mixed={shape === 'mixed'}
          />
        )}
        {event.cancelled && <CancelledStamp impression={event.id} />}
      </div>

      {isTicket && <TicketNotches className="col-start-1 row-start-1 ticket-notch-bottom" />}
      {isLiveNow && <LiveHeaderNotes />}
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
 * Two eighth notes drifting up from the bandstand / turntable corner while an
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
 * A live night's stage piece, deterministically picked per occurrence so a
 * grid of live-band nights reads like a three-piece swing combo — a 3-valve
 * jazz horn, a 1940s ballroom ribbon mic, or a painted Savoy/Nalen kick drum.
 *
 * Each motif shares the 78's two-layer choreography: lifting the card pops the
 * outer `<svg>` up from the ticket seam with a spring overshoot, while
 * `data-playing="true"` (`Happening Now`) runs a continuous compositor-only
 * riff, croon, or 4-beat kick on the inner group.
 */
function BandstandArt({
  id,
  style,
  faded,
  playing,
  mixed,
}: {
  id: string;
  style: Style;
  faded: boolean;
  playing?: boolean;
  mixed?: boolean;
}) {
  const motif = bandstandMotif(id);
  const tone = recordLabelTone(style);
  const mutedClass = faded ? 'grayscale opacity-50' : '';

  if (motif === 'horn') {
    return (
      <HornMotif
        tone={tone}
        playing={playing}
        mixed={mixed}
        mutedClass={mutedClass}
      />
    );
  }

  if (motif === 'mic') {
    return (
      <MicMotif
        tone={tone}
        playing={playing}
        mixed={mixed}
        mutedClass={mutedClass}
      />
    );
  }

  return (
    <DrumMotif
      tone={tone}
      playing={playing}
      mixed={mixed}
      mutedClass={mutedClass}
    />
  );
}

interface MotifProps {
  tone: RecordLabelTone;
  playing?: boolean;
  mixed?: boolean;
  mutedClass: string;
}

/** 3-valve mid-century jazz trumpet rising from the ticket corner. */
function HornMotif({ tone, playing, mixed, mutedClass }: MotifProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      data-playing={playing ? 'true' : undefined}
      className={`stage-motif stage-horn absolute pointer-events-none ${
        mixed ? 'stage-motif-mixed right-14' : '-right-1'
      } ${mutedClass}`}
    >
      {/* Sound riff arcs fanning out from the bell */}
      <g
        className={`stage-wave stage-wave-1 fill-none ${tone.accentStrokeClass}`}
        strokeWidth={2.6}
        strokeLinecap="round"
      >
        <path d="M19 23A18 18 0 0 0 11 45" />
      </g>
      <g
        className={`stage-wave stage-wave-2 fill-none ${tone.accentStrokeClass}`}
        strokeOpacity={0.72}
        strokeWidth={2.1}
        strokeLinecap="round"
      >
        <path d="M12 16A26 26 0 0 0 2 46" />
      </g>

      <g className="stage-horn-body">
        <g transform="rotate(24 58 58)">
          {/* Lower tuning slide loop */}
          <rect
            x="53"
            y="52"
            width="34"
            height="13"
            rx="6.5"
            className="fill-none stroke-[var(--border-ink)]"
            strokeWidth={5.2}
          />
          <rect
            x="53"
            y="52"
            width="34"
            height="13"
            rx="6.5"
            className="fill-none stroke-[var(--tertiary)]"
            strokeWidth={2.2}
          />

          {/* Three piston valve casings + pearl finger buttons */}
          <g className="fill-[var(--tertiary)] stroke-[var(--border-ink)]" strokeWidth={2}>
            <rect x="57" y="36" width="5.5" height="14" rx="1" />
            <rect x="65.5" y="36" width="5.5" height="14" rx="1" />
            <rect x="74" y="36" width="5.5" height="14" rx="1" />
          </g>
          <g
            className="fill-[var(--surface-container-lowest)] stroke-[var(--border-ink)]"
            strokeWidth={1.6}
          >
            <rect x="56" y="32.5" width="7.5" height="3.5" rx="1.5" />
            <rect x="64.5" y="32.5" width="7.5" height="3.5" rx="1.5" />
            <rect x="73" y="32.5" width="7.5" height="3.5" rx="1.5" />
          </g>

          {/* Exponential brass bell + leadpipe */}
          <path
            d="M98 48.5L48 48.5C36 48.5 27 40 21 29L21 74C27 63 36 54.5 48 54.5L98 54.5Z"
            className="fill-[var(--tertiary)] stroke-[var(--border-ink)]"
            strokeWidth={2.6}
            strokeLinejoin="round"
          />
          <path
            d="M48 50C37 50 29 44 24 36"
            className="fill-none stroke-[var(--on-tertiary)]"
            strokeOpacity={0.48}
            strokeWidth={1.9}
            strokeLinecap="round"
          />

          {/* Rolled rim & style-tinted inner throat */}
          <ellipse
            cx="21"
            cy="51.5"
            rx="5.4"
            ry="22.5"
            className="fill-[var(--shadow-ink)] stroke-[var(--border-ink)]"
            strokeWidth={1.2}
          />
          <ellipse cx="22.2" cy="51.5" rx="3" ry="14" className={tone.fillClass} />
        </g>
      </g>
    </svg>
  );
}

/** 1940s Art Deco ballroom pill ribbon microphone in a U-yoke cradle. */
function MicMotif({ tone, playing, mixed, mutedClass }: MotifProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      data-playing={playing ? 'true' : undefined}
      className={`stage-motif stage-mic absolute pointer-events-none ${
        mixed ? 'stage-motif-mixed right-14' : 'right-1.5'
      } ${mutedClass}`}
    >
      {/* Radiating broadcast arcs */}
      <g
        className={`stage-wave stage-wave-1 fill-none ${tone.accentStrokeClass}`}
        strokeWidth={2.3}
        strokeLinecap="round"
      >
        <path d="M22 24A22 22 0 0 0 22 48" />
        <path d="M78 24A22 22 0 0 1 78 48" />
      </g>
      <g
        className={`stage-wave stage-wave-2 fill-none ${tone.accentStrokeClass}`}
        strokeOpacity={0.7}
        strokeWidth={1.8}
        strokeLinecap="round"
      >
        <path d="M14 19A30 30 0 0 0 14 53" />
        <path d="M86 19A30 30 0 0 1 86 53" />
      </g>

      {/* Stand post, U-yoke & brass thumbscrews */}
      <path
        d="M50 66L50 98M29 41C29 64 71 64 71 41"
        className="fill-none stroke-[var(--border-ink)]"
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <g className="fill-[var(--tertiary)] stroke-[var(--border-ink)]" strokeWidth={1.7}>
        <circle cx="29" cy="41" r="3" />
        <circle cx="71" cy="41" r="3" />
        <circle cx="50" cy="64" r="3" />
      </g>

      {/* Tilting ribbon capsule */}
      <g className="stage-mic-head">
        <rect
          x="35"
          y="12"
          width="30"
          height="45"
          rx="15"
          className="fill-[var(--surface-container-lowest)] stroke-[var(--border-ink)]"
          strokeWidth={2.6}
        />
        <rect x="39" y="16" width="22" height="37" rx="11" className="fill-[var(--shadow-ink)]" />
        <g className="fill-none stroke-[var(--outline)]" strokeWidth={1.8} strokeLinecap="round">
          <line x1="42" y1="22" x2="58" y2="22" />
          <line x1="41" y1="27" x2="59" y2="27" />
          <line x1="41" y1="42" x2="59" y2="42" />
          <line x1="42" y1="47" x2="58" y2="47" />
        </g>
        {/* Style-tinted call band */}
        <rect
          x="35"
          y="31"
          width="30"
          height="7"
          className={`${tone.fillClass} stroke-[var(--border-ink)]`}
          strokeWidth={1.8}
        />
        <path
          d="M44.5 34.5h11"
          className={`fill-none ${tone.strokeClass}`}
          strokeOpacity={0.8}
          strokeWidth={1.1}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** Vintage painted big-band bass drumhead & brass crash cymbal peeking from the seam. */
function DrumMotif({ tone, playing, mixed, mutedClass }: MotifProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      data-playing={playing ? 'true' : undefined}
      className={`stage-motif stage-drum absolute pointer-events-none ${
        mixed ? 'stage-motif-mixed right-14' : 'right-1.5'
      } ${mutedClass}`}
    >
      {/* Brass crash cymbal on stand rod */}
      <g className="stage-drum-cymbal">
        <line
          x1="75"
          y1="34"
          x2="80"
          y2="11"
          className="stroke-[var(--border-ink)]"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <ellipse
          cx="78"
          cy="17"
          rx="16"
          ry="4.6"
          transform="rotate(14 78 17)"
          className="fill-[var(--tertiary)] stroke-[var(--border-ink)]"
          strokeWidth={2.2}
        />
        <ellipse
          cx="78"
          cy="16.4"
          rx="4.5"
          ry="1.7"
          transform="rotate(14 78 16.4)"
          className="fill-[var(--shadow-ink)]"
        />
      </g>

      {/* Painted calfskin bass drumhead */}
      <g className="stage-drum-head">
        <circle
          cx="48"
          cy="56"
          r="40"
          className="fill-[var(--shadow-ink)] stroke-[var(--border-ink)]"
          strokeWidth={1.5}
        />
        <circle cx="48" cy="56" r="34" className="fill-[var(--surface-container-lowest)]" />
        {/* Style-tinted Savoy / Nalen scalloped crest */}
        <path
          d="M16.5 56A31.5 31.5 0 0 1 79.5 56L66 56A18 18 0 0 0 30 56Z"
          className={tone.fillClass}
        />
        <circle
          cx="48"
          cy="56"
          r="27.5"
          className="fill-none stroke-[var(--outline)]"
          strokeOpacity={0.65}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        {/* Classic bandstand star */}
        <polygon
          points="48,42 50.8,49.8 59,50.1 52.5,55.1 54.8,63 48,58.4 41.2,63 43.5,55.1 37,50.1 45.2,49.8"
          className="fill-[var(--on-surface)]"
        />
        {/* Brass T-rod tension lugs */}
        <g className="fill-[var(--tertiary)] stroke-[var(--border-ink)]" strokeWidth={1.4}>
          <rect x="45.5" y="13" width="5" height="6" rx="1" />
          <rect x="16" y="25" width="5" height="6" rx="1" transform="rotate(-42 18.5 28)" />
          <rect x="75" y="25" width="5" height="6" rx="1" transform="rotate(42 77.5 28)" />
          <rect x="6" y="53.5" width="6" height="5" rx="1" />
          <rect x="84" y="53.5" width="6" height="5" rx="1" />
        </g>
      </g>
    </svg>
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
        mixed ? 'sleeve-record-mixed right-0.5' : 'right-3'
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

