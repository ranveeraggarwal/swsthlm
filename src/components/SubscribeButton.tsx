'use client';

// "Subscribe" button + popup (issue #8): solid brand-colored buttons with
// provider logos plus a copyable feed URL. Subscribing (rather than a one-time
// import) means new events and changes sync automatically.

import React, { useEffect, useRef, useState } from 'react';
import { CalendarPlus, Check, Copy, X } from 'lucide-react';

// The public production host. Subscriptions must point at the stable origin
// (not a preview deploy), so this is fixed rather than read from window.
const FEED_HOST = 'stockholmswing.com';
const FEED_PATH = '/calendar.ics';
const CAL_NAME = 'Stockholm Swing Dance Calendar';

const httpsUrl = `https://${FEED_HOST}${FEED_PATH}`;
const webcalUrl = `webcal://${FEED_HOST}${FEED_PATH}`;

// webcal:// triggers the OS default calendar app (Apple Calendar, etc.).
const googleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;
const outlookUrl =
  `https://outlook.live.com/calendar/0/addfromweb?` +
  `url=${encodeURIComponent(webcalUrl)}&name=${encodeURIComponent(CAL_NAME)}`;

// Monochrome provider marks, rendered in the button's text color.
const GoogleMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
  </svg>
);
const OutlookMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
  </svg>
);
const AppleMark = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

// Solid brand fills with the provider logo. Class strings are written out in
// full so Tailwind can see and generate them.
// Solid brand fills with the provider logo, in the site's "sticker" idiom
// (navy border + offset lift on hover). Class strings are written out in full
// so Tailwind can see and generate them.
const OPTIONS: { label: string; href: string; className: string; Mark: React.FC }[] = [
  {
    label: 'Apple Calendar',
    href: webcalUrl,
    className: 'bg-white text-black',
    Mark: AppleMark,
  },
  {
    label: 'Google Calendar',
    href: googleUrl,
    className: 'bg-[#4F6FE5] text-white',
    Mark: GoogleMark,
  },
  {
    label: 'Outlook Calendar',
    href: outlookUrl,
    className: 'bg-[#28A8EA] text-white',
    Mark: OutlookMark,
  },
];

export function SubscribeButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(httpsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silent fail.
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 font-bold normal-case text-[var(--secondary)] hover:underline transition-colors cursor-pointer"
      >
        <CalendarPlus className="w-3.5 h-3.5" />
        Subscribe
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 bg-[var(--on-surface)]/40 animate-in fade-in duration-150"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscribe-title"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-lg border-2 border-[var(--on-surface)] bg-[var(--surface-container-lowest)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-left normal-case tracking-normal animate-in slide-in-from-bottom-4 duration-200 sm:max-w-sm sm:rounded-lg sm:pb-6 sm:shadow-[4px_4px_0px_0px_var(--on-surface)] sm:zoom-in-95 sm:slide-in-from-bottom-1"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-1.5 text-[var(--outline)] hover:bg-[var(--surface-container)] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--on-surface)] bg-[var(--primary)]">
              <CalendarPlus className="h-6 w-6 text-white" />
            </div>

            <h2
              id="subscribe-title"
              className="font-serif text-2xl font-bold tracking-tight text-[var(--on-surface)]"
            >
              Subscribe to Calendar
            </h2>
            <p className="mt-1.5 font-sans text-sm leading-relaxed text-[var(--on-surface-variant)]">
              Add the event feed to your calendar app, kept up to date
              automatically.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              {OPTIONS.map(({ label, href, className, Mark }) => {
                // webcal:// hands off to the OS calendar app — let it navigate
                // directly; a new tab breaks the handoff on iOS Safari. The
                // web (https) flows open in a new tab as usual.
                const isWebcal = href.startsWith('webcal:');
                return (
                  <a
                    key={label}
                    href={href}
                    target={isWebcal ? undefined : '_blank'}
                    rel={isWebcal ? undefined : 'noopener noreferrer'}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-center gap-2.5 rounded border-2 border-[var(--on-surface)] px-4 py-3 font-sans text-sm font-bold transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--on-surface)] ${className}`}
                  >
                    <Mark />
                    {label}
                  </a>
                );
              })}
            </div>

            <div className="mt-5 flex items-end gap-2">
              <input
                type="text"
                readOnly
                value={httpsUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 border-0 border-b-2 border-[var(--on-surface)] bg-transparent px-1 py-2 font-mono text-xs text-[var(--on-surface-variant)] focus:border-[var(--primary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? 'Copied' : 'Copy feed link'}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-[var(--on-surface)] bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
