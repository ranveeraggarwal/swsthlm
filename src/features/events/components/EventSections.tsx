'use client';

// The two ways the homepage lists events: a card grid for the near week, and a
// compact month-grouped list for everything after.
//
// The month-grouped list used to be a `reduce` that accumulated `React.ReactNode[]`
// inline in JSX, interleaving headings with rows as a side effect of the
// accumulator. The grouping now happens in `../model/sections.ts` and this is a
// plain nested map.

import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { isCurrentWeek } from '@/lib/date/calendar';
import type { Now } from '@/lib/date/clock';
import { formatEventDate, formatEventDateRange, formatMonthHeading } from '@/lib/date/format';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { EventGroup } from '../model/event';
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
        className={`w-5 h-5 shrink-0 ${muted ? 'text-[var(--on-surface-variant)]' : 'text-[var(--primary)]'}`}
      />
      <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--on-surface)]">
        {children}
      </h2>
    </div>
  );
}

/**
 * One date's card grid.
 *
 * At rest (`expandedIds.size === 0`), CSS Grid's default `items-stretch` aligns
 * sibling cards on the same row to equal height (#465). When a visitor clicks
 * "Read more" on one card, we snapshot the collapsed heights of its neighbours
 * and switch the grid to `items-start` so *only* the clicked card grows —
 * neighbours neither stretch down with blank paper nor jump shorter.
 */
function HighlightedDateGrid({
  groups,
  now,
}: {
  groups: EventGroup[];
  now: Now;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [lockedHeights, setLockedHeights] = useState<Record<string, number>>({});

  // Drop stale locked heights if the viewport width changes across breakpoints.
  useEffect(() => {
    if (expandedIds.size === 0) return;
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        setLockedHeights({});
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [expandedIds.size]);

  const toggleCard = (cardId: string) => {
    const isClosingLast = expandedIds.size === 1 && expandedIds.has(cardId);
    if (isClosingLast) {
      setExpandedIds(new Set());
      setLockedHeights({});
      return;
    }

    if (expandedIds.size === 0 && gridRef.current) {
      const snapshot: Record<string, number> = {};
      const nodes = gridRef.current.querySelectorAll<HTMLElement>('[data-card-id]');
      nodes.forEach((node) => {
        const id = node.dataset.cardId;
        if (id) snapshot[id] = Math.round(node.getBoundingClientRect().height);
      });
      setLockedHeights(snapshot);
    }

    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const anyExpanded = expandedIds.size > 0;

  return (
    <div
      ref={gridRef}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
        anyExpanded ? 'items-start' : ''
      }`}
    >
      {groups.map((group) => {
        const id = group.event.id;
        const isExpanded = expandedIds.has(id);
        return (
          <EventCard
            key={id}
            group={group}
            isThisWeek={isCurrentWeek(group.dates[0], now.date)}
            now={now}
            expanded={isExpanded}
            onToggleExpand={() => toggleCard(id)}
            minHeight={anyExpanded && !isExpanded ? lockedHeights[id] : undefined}
          />
        );
      })}
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
  const { locale, bundle } = useLocale();
  const t = bundle.listing.sections;
  if (sections.length === 0) return null;

  return (
    <div>
      <SectionHeading>
        {showNextWeek ? (
          <span className="italic">{t.comingUp.em}</span>
        ) : (
          <>
            {t.thisWeek.lead}
            <span className="italic">{t.thisWeek.em}</span>
          </>
        )}
      </SectionHeading>

      <div className="space-y-8">
        {sections.map(({ date, groups }) => (
          <div key={date} className="space-y-4">
            <h2 className="font-sans text-xs font-bold text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 py-1.5 px-3 rounded inline-block border border-[var(--primary)]/15">
              {/* A lone multi-night card puts its whole run in the heading. */}
              {groups.length === 1 && groups[0].nightCount > 1
                ? formatEventDateRange(groups[0].dates[0], lastNightOf(groups[0]), locale)
                : formatEventDate(date, locale)}
            </h2>

            <HighlightedDateGrid groups={groups} now={now} />
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
  const { locale, bundle } = useLocale();
  const t = bundle.listing.sections;
  if (sections.length === 0) return null;

  return (
    <div className="pt-4">
      <SectionHeading muted>
        {showNextWeek ? (
          <span className="italic">{t.later.em}</span>
        ) : (
          <>
            {t.upcoming.lead}
            <span className="italic">{t.upcoming.em}</span>
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
                {formatMonthHeading(month, locale)}
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
