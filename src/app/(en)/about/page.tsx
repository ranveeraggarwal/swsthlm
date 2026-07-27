import React from 'react';
import type { Metadata } from 'next';
import { AboutContent } from '@/features/about/AboutContent';
import { dictionary } from '@/lib/i18n';

const t = dictionary('en').meta.about;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <AboutContent />;
}
