'use client';

// The 404 page's body: a tabletop 78-rpm turntable spinning in its eccentric
// run-out groove after the last song of the night has ended. Clicking the deck
// nudges the brass tonearm back onto the music grooves for one last pair of
// notes before it slips home into the locked groove again.
//
// Split out of `app/not-found.tsx` so the route stays a thin server component
// exporting `metadata`, while the visible copy reads the active locale
// (`CODE_STRUCTURE.md` rules 2 and 8b).

import React, { useId, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Music, Music2 } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './NotFoundContent.module.css';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;

export function NotFoundContent() {
  const { bundle } = useLocale();
  const t = bundle.notFound;
  const labelPathId = `notfound-label-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(false);

  const nudgeNeedle = () => {
    setBeat((b) => b + 1);
    setPlaying(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full">
      <div className="max-w-xl mx-auto rounded-lg border-2 border-[var(--border-ink)] bg-[var(--surface-container-low)] shadow-[4px_4px_0px_0px_var(--shadow-ink)] px-6 py-10 sm:px-10 sm:py-12 text-center">
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={nudgeNeedle}
            aria-label={t.nudgeNeedle}
            title={t.nudgeNeedle}
            className="relative inline-flex items-center justify-center rounded-lg p-1 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 152 132"
              className="w-40 h-35 overflow-visible"
            >
              <defs>
                <path id={labelPathId} d="M50 66a12 12 0 0 1 24 0" />
              </defs>

              {/* Tabletop turntable plinth + solid sticker-stack offset */}
              <rect
                x="8.5"
                y="10.5"
                width="138"
                height="114"
                rx="8"
                className="fill-[var(--shadow-ink)]"
              />
              <rect
                x="6"
                y="8"
                width="138"
                height="114"
                rx="8"
                className="fill-[var(--surface-container)] stroke-[var(--border-ink)]"
                strokeWidth={2}
              />
              {/* Brass corner screws */}
              <g className="fill-[var(--outline)]" fillOpacity={0.65}>
                <circle cx="13" cy="15" r="1.3" />
                <circle cx="137" cy="15" r="1.3" />
                <circle cx="13" cy="115" r="1.3" />
                <circle cx="137" cy="115" r="1.3" />
              </g>

              {/* Recessed platter bezel */}
              <circle
                cx="62"
                cy="66"
                r="50.5"
                className="fill-[var(--surface-container-high)] stroke-[var(--outline-variant)]"
                strokeWidth={1}
              />

              {/* Spinning 78-rpm shellac disc */}
              <g className={styles.disc}>
                <path
                  className="fill-[var(--shadow-ink)] stroke-[var(--border-ink)]"
                  strokeWidth={1.1}
                  fillRule="evenodd"
                  d={circle(62, 66, 48) + circle(62, 66, 2.8)}
                />
                {/* Music grooves */}
                <g
                  className="fill-none stroke-[var(--outline)]"
                  strokeOpacity={0.42}
                  strokeWidth={0.85}
                >
                  <circle cx="62" cy="66" r="41.5" />
                  <circle cx="62" cy="66" r="35" />
                  <circle cx="62" cy="66" r="28.5" />
                </g>
                {/* Eccentric locked run-out groove (offset 1px from spindle) */}
                <circle
                  cx="63"
                  cy="66"
                  r="22"
                  className="fill-none stroke-[var(--outline)]"
                  strokeOpacity={0.88}
                  strokeWidth={1.1}
                />
                {/* Specular shellac glints so the 78's rotation reads clearly */}
                <g
                  className="fill-none stroke-[var(--outline)]"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <path d="M25.35 52.66A39 39 0 0 1 43.69 31.57" />
                  <path d="M98.65 79.34A39 39 0 0 1 80.31 100.43" />
                </g>
                {/* Sonora/Cupol-inspired center label */}
                <path
                  className="fill-[var(--primary)]"
                  fillRule="evenodd"
                  d={circle(62, 66, 18.2) + circle(62, 66, 2.8)}
                />
                <g className="fill-none stroke-[var(--on-primary)]" strokeOpacity={0.78}>
                  <circle
                    cx="62"
                    cy="66"
                    r="15.2"
                    strokeWidth={0.9}
                    strokeDasharray="38 10"
                    strokeDashoffset="9.5"
                  />
                  <circle cx="62" cy="66" r="5.6" strokeWidth={0.75} />
                  <path d="M54.5 75.5h15" strokeWidth={0.9} strokeLinecap="round" />
                </g>
                <text
                  className="fill-[var(--on-primary)] font-sans uppercase"
                  fontSize={4.2}
                  fontWeight={800}
                  letterSpacing={0.55}
                >
                  <textPath href={`#${labelPathId}`} startOffset="50%" textAnchor="middle">
                    {t.recordLabel}
                  </textPath>
                </text>
              </g>

              {/* Speed selector dial in the bottom-right deck corner */}
              <circle
                cx="126"
                cy="104"
                r="6.5"
                className="fill-[var(--surface-container-highest)] stroke-[var(--border-ink)]"
                strokeWidth={1.5}
              />
              <path
                d="M126 104L129.5 100.5"
                className="fill-none stroke-[var(--primary)]"
                strokeWidth={1.8}
                strokeLinecap="round"
              />

              {/* Tonearm pivot base */}
              <circle
                cx="124"
                cy="28"
                r="9.5"
                className="fill-[var(--surface-container-highest)] stroke-[var(--border-ink)]"
                strokeWidth={1.8}
              />

              {/* Brass tonearm riding the eccentric inner groove */}
              <g
                key={`arm-${beat}`}
                className={playing ? styles.armNudge : styles.armIdle}
              >
                <path
                  d="M124 28L132 19"
                  className="fill-none stroke-[var(--border-ink)]"
                  strokeWidth={5}
                  strokeLinecap="round"
                />
                <path
                  d="M124 28C120 46 103 59 85 65"
                  className="fill-none stroke-[var(--tertiary)]"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <circle
                  cx="124"
                  cy="28"
                  r="4.2"
                  className="fill-[var(--tertiary)] stroke-[var(--border-ink)]"
                  strokeWidth={1.3}
                />
                <path
                  d="M90.5 61L80.8 65L82.8 69.8L92.5 65.8Z"
                  className="fill-[var(--surface-container-lowest)] stroke-[var(--border-ink)]"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                <circle cx="83.8" cy="66.6" r="1.7" className="fill-[var(--primary)]" />
              </g>
            </svg>

            {playing && (
              <span key={`notes-${beat}`} aria-hidden="true">
                <Music className={`${styles.note} ${styles.first} text-[var(--primary)]`} />
                <Music2
                  className={`${styles.note} ${styles.second} text-[var(--tertiary)]`}
                  onAnimationEnd={() => setPlaying(false)}
                />
              </span>
            )}
          </button>
        </div>

        <p className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
          {t.eyebrow}
        </p>

        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--on-surface)] leading-tight">
          {t.title.lead}
          <span className="italic font-medium">{t.title.em}</span>
        </h1>

        <p className="mt-3 font-sans font-body-md text-[var(--on-surface-variant)] max-w-md mx-auto leading-relaxed">
          {t.body}
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded border-2 border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-sans font-bold uppercase tracking-wider text-xs lift-btn-primary"
          >
            <ArrowLeft aria-hidden="true" className="w-4 h-4" />
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
