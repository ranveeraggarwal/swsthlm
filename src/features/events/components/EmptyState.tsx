'use client';

// Shown when the filters match nothing. It names what emptied the page, offers to
// clear the filters, and — because "no events" is also the moment someone is most
// likely to help — routes them to the feed and the submission form.

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { CALENDAR_WEBCAL_URL, EVENT_SUBMISSION_FORM_URL } from '@/lib/site';
import { emptyStateHeading, hasActiveFilters, type EventFilters } from '../model/sections';

interface EmptyStateProps {
  filters: EventFilters;
  onClearFilters: () => void;
}

export function EmptyState({ filters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-16 border border-dashed border-[var(--surface-container-highest)] rounded bg-[var(--surface-container-low)] p-8">
      <SlidersHorizontal
        aria-hidden="true"
        className="w-12 h-12 text-[var(--outline)] mx-auto mb-4"
      />
      <h2 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-1">
        {emptyStateHeading(filters)}
      </h2>
      <p className="font-sans font-body-md text-[var(--on-surface-variant)] max-w-sm mx-auto mb-6">
        Try adjusting your search terms or filters to find dance events.
      </p>

      {hasActiveFilters(filters) && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center justify-center px-4 py-2 rounded border-2 border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary transition-all cursor-pointer"
        >
          Clear all filters
        </button>
      )}

      <p className="font-sans text-xs text-[var(--on-surface-variant)] mt-6">
        <a
          href={CALENDAR_WEBCAL_URL}
          className="text-[var(--primary)] underline hover:no-underline"
        >
          Subscribe to get notified
        </a>
        {' · '}
        <a
          href={EVENT_SUBMISSION_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--primary)] underline hover:no-underline"
        >
          Organizers: add your event
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}
