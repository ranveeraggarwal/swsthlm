'use client';

// Shown when the filters match nothing. It names what emptied the page, offers to
// clear the filters, and — because "no events" is also the moment someone is most
// likely to help — routes them to the feed and to the organizer inbox.

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { CALENDAR_WEBCAL_URL, CONTACT_EMAIL } from '@/lib/site';
import { emptyStateHeading, hasActiveFilters, type EventFilters } from '../model/sections';
import { useLocale } from '@/components/providers/LocaleProvider';

interface EmptyStateProps {
  filters: EventFilters;
  onClearFilters: () => void;
}

export function EmptyState({ filters, onClearFilters }: EmptyStateProps) {
  const { locale, bundle } = useLocale();
  return (
    <div className="text-center py-16 border border-dashed border-[var(--surface-container-highest)] rounded bg-[var(--surface-container-low)] p-8">
      <SlidersHorizontal
        aria-hidden="true"
        className="w-12 h-12 text-[var(--outline)] mx-auto mb-4"
      />
      <h2 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-1">
        {emptyStateHeading(filters, locale)}
      </h2>
      <p className="font-sans font-body-md text-[var(--on-surface-variant)] max-w-sm mx-auto mb-6">
        {bundle.empty.body}
      </p>

      {hasActiveFilters(filters) && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center justify-center px-4 py-2 rounded border-2 border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary transition-all cursor-pointer"
        >
          {bundle.empty.clearAll}
        </button>
      )}

      <p className="font-sans text-xs text-[var(--on-surface-variant)] mt-6">
        <a
          href={CALENDAR_WEBCAL_URL}
          className="text-[var(--primary)] underline hover:no-underline"
        >
          {bundle.empty.subscribeCta}
        </a>
        {' · '}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-[var(--primary)] underline hover:no-underline"
        >
          {bundle.empty.organizersCta}
        </a>
      </p>
    </div>
  );
}
