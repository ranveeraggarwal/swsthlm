import React from 'react';
import type { Metadata } from 'next';
import { AboutContent } from '@/features/about/AboutContent';
import { dictionary } from '@/lib/i18n';

// Mirrors `app/(en)/about/page.tsx`, with the same heading structure and order
// so the two locales stay diffable. Copy comes from `lib/i18n`'s `about`
// namespace (#264).
const t = dictionary('sv').meta.about;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: { canonical: '/sv/about' },
};

export default function AboutPage() {
  return <AboutContent locale="sv" />;
}
