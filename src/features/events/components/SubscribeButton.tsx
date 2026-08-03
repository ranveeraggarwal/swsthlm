'use client';

// Subscribe to the whole feed (issue #8) — the highest-leverage feature on the
// site, since it puts the calendar in a regular's phone permanently.
//
// Subscribing, not importing: the client re-polls and picks up new events and
// changes. `AddToCalendarButton` is the one-time-snapshot counterpart.

import React, { useState } from 'react';
import { CalendarPlus, Check, Copy } from 'lucide-react';
import { Modal, useModal } from '@/components/ui/Modal';
import { useLocale } from '@/components/providers/LocaleProvider';
import {
  PROVIDER_BUTTON_CLASS,
  PROVIDER_FILL,
  PROVIDER_LABELS,
  PROVIDER_MARKS,
  type CalendarProvider,
} from '@/components/ui/CalendarProviderMarks';
import {
  CALENDAR_FEED_URL,
  CALENDAR_NAME,
  CALENDAR_WEBCAL_URL,
} from '@/lib/site';

const COPIED_FEEDBACK_MS = 2000;

// `webcal://` hands off to the OS default calendar app, which is what makes the
// Apple flow one tap. Google and Outlook take the same URL as a parameter.
const SUBSCRIBE_URLS: Record<CalendarProvider, string> = {
  apple: CALENDAR_WEBCAL_URL,
  google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(CALENDAR_WEBCAL_URL)}`,
  outlook:
    `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(CALENDAR_WEBCAL_URL)}` +
    `&name=${encodeURIComponent(CALENDAR_NAME)}`,
};

const PROVIDERS: CalendarProvider[] = ['apple', 'google', 'outlook'];

export function SubscribeButton() {
  const { bundle } = useLocale();
  const t = bundle.actions;
  const { open, triggerRef, openModal, close } = useModal();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CALENDAR_FEED_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard unavailable — the URL is visible in the field regardless.
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        className="flex items-center gap-1.5 font-bold normal-case text-[var(--secondary)] hover:underline transition-colors cursor-pointer"
      >
        <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
        {t.subscribe}
      </button>

      <Modal
        open={open}
        onClose={close}
        id="subscribe"
        title={t.subscribeTitle}
        icon={CalendarPlus}
      >
        <p className="mt-1.5 font-sans text-sm leading-relaxed text-[var(--on-surface-variant)]">
          {t.subscribeBlurb}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {PROVIDERS.map((provider) => {
            const Mark = PROVIDER_MARKS[provider];
            // A `webcal://` link must navigate in place — opening it in a new
            // tab breaks the handoff to the calendar app on iOS Safari.
            const isWebcal = provider === 'apple';
            return (
              <a
                key={provider}
                href={SUBSCRIBE_URLS[provider]}
                target={isWebcal ? undefined : '_blank'}
                rel={isWebcal ? undefined : 'noopener noreferrer'}
                onClick={close}
                className={`${PROVIDER_BUTTON_CLASS} ${PROVIDER_FILL[provider]}`}
              >
                <Mark />
                {PROVIDER_LABELS[provider]}
                {!isWebcal && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            );
          })}
        </div>

        {/* Escape hatch for any client not covered above. */}
        <div className="mt-5 flex items-end gap-2">
          <input
            type="text"
            readOnly
            aria-label={t.feedUrlLabel}
            value={CALENDAR_FEED_URL}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 border-0 border-b-2 border-[var(--border-ink)] bg-transparent px-1 py-2 font-mono text-xs text-[var(--on-surface-variant)] focus:border-[var(--primary)] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? t.copied : t.copyFeedLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shrink-0"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </Modal>
    </>
  );
}
