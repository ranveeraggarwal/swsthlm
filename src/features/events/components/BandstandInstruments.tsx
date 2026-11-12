'use client';

// The band on a live night's ticket stub: five instruments propped up in the
// corner, drawn flat in the card's own ink like the DJ card's 78 — near-black
// bodies, `--outline` glints, and one dance-style-tinted accent each (bell
// mouths, drum hoops, the bass's tailpiece), from the same palette as the
// record's centre label. On a `mixed` night the record takes the corner, so
// only the horn section stands beside it.
//
// While the night is happening right now, the band plays: the trumpet tips
// up on the beat, the trombone works its slide, the sax sways, the bass rocks
// on its endpin with its strings buzzing, the drum thumps, the cymbal rings,
// and notes drift out of the horns. All of it is compositor-only CSS in
// `globals.css` (`.bandstand`), and none of it runs under reduced motion.
//
// Everything is the same ink, so overlapping instruments would melt into one
// blob; each one is printed with a thin halo of the band's own paper around
// it (`paper`), which is what keeps the pile readable.

import React, { useId } from 'react';
import type { Style } from '@/lib/data/types';
import { recordLabelTone } from '../model/labels';

const INK = 'fill-[var(--shadow-ink)]';
const GLINT = 'fill-[var(--outline)]';
const GLINT_LINE = 'fill-none stroke-[var(--outline)]';

function Trumpet({ tone }: { tone: string }) {
  return (
    <g className="bandstand-part bandstand-trumpet">
      <path className={INK} d="M0 15.5h3l2-1.5h40v4H5l-2-1.5H0z" />
      <path className={INK} d="M45 14l14-9c1 0 1.5 1 1.5 3v16c0 2-.5 3-1.5 3l-14-9z" />
      <ellipse className={tone} cx="59.7" cy="16" rx="1.6" ry="9" />
      <path
        className={INK}
        d="M12 18v9a5 5 0 0 0 5 5h18a5 5 0 0 0 5-5v-9h-3.5v8.5a2 2 0 0 1-2 2H17.5a2 2 0 0 1-2-2V18z"
      />
      <g className={INK}>
        <rect x="19" y="6" width="4" height="18" rx="1" />
        <rect x="25" y="6" width="4" height="18" rx="1" />
        <rect x="31" y="6" width="4" height="18" rx="1" />
      </g>
      <g className={GLINT}>
        <rect x="19.5" y="3" width="3" height="2.5" rx=".8" />
        <rect x="25.5" y="3" width="3" height="2.5" rx=".8" />
        <rect x="31.5" y="3" width="3" height="2.5" rx=".8" />
      </g>
      <path className={GLINT_LINE} d="M6 15h38" strokeWidth={1} strokeOpacity={0.6} />
    </g>
  );
}

function Trombone({ tone }: { tone: string }) {
  return (
    <g className="bandstand-part bandstand-trombone">
      <path className={INK} d="M2 4.5h40v3H2z" />
      <path className={INK} d="M41 6l13-8c1 0 1.5 1 1.5 3v12c0 2-.5 3-1.5 3L41 8z" />
      <ellipse className={tone} cx="54.7" cy="6" rx="1.5" ry="7.5" />
      <path className={INK} d="M0 4h3v4H0zM4 5.5h3v9H4z" />
      <g className="bandstand-part bandstand-slide">
        <path className={INK} d="M6 11.5h40a4 4 0 0 1 0 8H6v-2.6h40a1.4 1.4 0 0 0 0-2.8H6z" />
        <path className={GLINT_LINE} d="M10 12.3h34" strokeWidth={0.7} strokeOpacity={0.7} />
      </g>
      <path className={GLINT_LINE} d="M6 5.3h34" strokeWidth={0.7} strokeOpacity={0.6} />
    </g>
  );
}

function Saxophone({ tone }: { tone: string }) {
  return (
    <g className="bandstand-part bandstand-sax">
      <path className={INK} d="M20 4c-6 1-9 4-10 9l-1 5 4 1 1-4c1-3 3-5 7-6z" />
      <path
        className={INK}
        d="M10 16h8v52c0 7 4 10 9 10s9-3 9-10V50l-3-6h14l-3 6v19c0 14-9 22-20 22S6 83 6 69z"
      />
      <path className={INK} d="M21 1.5l4-1 1 4-4 1z" />
      <ellipse className={tone} cx="40" cy="44" rx="7.5" ry="2.6" />
      <g className={GLINT}>
        <circle cx="14" cy="28" r="1.8" />
        <circle cx="14" cy="36" r="1.8" />
        <circle cx="14" cy="44" r="1.8" />
        <circle cx="14" cy="54" r="1.8" />
        <circle cx="14" cy="62" r="1.8" />
      </g>
      <path
        className={GLINT_LINE}
        d="M9 22v44c0 9 6 16 14 17"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeOpacity={0.7}
      />
    </g>
  );
}

function UprightBass({ tone }: { tone: string }) {
  return (
    <g className="bandstand-part bandstand-bass">
      <path className={INK} d="M23 0c4 0 5 3 4 6l-1 2-2 30h-4l-2-30-1-2c-1-3 0-6 4-6z" />
      <path
        className={INK}
        d="M22 34c-10 0-14 6-12 13c1 4-6 8-6 18c0 14 9 22 18 22s18-8 18-22c0-10-7-14-6-18c2-7-2-13-12-13z"
      />
      <g className={GLINT}>
        <path d="M14 57c2 3 2 8 0 11l1 .5c2-4 2-8 0-12z" />
        <path d="M30 57c-2 3-2 8 0 11l-1 .5c-2-4-2-8 0-12z" />
      </g>
      <g className={`${GLINT_LINE} bandstand-part bandstand-strings`} strokeWidth={0.5} strokeOpacity={0.7}>
        <path d="M21 6v70M22.3 6v70M23.6 6v70M24.9 6v70" />
      </g>
      <path className={tone} d="M19 72h8l-1 10h-6zM18 60h10v2.5H18z" />
      <path className={GLINT_LINE} d="M22 87v8" strokeWidth={2} />
    </g>
  );
}

/** A plain drum seen from just above: shell, batter head, tinted hoops, cords. */
function Drum({ toneStroke }: { toneStroke: string }) {
  return (
    <g className="bandstand-part bandstand-drum">
      <path className={INK} d="M0 8v28a30 7 0 0 0 60 0V8z" />
      <path
        className={GLINT_LINE}
        d="M3 13l9 20 9-20 9 20 9-20 9 20 9-20"
        strokeWidth={0.9}
        strokeLinejoin="round"
        strokeOpacity={0.8}
      />
      <path className={`fill-none ${toneStroke}`} d="M0 35a30 7 0 0 0 60 0" strokeWidth={2.4} />
      <ellipse className={INK} cx="30" cy="8" rx="30" ry="7" />
      <ellipse className={`fill-none ${toneStroke}`} cx="30" cy="8" rx="29" ry="6.2" strokeWidth={2.2} />
      <path className={GLINT_LINE} d="M12 6.5a24 4.5 0 0 1 14-2.6" strokeWidth={1.2} strokeLinecap="round" />
    </g>
  );
}

function Cymbal() {
  return (
    <g>
      <path className={INK} d="M15.3 5h1.4v95h-1.4z" />
      <g className="bandstand-part bandstand-cymbal">
        <path className={INK} d="M0 4c6-3 26-3 32 0c-6 2-26 2-32 0z" />
        <rect className={INK} x="14.5" y="-1" width="3" height="3" rx="1" />
        <path className={GLINT_LINE} d="M5 3.5c6-1.4 16-1.4 22 0" strokeWidth={0.8} />
      </g>
    </g>
  );
}

function Note({ x, y, dx, rot, delay, tone, toneStroke }: {
  x: number;
  y: number;
  dx: number;
  rot: number;
  delay: number;
  tone: string;
  toneStroke: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g
        className="bandstand-part bandstand-note"
        style={
          { '--drift-x': `${dx}px`, '--sway': `${rot}deg`, animationDelay: `${delay}s` } as React.CSSProperties
        }
      >
        <ellipse className={tone} rx="2.6" ry="1.9" transform="rotate(-20)" />
        <path
          className={`fill-none ${toneStroke}`}
          d="M2.2-.6v-8.5l3.4 2.4"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

export function BandstandInstruments({
  style,
  faded,
  playing,
  mixed,
}: {
  style: Style;
  faded: boolean;
  playing?: boolean;
  mixed?: boolean;
}) {
  const id = `band-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const { fillClass: tone, accentStrokeClass: toneStroke } = recordLabelTone(style);
  const halo = `url(#${id}-halo)`;
  const notes = { tone, toneStroke };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={mixed ? '0 0 96 101' : '0 0 150 101'}
      data-playing={playing ? 'true' : undefined}
      className={`bandstand absolute bottom-0 ${
        mixed ? 'bandstand-mixed right-20' : 'right-0'
      } ${faded ? 'grayscale opacity-50' : ''}`}
    >
      <defs>
        <filter id={`${id}-halo`} x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={1.3} result="spread" />
          {/* The band's own paper: tan stock, or the ended card's surface. */}
          <feFlood
            style={{ floodColor: faded ? 'var(--ended-surface)' : 'var(--ticket-stock)' }}
            result="paper"
          />
          <feComposite in="paper" in2="spread" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {!mixed && (
        <>
          <g filter={halo} transform="translate(116 4) rotate(9)">
            <UprightBass tone={tone} />
          </g>
          <g filter={halo} transform="translate(88 28)">
            <Cymbal />
          </g>
        </>
      )}
      <g filter={halo} transform="translate(2 88) rotate(-38)">
        <Trombone tone={tone} />
      </g>
      <g filter={halo} transform="translate(12 56) rotate(-54)">
        <Trumpet tone={tone} />
      </g>
      <g filter={halo} transform="translate(56 16) rotate(6) scale(.84)">
        <Saxophone tone={tone} />
      </g>
      {!mixed && (
        <g filter={halo} transform="translate(76 66) scale(.78)">
          <Drum toneStroke={toneStroke} />
        </g>
      )}

      {playing && (
        <g>
          <Note x={52} y={4} dx={-6} rot={-14} delay={0} {...notes} />
          <Note x={46} y={40} dx={-8} rot={-10} delay={0.75} {...notes} />
          <Note x={84} y={46} dx={6} rot={16} delay={1.5} {...notes} />
        </g>
      )}
    </svg>
  );
}
