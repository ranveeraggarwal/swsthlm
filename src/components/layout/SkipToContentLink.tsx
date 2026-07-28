'use client';

// Split out from layout.tsx so its text can come from the locale bundle.
// `layout.tsx` is a Server Component; `useLocale()` needs a client one.

import { useLocale } from '@/components/providers/LocaleProvider';

export function SkipToContentLink() {
  const { bundle } = useLocale();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-[var(--surface-container-lowest)] focus:text-[var(--primary)] focus:font-bold focus:underline outline-none"
    >
      {bundle.a11y.skipToContent}
    </a>
  );
}
