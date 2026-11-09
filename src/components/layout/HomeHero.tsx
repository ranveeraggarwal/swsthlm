'use client';

// The homepage's masthead, set like the cover of a small jazz magazine: a
// kicker, a big syncopated headline, the standfirst, two CTAs, and — from
// `lg` up — a record half out of its sleeve.
//
// Split out of `app/page.tsx` rather than making that route a client
// component: the route loads events at build time and emits the JSON-LD, both
// of which have to stay server-side (CODE_STRUCTURE rules 2 and 6). Only the
// copy needs the locale, so only it crosses the boundary.
//
// The CTAs are plain in-page anchors (`#events`, `#music`) to sections the
// listing renders; `scroll-padding-top` in globals.css keeps them clear of
// the sticky header.

import type { ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

/**
 * `titleSuffix` renders inline after the title — the slot the easter eggs use.
 * Passed in by the route rather than imported here, so `components/` doesn't
 * import from `features/` (CODE_STRUCTURE rule 1).
 */
export function HomeHero({ titleSuffix }: { titleSuffix?: ReactNode }) {
  const { bundle } = useLocale();
  const t = bundle.home;

  return (
    <section className="hero-cover grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-10 xl:gap-16 items-center pt-2 pb-10 sm:pt-6 lg:pt-10 lg:pb-16 mb-4 lg:mb-8">
      <div>
        <p className="flex items-center gap-3 font-mono text-[11px] sm:text-xs font-medium uppercase tracking-[0.18em] text-[var(--primary)]">
          <span aria-hidden="true" className="h-0.5 w-8 bg-current" />
          {t.kicker}
        </p>

        <h1 className="mt-5 font-serif font-black tracking-tight text-[var(--on-surface)] text-[2.5rem] leading-[1.02] sm:text-6xl lg:text-[4.25rem] xl:text-[4.75rem] lg:leading-[0.98] text-balance">
          {t.title.lead}
          <span className="italic font-normal text-[var(--primary)]">{t.title.em}</span>
          {titleSuffix}
        </h1>

        <p className="mt-5 lg:mt-6 max-w-xl font-sans text-[15px] sm:text-lg leading-relaxed text-[var(--on-surface-variant)]">
          {t.subtitle}
        </p>

        <div className="mt-7 lg:mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
          <a
            href="#events"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 rounded border-2 border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-sans text-xs sm:text-sm font-bold uppercase tracking-wider lift-btn-primary"
          >
            {t.exploreEvents}
            <ArrowDown aria-hidden="true" className="w-4 h-4" />
          </a>
          <a
            href="#music"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 rounded border-2 border-[var(--border-ink)] text-[var(--on-surface)] hover:bg-[var(--surface-container)] font-sans text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
          >
            {t.discoverMusic}
          </a>
        </div>
      </div>

      <CoverArt lead={t.cover.lead} em={t.cover.em} />
    </section>
  );
}

/** An SVG subpath for a circle of radius `r`, centred in a 200×200 viewBox. */
const ring = (r: number) =>
  `M${100 - r} 100a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;

/**
 * The cover: a 78 slipping out of a printed sleeve. The sleeve carries the
 * site's old headline as its album title, so "in Full Swing" lives on.
 *
 * Pure decoration, hidden from assistive tech — every word on it is also
 * somewhere real on the page. Drawn in tokens only, so it follows the theme:
 * the sleeve is `--primary` stock with an `--on-primary` halftone, the record
 * is inked like the DJ card's 78 (`--border-ink`), its label on
 * `--ticket-stock`. Desktop only: on a phone the listing matters more than
 * the art.
 */
function CoverArt({ lead, em }: { lead: string; em: string }) {
  return (
    <div aria-hidden="true" className="hidden lg:block relative w-full max-w-[28rem] aspect-[1/0.9] ml-auto">
      {/* The record, behind the sleeve, half pulled out to the upper right. */}
      <svg
        viewBox="0 0 200 200"
        className="hero-record absolute top-0 right-0 w-[66%]"
        focusable="false"
      >
        <defs>
          <path id="hero-record-ring" d={ring(52)} />
        </defs>
        <path className="fill-[var(--border-ink)]" fillRule="evenodd" d={ring(100) + ring(4)} />
        <g className="fill-none stroke-[var(--outline)]" strokeOpacity={0.4} strokeWidth={0.8}>
          <circle cx="100" cy="100" r="92" />
          <circle cx="100" cy="100" r="84" />
          <circle cx="100" cy="100" r="76" />
          <circle cx="100" cy="100" r="68" />
        </g>
        <g className="fill-none stroke-[var(--outline)]" strokeWidth={3} strokeLinecap="round" strokeOpacity={0.8}>
          <path d="M24 70A82 82 0 0 1 58 30" />
          <path d="M176 130A82 82 0 0 1 142 170" />
        </g>
        <path className="fill-[var(--ticket-stock)]" fillRule="evenodd" d={ring(62) + ring(4)} />
        <circle cx="100" cy="100" r="40" className="fill-none stroke-[var(--primary)]" strokeWidth={1} />
        <text className="fill-[var(--on-surface)] font-mono uppercase" fontSize={8.6} fontWeight={600} letterSpacing={2.1}>
          <textPath href="#hero-record-ring" startOffset="0">
            Stockholm Swing ✦ Dance Calendar ✦ Stockholm Swing ✦ Dance Calendar ✦
          </textPath>
        </text>
      </svg>

      {/* The sleeve. */}
      <div className="absolute left-0 bottom-0 w-[68%] aspect-square rounded-sm border-2 border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] shadow-[8px_8px_0px_0px_var(--shadow-ink)] overflow-hidden">
        <div className="halftone absolute -top-6 -right-6 w-3/4 h-3/4 opacity-25 [mask-image:radial-gradient(circle_at_top_right,black_20%,transparent_70%)]" />
        <div className="absolute inset-0 p-6 flex flex-col">
          <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
            <span>Sthlm · 78</span>
            <span>No. 1</span>
          </div>
          <div className="mt-auto">
            <p className="font-serif text-2xl leading-none">{lead}</p>
            <p className="font-serif italic font-bold text-[3.75rem] leading-[0.9] tracking-tight -ml-0.5">{em}</p>
            <div className="mt-5 pt-3 border-t border-current/40 font-mono text-[10px] uppercase tracking-[0.2em] flex justify-between">
              <span>Lindy Hop</span>
              <span>Balboa</span>
              <span>Shag</span>
              <span>Blues</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
