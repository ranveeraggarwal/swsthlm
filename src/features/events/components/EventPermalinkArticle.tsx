import Link from 'next/link';
import { ArrowLeft, Ticket } from 'lucide-react';
import { formatEventDate } from '@/lib/date/format';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locale';
import { ReportCorrectionButton } from '@/features/corrections/ReportCorrectionButton';
import { AddToCalendarButton } from './AddToCalendarButton';
import { BeginnerChip, StyleChip } from './EventChips';
import { EventFacts } from './EventFacts';
import { FloorTypeBadge } from './FloorTypeBadge';
import { ShareButton } from './ShareButton';
import type { SwingEvent } from '../model/event';

/**
 * The permalink page body, shared by `/event/[id]/[date]` and
 * `/sv/event/[id]/[date]`. `backHref` is passed in rather than hardcoded so
 * the "All events" link goes back to the locale root it came from, not
 * always English — see `localePath` in `lib/i18n/locale.ts`.
 */
export function EventPermalinkArticle({
  event,
  backHref,
  locale = DEFAULT_LOCALE,
}: {
  event: SwingEvent;
  backHref: string;
  locale?: Locale;
}) {
  return (
    <>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors mb-6 font-sans"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All events
      </Link>

      <article className="border-2 border-[var(--border-ink)] bg-[var(--surface-container-low)] rounded overflow-hidden">
        <div className="p-6 space-y-5">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
            {formatEventDate(event.date)}
          </p>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--on-surface)] leading-snug">
            {event.title}
          </h1>

          <p className="font-sans font-bold text-lg tabular-nums tracking-tight text-[var(--on-surface)]">
            {event.start} – {event.end}
          </p>

          <EventFacts event={event} />

          <div className="flex flex-wrap items-center gap-2 font-sans">
            <StyleChip style={event.style} layout="permalink" locale={locale} />
            <FloorTypeBadge floorType={event.floorType} locale={locale} />
            <BeginnerChip beginnerClass={event.beginnerClass} locale={locale} />
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
              <Ticket className="w-4 h-4" />
              Source
              <span className="sr-only"> — tickets and event info (opens in a new tab)</span>
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
