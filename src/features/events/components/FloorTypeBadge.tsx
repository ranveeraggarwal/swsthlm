import React from 'react';
import { LayoutGrid, Landmark, Beer, Palmtree } from 'lucide-react';
import type { FloorType } from '@/lib/data/types';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locale';
import { floorTypeLabel } from '../model/labels';

// Icons only — the wording lives in `../model/labels.ts` with the rest of the
// value→text mappings, so the Swedish copy can't drift from the English.
const FLOOR_TYPE_ICONS: Record<FloorType, React.ComponentType<{ className?: string }>> = {
  studio: LayoutGrid,
  hall: Landmark,
  bar: Beer,
  outdoor: Palmtree,
};

// Neutral styling on purpose — this describes the room, not a quality
// judgment, so it shouldn't read as better/worse the way a rating would.
export function FloorTypeBadge({
  floorType,
  locale = DEFAULT_LOCALE,
}: {
  floorType?: FloorType;
  locale?: Locale;
}) {
  const Icon = floorType ? FLOOR_TYPE_ICONS[floorType] : undefined;
  if (!floorType || !Icon) return null;
  const label = floorTypeLabel(floorType, locale);

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[var(--surface-container)] text-[var(--on-surface-variant)] border border-[var(--surface-container-highest)] text-[10px] font-bold uppercase tracking-wider">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
