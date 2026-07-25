// Apple / Google / Outlook logos, plus the button styling shared by the
// add-to-calendar and subscribe dialogs. These SVG paths were duplicated
// verbatim in both.
//
// The brand fills are the one sanctioned exception to the "tokens only" colour
// rule in docs/DESIGN.md: they are other companies' marks, not our palette, and
// they must look the same in light and dark theme. Written out in full so
// Tailwind can see the class names.

import React from 'react';

export const AppleMark = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

export const GoogleMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
  </svg>
);

export const OutlookMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
  </svg>
);

/** Per-provider brand fill for the dialog buttons. */
export const PROVIDER_FILL = {
  apple: 'bg-white text-black',
  google: 'bg-[#4F6FE5] text-white',
  outlook: 'bg-[#28A8EA] text-white',
} as const;

export const PROVIDER_MARKS = {
  apple: AppleMark,
  google: GoogleMark,
  outlook: OutlookMark,
} as const;

export type CalendarProvider = keyof typeof PROVIDER_MARKS;

export const PROVIDER_LABELS: Record<CalendarProvider, string> = {
  apple: 'Apple Calendar',
  google: 'Google Calendar',
  outlook: 'Outlook Calendar',
};

/** The shared "sticker" button styling: heavy border, lift on hover. */
export const PROVIDER_BUTTON_CLASS =
  'flex items-center justify-center gap-2.5 rounded border-2 border-[var(--border-ink)] px-4 py-3 font-sans text-sm font-bold transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-ink)]';
