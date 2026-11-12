import React from 'react';
import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/layout/NotFoundContent';

// Metadata stays English for crawlers and the browser tab (see docs/PROJECT.md);
// visible copy follows the visitor's active locale inside `NotFoundContent`.
export const metadata: Metadata = {
  title: 'Page Not Found | Stockholm Swing',
};

export default function NotFound() {
  return <NotFoundContent />;
}
