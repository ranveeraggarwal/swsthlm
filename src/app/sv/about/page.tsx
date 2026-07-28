import React from 'react';
import type { Metadata } from 'next';
import { AboutContent } from '@/features/about/AboutContent';
import { dictionary, localeAlternates } from '@/lib/i18n';

// Mirrors `app/(en)/about/page.tsx`. See `AboutContent`'s header for why the
// prose is still English at this stage — #264 is the translation PR. The
// metadata is already Swedish (#266): it's what gets indexed, so it ships
// ahead of the body copy.
const t = dictionary('sv').meta.about;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  // No `openGraph` — see the note in `app/(en)/about/page.tsx`. `og:locale` on
  // this page comes from `app/sv/layout.tsx`, and the share image from
  // `app/sv/opengraph-image.tsx`.
  alternates: localeAlternates('sv', '/about'),
};

export default function AboutPage() {
  return <AboutContent />;
}
