import React from 'react';
import { Analytics } from '@vercel/analytics/next';
import type { Locale } from '@/lib/i18n/locale';
import { Header } from './Header';
import { Footer } from './Footer';
import { InstallToast } from './InstallToast';

/**
 * The `<body>` content shared by both root layouts (English and Swedish —
 * see `app/(en)/layout.tsx` / `app/sv/layout.tsx`). Each locale's `layout.tsx`
 * still owns its own `<html>`, fonts, and theme boot script; this is just the
 * part that would otherwise be copy-pasted between the two.
 */
export function RootShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <body className="min-h-full flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-[var(--surface-container-lowest)] focus:text-[var(--primary)] focus:font-bold focus:underline outline-none"
      >
        Skip to content
      </a>
      <div className="min-h-screen flex flex-col relative bg-[var(--background)] text-[var(--on-surface)]">
        <Header locale={locale} />
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
      <InstallToast />
      <Analytics />
    </body>
  );
}
