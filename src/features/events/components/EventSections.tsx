'use client';

// The two ways the homepage lists events: a card grid for the near week, and a
// compact month-grouped list for everything after.
//
// The month-grouped list used to be a `reduce` that accumulated `React.ReactNode[]`
// inline in JSX, interleaving headings with rows as a side effect of the
// accumulator. The grouping now happens in `../model/sections.ts` and this is a
// plain nested map.

import React from 'react';
import { CalendarDays } from 'lucide-react';
import { isCurrentWeek } from '@/lib/date/calendar';
import type { Now } from '@/lib/date/clock';
import { formatEventDate, formatEventDateRange, formatMonthHeading } from '@/lib/date/format';
import { lastNightOf } from '../model/grouping';
import type { DateSection, MonthSection } from '../model/sections';
import { EventCard } from './EventCard';
import { EventRow } from './EventRow';

/** Section heading, shared by both lists so the icon and type scale stay in step. */
function SectionHeading({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mb-6 border-b border-[var(--surface-container-highest)] pb-3">
      <CalendarDays
        aria-hidden="true"
        className={`w-5 h-5 ${muted ? 'text-[var(--on-surface-variant)]' : 'text-[var(--primary)]'}`}
      />
      <h2 className="font-serif text-3xl font-bold tracking-tight text-[var(--on-surface)]">
        {children}
      </h2>
    </div>
  );
}

/**
 * The headline grid: one card per event, grouped under a date heading.
 *
 * When next week has been promoted (Sunday, or an empty current week) the heading
 * becomes the vaguer "Coming Up", since the section then spans two weeks.
 */
export function HighlightedEvents({
  sections,
  showNextWeek,
  now,
}: {
  sections: DateSection[];
  showNextWeek: boolean;
  now: Now;
}) {
  if (sections.length === 0) return null;

  return (
    <div>
      <SectionHeading>
        {showNextWeek ? (
          <span className="italic">Coming Up</span>
        ) : (
          <>
            Happening <span className="italic">This Week</span>
          </>
        )}
      </SectionHeading>

      <div className="space-y-8">
        {sections.map(({ date, groups }) => (
          <div key={date} className="space-y-4">
            <h2 className="font-sans text-xs font-bold text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 py-1.5 px-3 rounded inline-block border border-[var(--primary)]/15">
              {/* A lone multi-night card puts its whole run in the heading. */}
              {groups.length === 1 && groups[0].nightCount > 1
                ? formatEventDateRange(groups[0].dates[0], lastNightOf(groups[0]))
                : formatEventDate(date)}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
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
    </div>
  );
}

/** Everything further out, as compact rows under a month rule. */
export function UpcomingEvents({
  sections,
  showNextWeek,
}: {
  sections: MonthSection[];
  showNextWeek: boolean;
}) {
  if (sections.length === 0) return null;

  return (
    <div className="pt-4">
      <SectionHeading muted>
        {showNextWeek ? (
          <span className="italic">Later</span>
        ) : (
          <>
            Upcoming <span className="italic">Events</span>
          </>
        )}
      </SectionHeading>

      <div>
        {/* The gap between months lives on this wrapper, not the heading — as
            siblings, `first:mt-0` correctly exempts only the first month. */}
        {sections.map(({ month, groups }) => (
          <div key={month} className="mt-6 first:mt-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-sans text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-widest whitespace-nowrap">
                {formatMonthHeading(month)}
              </h2>
              <div
                className="flex-1 h-px bg-[var(--surface-container-highest)]"
                aria-hidden="true"
              />
            </div>
            {groups.map((group) => (
              <EventRow key={group.event.id} group={group} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
