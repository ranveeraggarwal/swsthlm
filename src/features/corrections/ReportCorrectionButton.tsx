'use client';

// "Wrong info?" correction dialog — issue #28.
//
// A flag button sits in every event's action row. It opens a short form — what's
// wrong, what it should say, how you know — and hands the answers to the
// reporter's mail client as a prefilled message to corrections@, together with a
// snapshot of what the site currently claims, so the maintainer knows which row
// to edit and what it said at the time.
//
// There is no endpoint and no submit handler: "send" is a `mailto:` link that
// rebuilds as you type. That keeps the static-site shape (CLAUDE.md principle 2)
// while still giving the reporter a form rather than a blank email they have to
// structure themselves.

import React, { useRef, useState } from 'react';
import { Flag, Mail } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Modal, useModal } from '@/components/ui/Modal';
import { domIdFor, type SwingEvent } from '@/features/events/model/event';
import {
  CORRECTIONS_EMAIL,
  CORRECTION_PROMPTS,
  buildCorrectionMailto,
  currentDetails,
} from './report';

interface ReportCorrectionButtonProps {
  event: SwingEvent;
  /** Every night the card covers, when it represents a multi-night run. */
  dates?: string[];
}

const fieldClass =
  'w-full rounded border border-[var(--border-ink)] bg-[var(--surface-container-lowest)] px-3 py-2 font-sans text-sm text-[var(--on-surface)] placeholder:text-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

const labelClass =
  'block font-sans text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-1.5';

export function ReportCorrectionButton({ event, dates }: ReportCorrectionButtonProps) {
  const { open, triggerRef, openModal, close } = useModal();

  const [whatsWrong, setWhatsWrong] = useState('');
  const [shouldSay, setShouldSay] = useState('');
  const [howYouKnow, setHowYouKnow] = useState('');
  const [missingWhatsWrong, setMissingWhatsWrong] = useState(false);
  const whatsWrongRef = useRef<HTMLTextAreaElement>(null);

  const dialogId = domIdFor(event, 'correction');
  const href = buildCorrectionMailto(event, dates, { whatsWrong, shouldSay, howYouKnow });

  // A report with no "what's wrong" is a blank email; block the send and point at
  // the field rather than letting one arrive that nobody can act on.
  const handleSend = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!whatsWrong.trim()) {
      e.preventDefault();
      setMissingWhatsWrong(true);
      whatsWrongRef.current?.focus();
      return;
    }
    close();
  };

  return (
    <>
      <IconButton
        ref={triggerRef}
        onClick={openModal}
        label={`Report wrong info about ${event.title}`}
        title="Report wrong info"
        icon={Flag}
      />

      <Modal
        open={open}
        onClose={close}
        id={dialogId}
        title="Send a correction"
        icon={Flag}
        width="md"
      >
        <p className="mt-1.5 font-sans text-sm leading-relaxed text-[var(--on-surface-variant)]">
          Tell us what&apos;s wrong with <span className="font-bold">{event.title}</span> and
          we&apos;ll fix the listing. This opens an email — nothing is sent until you send it.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor={`${dialogId}-wrong`} className={labelClass}>
              {CORRECTION_PROMPTS.whatsWrong}
              <span className="text-[var(--error)] ml-1" aria-hidden="true">*</span>
            </label>
            <textarea
              ref={whatsWrongRef}
              id={`${dialogId}-wrong`}
              required
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

        {/* The snapshot travels in the email whether or not it's expanded here;
            showing it is about trust, not input. */}
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
      </Modal>
    </>
  );
}
