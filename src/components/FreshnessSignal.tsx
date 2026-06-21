'use client';

import { useState, useEffect } from 'react';

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  if (diff < 0) return 'just now';

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
}

export function FreshnessSignal() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const updatedAt = process.env.NEXT_PUBLIC_DATA_UPDATED_AT;
    if (updatedAt) {
      setLabel(formatRelativeTime(updatedAt));
    }
  }, []);

  if (!label) return null;

  return (
    <span className="text-[var(--on-surface-variant)]/50">
      Schedule updated {label}
    </span>
  );
}
