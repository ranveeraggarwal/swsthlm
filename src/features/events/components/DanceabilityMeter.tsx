'use client';

// Venue danceability indicators (1–5 scale, replacing the old four-way
// `FloorTypeBadge`).
//
// Two presentations share the same `labels.ts` wording and semantic token
// tiers:
// - `DanceabilityMeter`: full-width 5-segment horizontal bar used in
//   `EventCard`'s venue band and on `EventPermalink`.
// - `DanceabilityBadge`: compact inline chip with a mini 5-bar icon for the
//   expanded `EventRow` detail strip.

import React from 'react';
import type { Danceability } from '@/lib/data/types';
import { useLocale } from '@/components/providers/LocaleProvider';
import { danceabilityLabel, danceabilityTone } from '../model/labels';

const STEPS: readonly Danceability[] = [1, 2, 3, 4, 5];

export function DanceabilityMeter({
  danceability,
  muted,
  className,
}: {
  danceability?: Danceability;
  muted?: boolean;
  className?: string;
}) {
  const { locale, bundle } = useLocale();
  if (!danceability) return null;

  const label = danceabilityLabel(danceability, locale);
  const tone = danceabilityTone(danceability);

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2 mb-1.5 font-sans">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--outline)]">
          {bundle.danceability.heading}
        </span>
        <span
          className={`text-xs font-bold tabular-nums ${
            muted ? 'text-[var(--on-surface-variant)]' : tone.textClass
          }`}
        >
          {danceability}/5 · {label}
        </span>
      </div>
      <div aria-hidden="true" className="grid grid-cols-5 gap-1.5">
        {STEPS.map((step) => {
          const filled = step <= danceability;
          const segmentClass = filled
            ? muted
              ? 'bg-[var(--outline)]'
              : tone.barClass
            : 'bg-[var(--outline)]/20';
          return <span key={step} className={`h-1.5 rounded-[1px] ${segmentClass}`} />;
        })}
      </div>
    </div>
  );
}

export function DanceabilityBadge({ danceability }: { danceability?: Danceability }) {
  const { locale, bundle } = useLocale();
  if (!danceability) return null;

  const label = danceabilityLabel(danceability, locale);
  const tone = danceabilityTone(danceability);

  return (
    <span
      title={`${bundle.danceability.heading}: ${danceability}/5 · ${label}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${tone.chipClass}`}
    >
      <span aria-hidden="true" className="inline-flex items-center gap-0.5">
        {STEPS.map((step) => (
          <span
            key={step}
            className={`w-1 h-2.5 rounded-[0.5px] ${
              step <= danceability ? tone.barClass : 'bg-[var(--outline)]/25'
            }`}
          />
        ))}
      </span>
      <span className="sr-only">{bundle.danceability.heading}: </span>
      <span className="tabular-nums">{danceability}/5</span>
      <span aria-hidden="true">·</span>
      <span>{label}</span>
    </span>
  );
}
