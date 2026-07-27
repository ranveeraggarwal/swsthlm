import React from 'react';
import type { Now } from '@/lib/date/clock';
import type { SwingEvent } from '../model/event';
import { eventsJsonLd } from '../jsonld';
import { EventCalendar } from './EventCalendar';

/**
 * The homepage body shared by the English (`/`) and Swedish (`/sv`) routes —
 * the JSON-LD script, the hero, and the event listing. Still English-only
 * copy in the hero; #263 threads a `locale` prop through here once the
 * chrome dictionary has `home` strings to render.
 */
export function HomePageBody({
  events,
  initialNow,
}: {
  events: SwingEvent[];
  initialNow: Now;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: eventsJsonLd(events) }}
      />
      {/* Compact Hero */}
      <div className="text-center max-w-2xl mx-auto mb-4 mt-0">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[var(--on-surface)] leading-tight">
          Stockholm in <span className="italic font-normal">Full Swing</span>
        </h1>
        <p className="mt-1 font-sans text-xs md:text-sm text-[var(--on-surface-variant)] leading-relaxed max-w-md mx-auto">
          Your guide to Lindy Hop, Balboa, Shag, and Blues social dancing in Stockholm.
        </p>
      </div>

      {/* The listing is a client component: filtering and the temporal badges
          both need a live clock, which static HTML can't have. It's seeded with
          the build-time reading so the first paint matches. */}
      <EventCalendar events={events} initialNow={initialNow} />
    </div>
  );
}
