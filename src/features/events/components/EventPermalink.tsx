'use client';

// The permalink page's body.
//
// Split out of `app/event/[id]/[date]/page.tsx` so the route keeps
// `generateStaticParams`, `generateMetadata` and the JSON-LD script — all
// server-only — while the visible chrome reads the locale. Same split as
// `HomeHero` and `AboutContent`.
//
// Without this the page was half-translated: its chips, facts and badges came
// from the bundle (they're client components), while the back link, the date
// line and the source button stayed English because the route rendered them
// on the server.

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Ticket } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { formatEventDate } from '@/lib/date/format';
import { ReportCorrectionButton } from '@/features/corrections/ReportCorrectionButton';
import { AddToCalendarButton } from './AddToCalendarButton';
import { BeginnerChip, StyleChip } from './EventChips';
import { EventFacts } from './EventFacts';
import { FloorTypeBadge } from './FloorTypeBadge';
import { ShareButton } from './ShareButton';
import type { SwingEvent } from '../model/event';

export function EventPermalink({ event }: { event: SwingEvent }) {
  const { locale, bundle } = useLocale();

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors mb-6 font-sans"
      >
        <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5" />
        {bundle.permalink.backToAll}
      </Link>

      <article className="border-2 border-[var(--border-ink)] bg-[var(--surface-container-low)] rounded overflow-hidden">
        <div className="p-6 space-y-5">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
            {formatEventDate(event.date, locale)}
          </p>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--on-surface)] leading-snug">
            {event.title}
          </h1>

          <p className="font-sans font-bold text-lg tabular-nums tracking-tight text-[var(--on-surface)]">
            {event.start} – {event.end}
          </p>

          <EventFacts event={event} />

          <div className="flex flex-wrap items-center gap-2 font-sans">
            <StyleChip style={event.style} layout="permalink" />
            <FloorTypeBadge floorType={event.floorType} />
            <BeginnerChip beginnerClass={event.beginnerClass} />
          </div>

          {event.body && (
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line">
              {event.body}
            </p>
          )}

          {event.ticket && (
            <a
              href={event.ticket}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary"
            >
              <Ticket aria-hidden="true" className="w-4 h-4" />
              {bundle.card.source}
              <span className="sr-only">{bundle.card.sourceHint}</span>
            </a>
          )}
        </div>
      </article>

      <div className="flex items-center gap-2 mt-4">
        <AddToCalendarButton event={event} />
        <ShareButton event={event} />
        <ReportCorrectionButton event={event} />
      </div>
    </>
  );
}
