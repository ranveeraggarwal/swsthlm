import React from 'react';
import type { Metadata } from 'next';
import { stockholmNow } from '@/lib/date/clock';
import { HomePageBody } from '@/features/events/components/HomePageBody';
import { getEvents } from '@/features/events/loader';
import { dictionary, localeAlternates, localeOpenGraph } from '@/lib/i18n';

// Mirrors `app/(en)/page.tsx`. Same data, same component — only the metadata
// and the URL differ.
export const dynamic = 'force-static';

const t = dictionary('sv').meta.home;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  // Same English path as `app/(en)/page.tsx` passes — the helper derives both
  // sides, so the hreflang pair can't drift out of reciprocity.
  alternates: localeAlternates('sv', '/'),
  openGraph: localeOpenGraph('sv', { title: t.title, description: t.description, path: '/' }),
};

export default async function Page() {
  const events = await getEvents();
  return <HomePageBody events={events} initialNow={stockholmNow()} />;
}
