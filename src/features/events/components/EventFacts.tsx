// The icon-and-text fact list: where it is, who's playing, what it costs.
//
// One consistent list rather than a mix of prose and badges, and one component
// rather than the byte-identical copies the card and the permalink page each
// carried. The row list shows the same facts in its own denser arrangement and
// composes the pieces below directly.

import React from 'react';
import { Banknote, Disc, MapPin, Music } from 'lucide-react';
import type { SwingEvent } from '../model/event';
import { venueMapsUrl } from '../model/event';
import { musicLines, type MusicLine } from '../model/labels';

const ROW = 'flex items-center gap-2 leading-none';
const MUTED = 'text-[var(--on-surface-variant)]';

/** Joins class names without leaving a trailing space when one is absent. */
const joinClasses = (...parts: (string | undefined | false)[]) => parts.filter(Boolean).join(' ');

/** Venue, linked to a maps search, with the neighborhood appended. */
export function VenueFact({ event, struckThrough }: { event: SwingEvent; struckThrough?: boolean }) {
  return (
    <div className={ROW}>
      <MapPin className={`w-3.5 h-3.5 shrink-0 ${MUTED}`} aria-hidden="true" />
      <span>
        <a
          href={venueMapsUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className={joinClasses(
            'font-bold text-[var(--on-surface)] underline decoration-[var(--outline)] underline-offset-4 hover:text-[var(--primary)] transition-colors',
            struckThrough && 'line-through',
          )}
        >
          {event.venue}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        {event.neighborhood && <span className={MUTED}> · {event.neighborhood}</span>}
      </span>
    </div>
  );
}

/** One performer line. The screen-reader prefix carries the meaning the icon has. */
export function MusicFact({ line }: { line: MusicLine }) {
  const Icon = line.type === 'live' ? Music : Disc;
  return (
    <div className={`${ROW} ${MUTED}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>
        <span className="sr-only">{line.type === 'live' ? 'Live: ' : 'DJ: '}</span>
        {line.name ?? (line.type === 'live' ? 'Live music' : 'DJ set')}
      </span>
    </div>
  );
}

/** Price and payment method on one line, separated only when both are present. */
export function PriceFact({ event }: { event: SwingEvent }) {
  if (!event.price && !event.payment) return null;
  return (
    <div className={`${ROW} ${MUTED}`}>
      <Banknote className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>
        {event.price}
        {event.price && event.payment && ' · '}
        {event.payment}
      </span>
    </div>
  );
}

/**
 * The full list, as the card and the permalink page render it.
 *
 * `className` carries the surrounding spacing so callers can keep their own
 * margins without wrapping this in another div.
 */
export function EventFacts({
  event,
  struckThrough,
  className,
}: {
  event: SwingEvent;
  struckThrough?: boolean;
  className?: string;
}) {
  return (
    <div className={joinClasses('space-y-3 font-sans text-sm', className)}>
      <VenueFact event={event} struckThrough={struckThrough} />
      {musicLines(event).map((line) => (
        <MusicFact key={line.type} line={line} />
      ))}
      <PriceFact event={event} />
    </div>
  );
}
