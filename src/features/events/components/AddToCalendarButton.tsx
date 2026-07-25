'use client';

// Per-event "add to calendar" (issue #9): a one-time snapshot of a single night,
// as distinct from `SubscribeButton`, which subscribes to the whole feed.
//
// Three routes to the same event. Apple (and anything else that handles .ics)
// gets a generated file; Google and Outlook get a prefilled compose URL, because
// handing them a file makes the user download and re-upload it.

import React from 'react';
import { CalendarPlus, Download } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Modal, useModal } from '@/components/ui/Modal';
import {
  AppleMark,
  PROVIDER_BUTTON_CLASS,
  PROVIDER_FILL,
  PROVIDER_LABELS,
  PROVIDER_MARKS,
} from '@/components/ui/CalendarProviderMarks';
import { addDays } from '@/lib/date/calendar';
import { SITE_URL } from '@/lib/site';
import { buildSingleEventCalendar } from '../ics';
import { domIdFor, eventUrl, type SwingEvent } from '../model/event';

/** YYYYMMDDTHHMMSS — the floating local stamp both compose URLs expect. */
function stampFor(dateISO: string, time: string): string {
  return `${dateISO.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

/** An event ending at or before its start time finishes the following day. */
function endDateOf(event: SwingEvent): string {
  return event.end <= event.start ? addDays(event.date, 1) : event.date;
}

function locationOf(event: SwingEvent): string {
  return [event.venue, event.address].filter(Boolean).join(', ');
}

function googleUrl(event: SwingEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${stampFor(event.date, event.start)}/${stampFor(endDateOf(event), event.end)}`,
    ctz: 'Europe/Stockholm',
    location: locationOf(event),
    details: eventUrl(event),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function outlookUrl(event: SwingEvent): string {
  const params = new URLSearchParams({
    rru: 'addevent',
    subject: event.title,
    startdt: `${event.date}T${event.start}:00`,
    enddt: `${endDateOf(event)}T${event.end}:00`,
    location: locationOf(event),
    body: eventUrl(event),
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params}`;
}

export function AddToCalendarButton({ event }: { event: SwingEvent }) {
  const { open, triggerRef, openModal, close } = useModal();

  const downloadIcs = () => {
    const ics = buildSingleEventCalendar(event, { siteUrl: SITE_URL });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.sourceId}-${event.date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    close();
  };

  return (
    <>
      <IconButton ref={triggerRef} onClick={openModal} label="Add to calendar" icon={CalendarPlus} />

      <Modal
        open={open}
        onClose={close}
        id={domIdFor(event, 'add-to-cal')}
        title="Add to Calendar"
        icon={CalendarPlus}
      >
        <p className="mt-1.5 font-sans text-sm leading-relaxed text-[var(--on-surface-variant)]">
          Add <span className="font-bold">{event.title}</span> on {event.date} to your calendar.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={downloadIcs}
            className={`${PROVIDER_BUTTON_CLASS} ${PROVIDER_FILL.apple} cursor-pointer`}
          >
            <AppleMark />
            {PROVIDER_LABELS.apple}
          </button>

          {(['google', 'outlook'] as const).map((provider) => {
            const Mark = PROVIDER_MARKS[provider];
            return (
              <a
                key={provider}
                href={provider === 'google' ? googleUrl(event) : outlookUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className={`${PROVIDER_BUTTON_CLASS} ${PROVIDER_FILL[provider]}`}
              >
                <Mark />
                {PROVIDER_LABELS[provider]}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            );
          })}
        </div>

        <button
          type="button"
          onClick={downloadIcs}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded border border-[var(--border-ink)] bg-[var(--surface-container)] px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download .ics file
        </button>
      </Modal>
    </>
  );
}
