'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPlus, Download, X } from 'lucide-react';
import { buildSingleEventCalendar } from '@/lib/ical';
import { addDays } from '@/lib/data/expand';
import type { SwingEvent } from '@/types/event';

const SITE_URL = 'https://stockholmswing.com';

function formatGoogleDate(dateISO: string, time: string): string {
  return `${dateISO.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

function buildGoogleUrl(event: SwingEvent): string {
  const startDate = formatGoogleDate(event.date, event.start);
  const endDateISO = event.end <= event.start ? addDays(event.date, 1) : event.date;
  const endDate = formatGoogleDate(endDateISO, event.end);
  const location = [event.venue, event.address].filter(Boolean).join(', ');
  const sourceId = event.id.split(':')[0];
  const permalink = `${SITE_URL}/event/${sourceId}/${event.date}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    ctz: 'Europe/Stockholm',
    location,
    details: permalink,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function buildOutlookUrl(event: SwingEvent): string {
  const endDateISO = event.end <= event.start ? addDays(event.date, 1) : event.date;
  const location = [event.venue, event.address].filter(Boolean).join(', ');
  const sourceId = event.id.split(':')[0];
  const permalink = `${SITE_URL}/event/${sourceId}/${event.date}`;

  const params = new URLSearchParams({
    rru: 'addevent',
    subject: event.title,
    startdt: `${event.date}T${event.start}:00`,
    enddt: `${endDateISO}T${event.end}:00`,
    location,
    body: permalink,
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params}`;
}

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

interface AddToCalendarButtonProps {
  event: SwingEvent;
}

export function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    setOpen(false);
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

  const handleDownloadIcs = () => {
    const ics = buildSingleEventCalendar(event, { siteUrl: SITE_URL });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.id.split(':')[0]}-${event.date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleClose();
  };

  const options: { label: string; action: string | (() => void); className: string; Mark: React.FC }[] = [
    {
      label: 'Apple Calendar',
      action: handleDownloadIcs,
      className: 'bg-white text-black',
      Mark: AppleMark,
    },
    {
      label: 'Google Calendar',
      action: buildGoogleUrl(event),
      className: 'bg-[#4F6FE5] text-white',
      Mark: GoogleMark,
    },
    {
      label: 'Outlook Calendar',
      action: buildOutlookUrl(event),
      className: 'bg-[#28A8EA] text-white',
      Mark: OutlookMark,
    },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        title="Add to calendar"
        aria-label="Add to calendar"
        className="inline-flex items-center justify-center w-10 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors cursor-pointer shrink-0"
      >
        <CalendarPlus className="w-4 h-4" />
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 bg-[var(--on-surface)]/40 animate-in fade-in duration-150"
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-to-cal-title"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-lg border-2 border-[var(--border-ink)] bg-[var(--surface-container-lowest)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-left normal-case tracking-normal animate-in slide-in-from-bottom-4 duration-200 sm:max-w-sm sm:rounded-lg sm:pb-6 sm:shadow-[4px_4px_0px_0px_var(--shadow-ink)] sm:zoom-in-95 sm:slide-in-from-bottom-1"
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
              <CalendarPlus className="h-6 w-6 text-[var(--on-primary)]" />
            </div>

            <h2
              id="add-to-cal-title"
              className="font-serif text-2xl font-bold tracking-tight text-[var(--on-surface)]"
            >
              Add to Calendar
            </h2>
            <p className="mt-1.5 font-sans text-sm leading-relaxed text-[var(--on-surface-variant)]">
              Add <span className="font-bold">{event.title}</span> on {event.date} to your calendar.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              {options.map(({ label, action, className, Mark }) => {
                if (typeof action === 'function') {
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={action}
                      className={`flex items-center justify-center gap-2.5 rounded border-2 border-[var(--border-ink)] px-4 py-3 font-sans text-sm font-bold transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-ink)] cursor-pointer ${className}`}
                    >
                      <Mark />
                      {label}
                    </button>
                  );
                }
                return (
                  <a
                    key={label}
                    href={action}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClose}
                    className={`flex items-center justify-center gap-2.5 rounded border-2 border-[var(--border-ink)] px-4 py-3 font-sans text-sm font-bold transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-ink)] ${className}`}
                  >
                    <Mark />
                    {label}
                  </a>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleDownloadIcs}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded border border-[var(--border-ink)] bg-[var(--surface-container)] px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download .ics file
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
