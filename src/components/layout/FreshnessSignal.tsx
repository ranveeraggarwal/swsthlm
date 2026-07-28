'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { LocaleBundle } from '@/i18n';

/**
 * "3 minutes ago" / "för 3 minuter sedan".
 *
 * The count and the unit go through the locale's `pattern` rather than being
 * concatenated: English suffixes ("… ago") while Swedish circumfixes
 * ("för … sedan"), and a template absorbs that without a special case.
 */
function formatRelativeTime(isoDate: string, relative: LocaleBundle['relativeTime']): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  if (diff < 0) return relative.justNow;

  const say = (count: number, unit: { one: string; other: string }) =>
    relative.pattern
      .replace('{count}', String(count))
      .replace('{unit}', count === 1 ? unit.one : unit.other);

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return relative.justNow;
  if (minutes < 60) return say(minutes, relative.units.minute);

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return say(hours, relative.units.hour);

  const days = Math.floor(hours / 24);
  if (days < 7) return say(days, relative.units.day);

  return say(Math.floor(days / 7), relative.units.week);
}

export function FreshnessSignal() {
  const { bundle } = useLocale();
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // The reading is taken after mount, not during render: it depends on the
  // visitor's clock, which static HTML can't know. Storing the timestamp
  // rather than the formatted label keeps the text in sync when the locale
  // changes, without re-reading the clock.
  useEffect(() => {
    setUpdatedAt(process.env.NEXT_PUBLIC_DATA_UPDATED_AT ?? null);
  }, []);

  if (!updatedAt) return null;

  return (
    <span className="text-[var(--on-surface-variant)]">
      {bundle.freshness.updated.replace(
        '{time}',
        formatRelativeTime(updatedAt, bundle.relativeTime),
      )}
    </span>
  );
}
