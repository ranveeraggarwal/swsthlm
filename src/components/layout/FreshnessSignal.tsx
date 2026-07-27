'use client';

import { useState, useEffect } from 'react';

import { formatRelativeTime } from '@/lib/date/relative';

// The elapsed-time phrase and its plurals live in `lib/date/relative.ts`,
// which already carries the Swedish forms. No `locale` prop yet: the footer
// that renders this isn't locale-aware until #263, and an unused prop
// threaded through Footer now would just have to be re-plumbed then. Adding
// it is a one-line change here plus the call site.
export function FreshnessSignal() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const updatedAt = process.env.NEXT_PUBLIC_DATA_UPDATED_AT;
    if (updatedAt) {
      setLabel(formatRelativeTime(updatedAt, Date.now()));
    }
  }, []);

  if (!label) return null;

  return (
    <span className="text-[var(--on-surface-variant)]">
      Schedule updated {label}
    </span>
  );
}
