import React from 'react';
import type { Metadata } from 'next';
import { AboutContent } from '@/features/about/AboutContent';
import { dictionary } from '@/lib/i18n';

// Mirrors `app/(en)/about/page.tsx`. See `AboutContent`'s header for why the
// prose is still English at this stage — #264 is the translation PR.
const t = dictionary('sv').meta.about;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: { canonical: '/sv/about' },
};

export default function AboutPage() {
  return <AboutContent />;
}
