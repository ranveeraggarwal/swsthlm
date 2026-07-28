import React from 'react';
import type { Metadata } from 'next';
import { stockholmNow } from '@/lib/date/clock';
import { HomePageBody } from '@/features/events/components/HomePageBody';
import { getEvents } from '@/features/events/loader';
import { dictionary, localeAlternates, localeOpenGraph } from '@/lib/i18n';

// Built statically from /data; rebuilt on push to main via the Vercel deploy
// hook. The event list is fixed at build; only the temporal badges are live
// (computed client-side after hydration).
export const dynamic = 'force-static';

const t = dictionary('en').meta.home;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('en', '/'),
  openGraph: localeOpenGraph('en', { title: t.title, description: t.description, path: '/' }),
};

export default async function Page() {
  const events = await getEvents();
  return <HomePageBody events={events} initialNow={stockholmNow()} />;
}
