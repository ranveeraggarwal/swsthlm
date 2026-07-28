import React from 'react';
import type { Metadata } from 'next';
import { stockholmNow } from '@/lib/date/clock';
import { HomeHero } from '@/components/layout/HomeHero';
import { EventCalendar } from '@/features/events/components/EventCalendar';
import { getEvents } from '@/features/events/loader';
import { eventsJsonLd } from '@/features/events/jsonld';

// Built statically from /data; rebuilt on push to main via the Vercel deploy
// hook. The event list is fixed at build; only the temporal badges are live
// (computed client-side after hydration).
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Stockholm Swing Dance Calendar | Lindy Hop, Balboa & Blues Events',
  description:
    'The complete guide to swing dancing in Stockholm. Find upcoming Lindy Hop, Balboa, Shag, and Blues socials, live music, and workshops across the city.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Stockholm Swing Dance Calendar | Lindy Hop, Balboa & Blues Events',
    description:
      'The complete guide to swing dancing in Stockholm. Find upcoming Lindy Hop, Balboa, Shag, and Blues socials, live music, and workshops across the city.',
  },
};

export default async function Page() {
  const events = await getEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: eventsJsonLd(events) }}
      />
      <HomeHero />

      {/* The listing is a client component: filtering and the temporal badges
          both need a live clock, which static HTML can't have. It's seeded with
          the build-time reading so the first paint matches. */}
      <EventCalendar events={events} initialNow={stockholmNow()} />
    </div>
  );
}
