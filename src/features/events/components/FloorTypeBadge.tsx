import React from 'react';
import { LayoutGrid, Landmark, Beer, Palmtree } from 'lucide-react';
import type { FloorType } from '@/lib/data/types';

const FLOOR_TYPES: Record<
  FloorType,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  studio: { label: 'Dance studio', Icon: LayoutGrid },
  hall: { label: 'Dance hall', Icon: Landmark },
  bar: { label: 'Bar / restaurant', Icon: Beer },
  outdoor: { label: 'Outdoor', Icon: Palmtree },
};

// Neutral styling on purpose — this describes the room, not a quality
// judgment, so it shouldn't read as better/worse the way a rating would.
export function FloorTypeBadge({ floorType }: { floorType?: FloorType }) {
  const info = floorType ? FLOOR_TYPES[floorType] : undefined;
  if (!info) return null;
  const { label, Icon } = info;

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[var(--surface-container)] text-[var(--on-surface-variant)] border border-[var(--surface-container-highest)] text-[10px] font-bold uppercase tracking-wider">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
