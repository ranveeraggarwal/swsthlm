'use client';

import React from 'react';
import { CalendarPlus } from 'lucide-react';
import { buildSingleEventCalendar } from '@/lib/ical';
import type { SwingEvent } from '@/types/event';

const SITE_URL = 'https://stockholmswing.com';

interface AddToCalendarButtonProps {
  event: SwingEvent;
}

export function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  const handleClick = () => {
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
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Add to calendar"
      aria-label="Add to calendar"
      className="inline-flex items-center justify-center w-10 h-10 rounded border border-[var(--on-surface)] bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors cursor-pointer shrink-0"
    >
      <CalendarPlus className="w-4 h-4" />
    </button>
  );
}
