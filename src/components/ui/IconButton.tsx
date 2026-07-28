'use client';

// The square icon buttons in every event's action row: share, add to calendar,
// report wrong info. One class string, one set of behaviours.
//
// `stopPropagation` on click is load-bearing: cards are clickable and rows are
// buttons, so an action button that let its click bubble would also toggle the
// thing it sits inside (issue #87).

import React from 'react';

interface IconButtonProps {
  onClick: () => void;
  /** The `aria-label`. Say what it does to *this* event, e.g. "…about X". */
  label: string;
  /** Hover tooltip, when a shorter phrasing reads better than the full label.
   *  Defaults to `label`. */
  title?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ onClick, label, title, icon: Icon }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        title={title ?? label}
        aria-label={label}
        className="inline-flex items-center justify-center w-10 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors cursor-pointer shrink-0"
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
      </button>
    );
  },
);
