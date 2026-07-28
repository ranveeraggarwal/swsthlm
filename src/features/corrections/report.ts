// "Wrong info?" corrections — issue #28.
//
// Every card carries a link that opens the reporter's mail client with a
// prefilled correction report: a short template for what's wrong, plus a
// snapshot of what the site currently claims. The snapshot matters because
// most reports arrive from someone standing outside a locked venue, and the
// maintainer needs to know which row to edit and what it said at the time.
//
// This is a `mailto:` link and nothing else — no form, no endpoint, no
// server. It fits the static-site shape (CLAUDE.md principle 2) and works
// with JS disabled.

import { CORRECTIONS_EMAIL } from '@/lib/site';
import { eventUrl, type SwingEvent } from '@/features/events/model/event';

export { CORRECTIONS_EMAIL };

/**
 * Human-readable date coverage for the card the link sits on. Multi-night
 * one-offs render as one card, so a report against them should name the whole
 * run rather than just the first night.
 */
function datesLine(event: SwingEvent, dates?: string[]): string {
  if (!dates || dates.length <= 1) return event.date;
  return `${dates[0]} to ${dates[dates.length - 1]} (${dates.length} nights: ${dates.join(', ')})`;
}

/**
 * The snapshot block. Only fields that actually have a value are listed —
 * an empty "Price:" line invites a reporter to fill it in as if it were the
 * current claim, when in fact the site says nothing.
 */
export function currentDetails(event: SwingEvent, dates?: string[]): string[] {
  const lines: string[] = [
    `Event: ${event.title}`,
    `Page: ${eventUrl(event)}`,
    `Event ID: ${event.sourceId}`,
    `Date: ${datesLine(event, dates)}`,
    `Time: ${event.start}-${event.end}`,
    `Venue: ${event.venue}${event.address ? `, ${event.address}` : ''}${event.neighborhood ? ` (${event.neighborhood})` : ''}`,
    `Organiser: ${event.organizer}`,
    `Style: ${event.style}`,
  ];

  const music = [event.band && `live: ${event.band}`, event.dj && `DJ: ${event.dj}`]
    .filter(Boolean)
    .join(', ');
  lines.push(`Music: ${event.music}${music ? ` (${music})` : ''}`);

  if (event.price) lines.push(`Price: ${event.price}`);
  if (event.payment) lines.push(`Payment: ${event.payment}`);
  if (event.beginnerClass) lines.push(`Beginner class: ${event.beginnerClass}`);
  if (event.floorType) lines.push(`Floor: ${event.floorType}`);
  if (event.ticket) lines.push(`Tickets / info: ${event.ticket}`);
  if (event.cancelled) lines.push('Listed as: CANCELLED');

  return lines;
}

/** What the reporter typed into the correction dialog. */
export interface CorrectionReport {
  whatsWrong?: string;
  shouldSay?: string;
  howYouKnow?: string;
}

/**
 * The three prompts as they appear **in the email**, which is deliberately
 * English: it goes to a maintainer, and these labels are what make a report
 * skimmable in an inbox. What the reporter reads while filling the form is
 * localized separately — `corrections.prompts` in the locale bundle. Same
 * three, same order; change one and change the other.
 */
export const CORRECTION_PROMPTS = {
  whatsWrong: "What's wrong",
  shouldSay: 'What it should say instead',
  howYouKnow: 'How I know',
} as const;

export function correctionSubject(event: SwingEvent): string {
  return `Wrong info: ${event.title} (${event.sourceId}, ${event.date})`;
}

/**
 * One prompt plus its answer. An unanswered prompt still appears, with a blank
 * line under it — the reporter may have hit send early, or be composing in
 * their mail client rather than the dialog, and the heading tells them (and us)
 * what was being asked.
 */
function answerBlock(prompt: string, answer?: string): string[] {
  return [`${prompt}:`, (answer ?? '').trim(), ''];
}

export function correctionBody(
  event: SwingEvent,
  dates?: string[],
  report?: CorrectionReport
): string {
  return [
    "Something on this listing looks wrong. Here's what I know:",
    '',
    ...answerBlock(CORRECTION_PROMPTS.whatsWrong, report?.whatsWrong),
    ...answerBlock(CORRECTION_PROMPTS.shouldSay, report?.shouldSay),
    ...answerBlock(
      `${CORRECTION_PROMPTS.howYouKnow} (e.g. I was there tonight, I organise it, the venue told me)`,
      report?.howYouKnow
    ),
    '---',
    'What the site currently says. Please leave this bit as it is — it tells us',
    'which listing to fix.',
    '',
    ...currentDetails(event, dates),
    '',
  ].join('\n');
}

/**
 * Build the `mailto:` href for a correction report.
 *
 * Both subject and body are percent-encoded per RFC 6068: the mailto body is a
 * URI component, so raw newlines, `&`, and `#` (all common in event titles and
 * free-typed answers) would otherwise truncate or corrupt the message.
 */
export function buildCorrectionMailto(
  event: SwingEvent,
  dates?: string[],
  report?: CorrectionReport
): string {
  const subject = encodeURIComponent(correctionSubject(event));
  const body = encodeURIComponent(correctionBody(event, dates, report));
  return `mailto:${CORRECTIONS_EMAIL}?subject=${subject}&body=${body}`;
}
