import React from 'react';
import type { Metadata } from 'next';
import { AboutContent } from '@/features/about/AboutContent';

// Metadata stays English: it serves crawlers and the browser tab, and this
// site is deliberately English-only to search engines (see docs/PROJECT.md).
export const metadata: Metadata = {
  title: 'About | Stockholm Swing',
  description:
    'One place for every Lindy Hop, Balboa, Blues, and Shag social, workshop, and jam in Stockholm.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <AboutContent />;
}
