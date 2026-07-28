'use client';

// The site's one modal. Add-to-calendar, subscribe and report-a-correction all
// used to carry their own copy of this — portal, backdrop, Escape handler, scroll
// lock, focus move, focus restore, close button, icon medallion, title, mobile
// sheet styling — about sixty near-identical lines each, and they had already
// drifted (one of the three forgot the portal).
//
// The accessibility behaviour is the reason to keep it in one place. Every item
// below has shipped wrong somewhere before:
//
//   • Focus moves into the dialog on open, and back to the trigger on close.
//     The dialog unmounts on close, which drops focus to <body> unless it is
//     explicitly restored.
//   • Escape closes.
//   • Body scroll is locked while open, and the previous value is restored — not
//     assumed to be ''.
//   • The backdrop click closes; clicks inside must not bubble to it.
//   • `role="dialog"`, `aria-modal`, and a labelled title.

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  /** Rendered only when true; mounting is what triggers the focus move. */
  open: boolean;
  onClose: () => void;
  title: string;
  /** Unique per instance — cards render many of these on one page. */
  id: string;
  /** The lucide icon for the medallion above the title. */
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  /** Wider variant for the correction form; the calendar pickers use the default. */
  width?: 'sm' | 'md';
  children: React.ReactNode;
}

const WIDTHS = { sm: 'sm:max-w-sm', md: 'sm:max-w-md' } as const;

export function Modal({ open, onClose, title, id, icon: Icon, width = 'sm', children }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 bg-[var(--on-surface)]/40 animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* A bottom sheet on mobile, a centred card on desktop. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-t-lg border-2 border-[var(--border-ink)] bg-[var(--surface-container-lowest)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-left normal-case tracking-normal animate-in slide-in-from-bottom-4 duration-200 sm:rounded-lg sm:pb-6 sm:shadow-[4px_4px_0px_0px_var(--shadow-ink)] sm:zoom-in-95 sm:slide-in-from-bottom-1 ${WIDTHS[width]}`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          title="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-[var(--outline)] hover:bg-[var(--surface-container)] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--border-ink)] bg-[var(--primary)]">
          <Icon className="h-6 w-6 text-[var(--on-primary)]" aria-hidden="true" />
        </div>

        <h2
          id={`${id}-title`}
          className="font-serif text-2xl font-bold tracking-tight text-[var(--on-surface)]"
        >
          {title}
        </h2>

        {children}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Wires a trigger button to a Modal: tracks open state and returns focus to the
 * trigger on close.
 *
 * Returning a ref to attach to the trigger is the whole point — focus restore is
 * the step that gets forgotten, and this makes it impossible to forget.
 */
export function useModal() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  const close = React.useCallback(() => {
    setOpen(false);
    // The trigger hasn't re-rendered yet at this point, hence the timeout.
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  return { open, triggerRef, openModal: () => setOpen(true), close };
}
