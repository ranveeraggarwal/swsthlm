'use client';

import React from 'react';
import { LayoutGrid, Landmark, Beer, Palmtree } from 'lucide-react';
import type { FloorType } from '@/lib/data/types';
import { floorTypeLabel } from '../model/labels';
import { useLocale } from '@/components/providers/LocaleProvider';

// The icon per floor type — structure, not a word, so it stays local rather
// than moving to the locale bundle with the label (see `labels.ts`).
const FLOOR_TYPE_ICONS: Record<FloorType, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>> = {
  studio: LayoutGrid,
  hall: Landmark,
  bar: Beer,
  outdoor: Palmtree,
};

// Neutral styling on purpose — this describes the room, not a quality
// judgment, so it shouldn't read as better/worse the way a rating would.
export function FloorTypeBadge({ floorType }: { floorType?: FloorType }) {
  const { locale } = useLocale();
  const Icon = floorType ? FLOOR_TYPE_ICONS[floorType] : undefined;
  if (!floorType || !Icon) return null;
  const label = floorTypeLabel(floorType, locale);

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[var(--surface-container)] text-[var(--on-surface-variant)] border border-[var(--surface-container-highest)] text-[10px] font-bold uppercase tracking-wider">
      <Icon className="w-3 h-3" aria-hidden="true" />
      {label}
    </span>
  );
}
