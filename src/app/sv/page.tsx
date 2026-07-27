import React from 'react';
import type { Metadata } from 'next';
import { stockholmNow } from '@/lib/date/clock';
import { HomePageBody } from '@/features/events/components/HomePageBody';
import { getEvents } from '@/features/events/loader';
import { dictionary } from '@/lib/i18n';

// Mirrors `app/(en)/page.tsx`. Same data, same component — only the metadata
// and the URL differ. See `src/lib/i18n/sv.ts`'s header for why the copy is
// still English at this stage.
export const dynamic = 'force-static';

const t = dictionary('sv').meta.home;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: { canonical: '/sv' },
  openGraph: {
    title: t.title,
    description: t.description,
  },
};

export default async function Page() {
  const events = await getEvents();
  return <HomePageBody events={events} initialNow={stockholmNow()} />;
}
