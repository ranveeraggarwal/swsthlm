// "Wrong info?" link — issue #28.
//
// Low-emphasis link at the foot of every card. Opens the reporter's mail
// client with the correction template and a snapshot of the current listing
// prefilled (see `src/lib/corrections.ts`). Deliberately not a button in the
// primary action row: it should be findable when something is wrong, not
// compete with Tickets / Calendar / Share when everything is right.

import React from 'react';
import { Flag } from 'lucide-react';
import type { SwingEvent } from '@/types/event';
import { buildCorrectionMailto } from '@/lib/corrections';

interface ReportCorrectionLinkProps {
  event: SwingEvent;
  /** All dates covered by the card, when it represents a multi-night run. */
  dates?: string[];
  className?: string;
}

export function ReportCorrectionLink({ event, dates, className = '' }: ReportCorrectionLinkProps) {
  return (
    // py-2/-my-1 keeps the touch target comfortable without adding to the
    // card's visual height.
    <a
      href={buildCorrectionMailto(event, dates)}
      title={`Report wrong information about ${event.title}`}
      className={`inline-flex items-center gap-1.5 py-2 -my-1 font-sans text-xs font-medium text-[var(--on-surface-variant)] hover:text-[var(--primary)] underline decoration-[var(--outline)] underline-offset-4 transition-colors ${className}`}
    >
      <Flag className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      Wrong info?
      {/* Link text alone is ambiguous in a screen-reader link list — every card
          would read "Wrong info?" with nothing to tell them apart. */}
      <span className="sr-only"> Report a correction for {event.title} by email</span>
    </a>
  );
}
