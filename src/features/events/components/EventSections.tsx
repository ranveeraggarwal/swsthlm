'use client';

// The two ways the homepage lists events: a card grid for the near week, each
// night under a big date block, and a compact month-grouped list for
// everything after.
//
// The month-grouped list used to be a `reduce` that accumulated `React.ReactNode[]`
// inline in JSX, interleaving headings with rows as a side effect of the
// accumulator. The grouping now happens in `../model/sections.ts` and this is a
// plain nested map.

import React from 'react';
import { isCurrentWeek } from '@/lib/date/calendar';
import type { Now } from '@/lib/date/clock';
import {
  dateBlockParts,
  formatEventDate,
  formatEventDateRange,
  formatMonthHeading,
} from '@/lib/date/format';
import { useLocale } from '@/components/providers/LocaleProvider';
import { lastNightOf } from '../model/grouping';
import type { EventGroup } from '../model/event';
import type { DateSection, MonthSection } from '../model/sections';
import { EventCard } from './EventCard';
import { EventRow } from './EventRow';
import { SectionHeading } from './SectionHeading';

/**
 * The headline grid: one card per event, grouped under a big date block — the
 * left-hand rail of a printed listings page on desktop, a header line on a
 * phone.
 *
 * When next week has been promoted (Sunday, or an empty current week) the heading
 * says "soon" rather than "this week", since the section then spans two weeks.
 */
export function HighlightedEvents({
  sections,
  showNextWeek,
  now,
  number,
}: {
  sections: DateSection[];
  showNextWeek: boolean;
  now: Now;
  number: number;
}) {
  const { bundle } = useLocale();
  const t = bundle.listing;
  if (sections.length === 0) return null;
  const heading = showNextWeek ? t.sections.comingUp : t.sections.thisWeek;

  return (
    <section aria-labelledby="highlighted-heading">
      <SectionHeading
        id="highlighted-heading"
        number={number}
        kicker={showNextWeek ? t.kickers.comingUp : t.kickers.thisWeek}
        lead={heading.lead}
        em={heading.em}
      />

      <div className="space-y-10 lg:space-y-14">
        {sections.map(({ date, groups }) => (
          <div
            key={date}
            className="grid grid-cols-1 lg:grid-cols-[7.5rem_minmax(0,1fr)] gap-4 lg:gap-8"
          >
            <DateBlock date={date} groups={groups} />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {groups.map((group) => (
                <EventCard
                  key={group.event.id}
                  group={group}
                  isThisWeek={isCurrentWeek(group.dates[0], now.date)}
                  now={now}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * A night's date, set large: the day numeral in Playfair, weekday and month in
 * the mono face. The visual pieces are hidden from assistive tech and the
 * heading carries the same date as one readable phrase.
 *
 * A lone multi-night card puts its whole run under the numeral.
 */
function DateBlock({ date, groups }: { date: string; groups: EventGroup[] }) {
  const { locale } = useLocale();
  const parts = dateBlockParts(date, locale);
  const run =
    groups.length === 1 && groups[0].nightCount > 1
      ? formatEventDateRange(groups[0].dates[0], lastNightOf(groups[0]), locale)
      : null;
  const spoken = run ?? formatEventDate(date, locale);

  return (
    <h3 className="lg:sticky lg:top-24 self-start flex lg:flex-col items-baseline lg:items-start gap-x-3 border-b border-[var(--surface-container-highest)] lg:border-b-0 pb-2 lg:pb-0">
      <span className="sr-only">{spoken}</span>
      {parts ? (
        <>
          <span
            aria-hidden="true"
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)] lg:order-1"
          >
            {parts.weekdayLong}
          </span>
          <span
            aria-hidden="true"
            className="font-serif font-black text-[2.75rem] lg:text-[4.25rem] leading-none tracking-tight text-[var(--on-surface)] lg:order-2 lg:mt-1"
          >
            {parts.day}
          </span>
          <span
            aria-hidden="true"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--on-surface-variant)] lg:order-3 lg:mt-1"
          >
            {run ?? parts.monthShort}
          </span>
        </>
      ) : (
        <span aria-hidden="true">{spoken}</span>
      )}
    </h3>
  );
}

/** Everything further out, as compact rows under a month heading. */
export function UpcomingEvents({
  sections,
  showNextWeek,
  number,
}: {
  sections: MonthSection[];
  showNextWeek: boolean;
  number: number;
}) {
  const { locale, bundle } = useLocale();
  const t = bundle.listing;
  if (sections.length === 0) return null;
  const heading = showNextWeek ? t.sections.later : t.sections.upcoming;

  return (
    <section aria-labelledby="upcoming-heading">
      <SectionHeading
        id="upcoming-heading"
        number={number}
        kicker={showNextWeek ? t.kickers.later : t.kickers.upcoming}
        lead={heading.lead}
        em={heading.em}
      />

      <div>
        {/* The gap between months lives on this wrapper, not the heading — as
            siblings, `first:mt-0` correctly exempts only the first month. */}
        {sections.map(({ month, groups }) => (
          <div key={month} className="mt-10 first:mt-0">
            <div className="flex items-baseline gap-4 mb-2 pb-2 border-b-2 border-[var(--border-ink)]">
              <h3 className="font-serif italic text-2xl text-[var(--on-surface)] whitespace-nowrap">
                {formatMonthHeading(month, locale)}
              </h3>
              <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--on-surface-variant)] tabular-nums">
                {groups.length}{' '}
                {groups.length === 1 ? bundle.filters.eventNoun.one : bundle.filters.eventNoun.other}
              </span>
            </div>
            {groups.map((group) => (
              <EventRow key={group.event.id} group={group} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
