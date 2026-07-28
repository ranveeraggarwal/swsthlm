import React from 'react';
import type { Metadata } from 'next';
import { AboutContent } from '@/features/about/AboutContent';
import { dictionary, localeAlternates } from '@/lib/i18n';

const t = dictionary('en').meta.about;

// No `openGraph` here on purpose — unlike the homepage and permalinks, this
// route has no sibling `opengraph-image.tsx`; it inherits the site image from
// `app/(en)/opengraph-image.tsx` one segment up. Next merges a *sibling* image
// into a page's own `openGraph`, but an *inherited* one is part of the parent's
// block and is replaced wholesale the moment this page declares its own. So
// declaring one here would silently cost the About page its share image. The
// layout's block already carries `og:locale`, and Next fills `og:title` /
// `og:description` from the `title` / `description` above.
export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('en', '/about'),
};

export default function AboutPage() {
  return <AboutContent />;
}
