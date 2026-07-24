'use client';

// "Wrong info?" correction dialog — issue #28.
//
// A flag button sits in every event's action row. It opens a short form: what's
// wrong, what it should say, how you know. Sending hands the answers to the
// reporter's mail client as a prefilled message to corrections@, together with
// a snapshot of what the site currently claims, so the maintainer knows which
// row to edit and what it said at the time.
//
// There is no endpoint and no submit handler — the "send" action is a mailto:
// link that rebuilds as you type. That keeps the static-site shape (CLAUDE.md
// principle 2) while still giving the reporter a form rather than a blank
// email they have to structure themselves.
//
// Modal mechanics (portal, backdrop, Escape, scroll lock, focus restore on
// close) follow AddToCalendarButton — see that file for the same pattern.

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Flag, Mail, X } from 'lucide-react';
import type { SwingEvent } from '@/types/event';
import {
  CORRECTIONS_EMAIL,
  CORRECTION_PROMPTS,
  buildCorrectionMailto,
  currentDetails,
} from '@/lib/corrections';

interface ReportCorrectionButtonProps {
  event: SwingEvent;
  /** All dates covered by the card, when it represents a multi-night run. */
  dates?: string[];
}

const fieldClass =
  'w-full rounded border border-[var(--border-ink)] bg-[var(--surface-container-lowest)] px-3 py-2 font-sans text-sm text-[var(--on-surface)] placeholder:text-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

const labelClass =
  'block font-sans text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-1.5';

export function ReportCorrectionButton({ event, dates }: ReportCorrectionButtonProps) {
  const [open, setOpen] = useState(false);
  const [whatsWrong, setWhatsWrong] = useState('');
  const [shouldSay, setShouldSay] = useState('');
  const [howYouKnow, setHowYouKnow] = useState('');
  const [missingWhatsWrong, setMissingWhatsWrong] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const whatsWrongRef = useRef<HTMLTextAreaElement>(null);

  const dialogId = `correction-${event.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  const handleClose = () => {
    setOpen(false);
    // The dialog unmounts on close, which drops focus to <body> unless it's
    // explicitly put back on the trigger. setTimeout because the trigger hasn't
    // re-rendered yet at this point.
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const href = buildCorrectionMailto(event, dates, { whatsWrong, shouldSay, howYouKnow });

  // A report with no "what's wrong" is a blank email; block the send and point
  // at the field rather than letting one arrive that nobody can act on.
  const handleSend = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!whatsWrong.trim()) {
      e.preventDefault();
      setMissingWhatsWrong(true);
      whatsWrongRef.current?.focus();
      return;
    }
    handleClose();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title="Report wrong info"
        aria-label={`Report wrong info about ${event.title}`}
        className="inline-flex items-center justify-center w-10 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors cursor-pointer shrink-0"
      >
        <Flag className="w-4 h-4" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 bg-[var(--on-surface)]/40 animate-in fade-in duration-150"
            onClick={handleClose}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${dialogId}-title`}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-lg border-2 border-[var(--border-ink)] bg-[var(--surface-container-lowest)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-left normal-case tracking-normal animate-in slide-in-from-bottom-4 duration-200 sm:max-w-md sm:rounded-lg sm:pb-6 sm:shadow-[4px_4px_0px_0px_var(--shadow-ink)] sm:zoom-in-95 sm:slide-in-from-bottom-1"
            >
              <button
                ref={closeRef}
                type="button"
                onClick={handleClose}
                aria-label="Close"
                title="Close"
                className="absolute right-3 top-3 rounded-full p-1.5 text-[var(--outline)] hover:bg-[var(--surface-container)] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--border-ink)] bg-[var(--primary)]">
                <Flag className="h-6 w-6 text-[var(--on-primary)]" />
              </div>

              <h2
                id={`${dialogId}-title`}
                className="font-serif text-2xl font-bold tracking-tight text-[var(--on-surface)]"
              >
                Send a correction
              </h2>
              <p className="mt-1.5 font-sans text-sm leading-relaxed text-[var(--on-surface-variant)]">
                Tell us what&apos;s wrong with <span className="font-bold">{event.title}</span> and
                we&apos;ll fix the listing. This opens an email — nothing is sent until you send it.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor={`${dialogId}-wrong`} className={labelClass}>
                    {CORRECTION_PROMPTS.whatsWrong}
                  </label>
                  <textarea
                    ref={whatsWrongRef}
                    id={`${dialogId}-wrong`}
                    rows={2}
                    value={whatsWrong}
                    onChange={(e) => {
                      setWhatsWrong(e.target.value);
                      if (e.target.value.trim()) setMissingWhatsWrong(false);
                    }}
                    aria-invalid={missingWhatsWrong}
                    aria-describedby={missingWhatsWrong ? `${dialogId}-wrong-error` : undefined}
                    placeholder="The venue was closed, the DJ has changed…"
                    className={`${fieldClass} ${missingWhatsWrong ? 'border-[var(--error)] ring-2 ring-[var(--error)]/30' : ''}`}
                  />
                  {missingWhatsWrong && (
                    <p
                      id={`${dialogId}-wrong-error`}
                      className="mt-1.5 font-sans text-xs font-medium text-[var(--error)]"
                    >
                      Tell us what&apos;s wrong so we know what to fix.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor={`${dialogId}-should`} className={labelClass}>
                    {CORRECTION_PROMPTS.shouldSay}
                  </label>
                  <textarea
                    id={`${dialogId}-should`}
                    rows={2}
                    value={shouldSay}
                    onChange={(e) => setShouldSay(e.target.value)}
                    placeholder="Doors at 19:30, 120 kr…"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor={`${dialogId}-how`} className={labelClass}>
                    {CORRECTION_PROMPTS.howYouKnow}
                  </label>
                  <input
                    id={`${dialogId}-how`}
                    type="text"
                    value={howYouKnow}
                    onChange={(e) => setHowYouKnow(e.target.value)}
                    placeholder="I was there tonight / I organise it"
                    className={fieldClass}
                  />
                </div>
              </div>

              <details className="mt-4 rounded border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-2">
                <summary className="cursor-pointer font-sans text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  What the site currently says
                </summary>
                <ul className="mt-2 space-y-0.5 font-sans text-xs leading-relaxed text-[var(--on-surface-variant)] break-words">
                  {currentDetails(event, dates).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="mt-2 font-sans text-xs text-[var(--outline)]">
                  Included in the email so we can find the listing.
                </p>
              </details>

              <a
                href={href}
                onClick={handleSend}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded border-2 border-[var(--border-ink)] bg-[var(--primary)] px-4 py-3 font-sans text-sm font-bold uppercase tracking-wider text-[var(--on-primary)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-ink)]"
              >
                <Mail className="h-4 w-4" />
                Open email
              </a>

              <p className="mt-3 text-center font-sans text-xs text-[var(--on-surface-variant)]">
                No mail app? Write to{' '}
                <span className="font-bold text-[var(--on-surface)]">{CORRECTIONS_EMAIL}</span>
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
