'use client';

// "The music never stops" — the bandstand, drawn as a record sleeve.
//
// Side A is a track listing of the next bands to play, one line per act, each
// linking to its next night's permalink. Side B is the liner notes: how many
// band nights, bands and DJ nights the calendar holds. Every line comes from
// `../model/highlights.ts`, which reads only the listing's own columns — there
// are no hand-written bios or invented acts here, and if no band is listed the
// section doesn't render at all.

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Music } from 'lucide-react';
import { formatEventDateShort } from '@/lib/date/format';
import { useLocale } from '@/components/providers/LocaleProvider';
import { eventPath } from '../model/event';
import type { BandstandEntry, MusicStats } from '../model/highlights';
import { SectionHeading } from './SectionHeading';

interface MusicFeatureProps {
  entries: BandstandEntry[];
  stats: MusicStats;
  number: number;
  /** Narrows the listing to live-music nights. */
  onShowLive: () => void;
}

export function MusicFeature({ entries, stats, number, onShowLive }: MusicFeatureProps) {
  const { locale, bundle } = useLocale();
  const t = bundle.musicFeature;
  if (entries.length === 0) return null;

  const plural = (n: number, forms: { one: string; other: string }) => (n === 1 ? forms.one : forms.other);
  const figures = [
    { value: stats.liveNights, label: plural(stats.liveNights, t.stats.liveNights) },
    { value: stats.bands, label: plural(stats.bands, t.stats.bands) },
    { value: stats.djNights, label: plural(stats.djNights, t.stats.djNights) },
  ];

  return (
    <section
      id="music"
      aria-labelledby="music-heading"
      className="relative overflow-hidden rounded-lg border-2 border-[var(--border-ink)] bg-[var(--sleeve)] text-[var(--on-sleeve)] shadow-[6px_6px_0px_0px_var(--shadow-ink)] px-5 py-8 sm:px-8 lg:px-12 lg:py-12"
    >
      {/* The sleeve's print: a halftone screen and a ghost of the record inside. */}
      <div
        aria-hidden="true"
        className="halftone pointer-events-none absolute -top-10 -right-10 w-72 h-72 text-[var(--sleeve-rule)] [mask-image:radial-gradient(circle_at_top_right,black_25%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full border-[28px] border-[var(--sleeve-rule)] opacity-60 hidden md:block"
      />

      <div className="relative">
        <SectionHeading
          id="music-heading"
          number={number}
          kicker={bundle.listing.kickers.music}
          lead={t.heading.lead}
          em={t.heading.em}
          standfirst={t.standfirst}
          tone="sleeve"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-10 lg:gap-14">
          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sleeve-brass)] pb-3 border-b border-[var(--sleeve-rule)]">
              {t.sideA}
            </h3>
            <ol>
              {entries.map(({ band, event, moreNights }, idx) => (
                <li key={band} className="border-b border-[var(--sleeve-rule)]">
                  <Link
                    href={eventPath(event)}
                    className="group grid grid-cols-[2rem_minmax(0,1fr)] sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3.5 focus-visible:outline-[var(--sleeve-accent)]"
                  >
                    <span aria-hidden="true" className="font-mono text-xs text-[var(--sleeve-brass)] tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-serif text-xl sm:text-2xl font-bold leading-tight group-hover:text-[var(--sleeve-accent)] transition-colors">
                        {band}
                      </span>
                      <span className="mt-0.5 block font-sans text-xs sm:text-sm text-[var(--on-sleeve-variant)] truncate">
                        {[event.venue, event.neighborhood].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span className="col-start-2 sm:col-start-3 mt-1 sm:mt-0 sm:text-right font-mono text-xs uppercase tracking-wider tabular-nums">
                      <span className="text-[var(--sleeve-accent)]">
                        {formatEventDateShort(event.date, locale)} · {event.start}
                      </span>
                      {moreNights > 0 && (
                        <span className="sm:block ml-2 sm:ml-0 sm:mt-0.5 text-[var(--on-sleeve-variant)] normal-case tracking-normal">
                          {plural(moreNights, t.moreNights).replace('{count}', String(moreNights))}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sleeve-brass)] pb-3 border-b border-[var(--sleeve-rule)]">
              {t.sideB}
            </h3>
            <dl className="grid grid-cols-3 lg:grid-cols-1 gap-x-4 gap-y-6 pt-5">
              {figures.map(({ value, label }) => (
                <div key={label} className="flex flex-col-reverse lg:flex-row lg:items-baseline lg:gap-4">
                  <dt className="font-sans text-xs sm:text-sm text-[var(--on-sleeve-variant)] leading-snug">{label}</dt>
                  <dd className="font-serif font-black italic text-4xl sm:text-5xl lg:text-6xl leading-none text-[var(--sleeve-accent)] tabular-nums lg:order-first lg:w-24 lg:shrink-0">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 font-mono text-[11px] text-[var(--on-sleeve-variant)]">{t.statsNote}</p>
            <button
              type="button"
              onClick={onShowLive}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded border-2 border-[var(--sleeve-accent)] text-[var(--sleeve-accent)] hover:bg-[var(--sleeve-accent)] hover:text-[var(--sleeve)] font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-[var(--sleeve-accent)]"
            >
              <Music aria-hidden="true" className="w-4 h-4" />
              {t.showLive}
              <ArrowRight aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
