// Schema.org `DanceEvent` markup (issue #10). Feeds Google's event search and
// the AI crawlers — see docs/SEO.md.
//
// Times are emitted with an explicit Europe/Stockholm offset computed per date,
// so a summer event carries +02:00 and a winter one +01:00 rather than a single
// hardcoded guess.

import { SITE_URL } from '@/lib/site';
import { eventUrl, type SwingEvent } from './model/event';

function stockholmOffset(date: string, time: string): string {
  const dt = new Date(`${date}T${time}:00`);
  const utc = new Date(dt.toLocaleString('en-US', { timeZone: 'UTC' }));
  const sthlm = new Date(dt.toLocaleString('en-US', { timeZone: 'Europe/Stockholm' }));
  const diffMinutes = (sthlm.getTime() - utc.getTime()) / 60000;
  const sign = diffMinutes >= 0 ? '+' : '-';
  const h = String(Math.floor(Math.abs(diffMinutes) / 60)).padStart(2, '0');
  const m = String(Math.abs(diffMinutes) % 60).padStart(2, '0');
  return `${sign}${h}:${m}`;
}

function toISO(date: string, time: string): string {
  return `${date}T${time}:00${stockholmOffset(date, time)}`;
}

function endDateTime(date: string, start: string, end: string): string {
  const overnight = end <= start;
  if (overnight) {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + 1);
    const nextDate = d.toISOString().slice(0, 10);
    return toISO(nextDate, end);
  }
  return toISO(date, end);
}

export function eventToJsonLd(event: SwingEvent): Record<string, unknown> {
  const url = eventUrl(event);

  const jsonLd: Record<string, unknown> = {
    '@type': 'DanceEvent',
    name: event.title,
    startDate: toISO(event.date, event.start),
    endDate: endDateTime(event.date, event.start, event.end),
    eventStatus: event.cancelled
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url,
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.address,
        addressLocality: 'Stockholm',
        addressCountry: 'SE',
      },
    },
  };

  if (event.organizer) {
    jsonLd.organizer = { '@type': 'Organization', name: event.organizer };
  }

  if (event.body) {
    jsonLd.description = event.body.slice(0, 300);
  }

  if (event.price) {
    const numericMatch = event.price.match(/(\d+)/);
    jsonLd.offers = {
      '@type': 'Offer',
      url: event.ticket || url,
      availability: 'https://schema.org/InStock',
      ...(numericMatch
        ? { price: numericMatch[1], priceCurrency: 'SEK' }
        : { price: 0, priceCurrency: 'SEK' }),
    };
  } else {
    jsonLd.isAccessibleForFree = true;
  }

  const performers: Record<string, unknown>[] = [];
  if (event.band) performers.push({ '@type': 'MusicGroup', name: event.band });
  if (event.dj) performers.push({ '@type': 'Person', name: event.dj });
  if (performers.length > 0) {
    jsonLd.performer = performers.length === 1 ? performers[0] : performers;
  }

  return jsonLd;
}

// Site-level entity for the homepage graph. Gives search engines and AI
// crawlers a machine-readable statement of what the site is, alongside the
// individual DanceEvent nodes.
const websiteJsonLd: Record<string, unknown> = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Stockholm Swing',
  alternateName: 'Stockholm Swing Dance Calendar',
  url: SITE_URL,
  description:
    'A free, community-maintained calendar of every swing dance event in Stockholm, Sweden — Lindy Hop, Balboa, Shag, and Blues socials, live-music dances, workshops, and jams.',
  inLanguage: 'en',
};

export function eventsJsonLd(events: SwingEvent[]): string {
  const items = events.map(eventToJsonLd);

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [websiteJsonLd, ...items],
  });
}

export function singleEventJsonLd(event: SwingEvent): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    ...eventToJsonLd(event),
  });
}
