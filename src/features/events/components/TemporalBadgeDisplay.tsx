// Renders the badge that `../model/temporal.ts` decided on. One table, so the
// wording and colour of "Happening Now" live next to "Tonight" instead of in a
// switch inside a 300-line card.

import React from 'react';
import type { TemporalBadge } from '../model/temporal';

const BADGE = 'px-2.5 py-0.5 rounded text-[11px] uppercase font-bold tracking-wider';

const BADGES: Record<NonNullable<TemporalBadge>, { label: string; className: string }> = {
  'happening-now': { label: 'Happening Now', className: 'bg-[var(--live)] text-[var(--on-live)]' },
  ended: {
    label: 'Ended',
    className:
      'bg-[var(--ended-container)] text-[var(--on-ended-container)] border border-[var(--ended-outline)]',
  },
  tonight: { label: 'Tonight', className: 'bg-[var(--primary)] text-[var(--on-primary)]' },
  tomorrow: { label: 'Tomorrow', className: 'bg-[var(--secondary)] text-[var(--on-secondary)]' },
  'this-week': {
    label: 'This Week',
    className: 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20',
  },
};

export function TemporalBadgeDisplay({ badge }: { badge: TemporalBadge }) {
  if (!badge) return null;
  const { label, className } = BADGES[badge];

  // "Happening Now" gets a pulsing dot; the others are plain text.
  if (badge === 'happening-now') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${BADGE} ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--on-live)] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--on-live)]" />
        </span>
        {label}
      </span>
    );
  }

  return <span className={`${BADGE} ${className}`}>{label}</span>;
}

/** The accent stripe across the top of a card, coloured to match the badge. */
export function badgeStripeClass(badge: TemporalBadge, isThisWeek: boolean): string {
  switch (badge) {
    case 'happening-now':
      return 'bg-[var(--live)]';
    case 'ended':
      return 'bg-[var(--ended-surface-outline)]';
    case 'tonight':
      return 'bg-[var(--primary)]';
    case 'tomorrow':
      return 'bg-[var(--secondary)]';
    default:
      return isThisWeek ? 'bg-[var(--primary)]' : '';
  }
}
