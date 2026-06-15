import React from 'react';
import { getEvents } from '@/lib/events';
import { getStockholmCurrentDate, getStockholmCurrentTime } from '@/lib/datetime';
import { EventFilters } from '@/components/EventFilters';
import type { Metadata } from 'next';

// Built statically from /data; rebuilt on push to main via the Vercel deploy
// hook. The event list is fixed at build; only the temporal badges are live
// (computed client-side after hydration).
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'This Week in Swing Dance Stockholm | Stockholm Swing',
  description:
    'A lightweight, optimized guide to Lindy Hop, Balboa, Shag, and Blues social dancing and workshops in Stockholm. Real-time updates and edge-cached schedule.',
};

export default async function Page() {
  const events = await getEvents();
  const currentDate = getStockholmCurrentDate();
  const currentTime = getStockholmCurrentTime();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Compact Hero */}
      <div className="text-center max-w-2xl mx-auto mb-4 mt-0">
        <h1 className="font-serif text-2xl md:text-3xl font-black tracking-tight text-[var(--on-surface)] leading-tight">
          Swing Dance <span className="italic font-normal">This Week</span>
        </h1>
        <p className="mt-1 font-sans text-xs md:text-sm text-[var(--on-surface-variant)] leading-relaxed max-w-md mx-auto">
          Your guide to Lindy Hop, Balboa, Shag, and Blues social dancing in Stockholm.
        </p>
      </div>

      {/* Client-Side Interactive Filters and Event Listing */}
      <EventFilters events={events} currentDate={currentDate} currentTime={currentTime} />
    </div>
  );
}
