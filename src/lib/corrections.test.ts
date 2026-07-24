import { describe, expect, it } from 'vitest';
import {
  CORRECTIONS_EMAIL,
  buildCorrectionMailto,
  correctionBody,
  correctionSubject,
} from './corrections';
import type { SwingEvent } from '@/types/event';

const baseEvent = (overrides: Partial<SwingEvent> = {}): SwingEvent => ({
  id: 'chicago-friday:2026-07-03',
  title: 'Friday Social',
  status: 'published',
  cancelled: false,
  date: '2026-07-03',
  start: '20:00',
  end: '23:00',
  venue: 'Chicago Swing Dance Studio',
  address: 'Hornsgatan 75',
  neighborhood: 'Söder',
  style: 'lindy',
  music: 'dj',
  organizer: 'Chicago',
  price: '120 kr',
  ticket: 'https://example.com/tickets',
  body: 'Come dance with us.',
  sourceType: 'series',
  sourceId: 'chicago-friday',
  ...overrides,
});

/** Decode a `mailto:` href back into its subject/body for assertions. */
const parseMailto = (href: string) => {
  const url = new URL(href);
  return {
    to: url.pathname,
    subject: url.searchParams.get('subject') ?? '',
    body: url.searchParams.get('body') ?? '',
  };
};

describe('correctionSubject', () => {
  it('names the event and pins the occurrence by id and date', () => {
    expect(correctionSubject(baseEvent())).toBe(
      'Wrong info: Friday Social (chicago-friday, 2026-07-03)'
    );
  });
});

describe('correctionBody', () => {
  it('includes the permalink and the identifying fields', () => {
    const body = correctionBody(baseEvent());
    expect(body).toContain('Page: https://stockholmswing.com/event/chicago-friday/2026-07-03');
    expect(body).toContain('Event ID: chicago-friday');
    expect(body).toContain('Date: 2026-07-03');
    expect(body).toContain('Time: 20:00-23:00');
    expect(body).toContain('Venue: Chicago Swing Dance Studio, Hornsgatan 75 (Söder)');
    expect(body).toContain('Organiser: Chicago');
    expect(body).toContain('Style: lindy');
    expect(body).toContain('Price: 120 kr');
    expect(body).toContain('Tickets / info: https://example.com/tickets');
  });

  it('prompts for the correction and the reporter’s source', () => {
    const body = correctionBody(baseEvent());
    expect(body).toContain("What's wrong:");
    expect(body).toContain('What it should say instead:');
    expect(body).toContain('How I know');
  });

  it('places each dialog answer under its own prompt', () => {
    const body = correctionBody(baseEvent(), undefined, {
      whatsWrong: 'The venue was locked.',
      shouldSay: 'Cancelled this week.',
      howYouKnow: 'I stood outside it.',
    });
    expect(body).toContain("What's wrong:\nThe venue was locked.");
    expect(body).toContain('What it should say instead:\nCancelled this week.');
    expect(body).toContain('):\nI stood outside it.');
  });

  it('keeps the prompt visible when an answer is left blank', () => {
    const body = correctionBody(baseEvent(), undefined, { whatsWrong: 'Wrong DJ.' });
    expect(body).toContain("What's wrong:\nWrong DJ.");
    expect(body).toContain('What it should say instead:\n');
  });

  it('trims surrounding whitespace from answers', () => {
    const body = correctionBody(baseEvent(), undefined, { whatsWrong: '  Wrong price.\n\n' });
    expect(body).toContain("What's wrong:\nWrong price.\n");
  });

  it('keeps the listing snapshot below the answers', () => {
    const body = correctionBody(baseEvent(), undefined, { whatsWrong: 'Wrong price.' });
    expect(body.indexOf('Wrong price.')).toBeLessThan(body.indexOf('Event ID: chicago-friday'));
  });

  it('omits fields the listing does not claim', () => {
    const body = correctionBody(
      baseEvent({ price: undefined, payment: undefined, ticket: undefined, beginnerClass: undefined })
    );
    expect(body).not.toContain('Price:');
    expect(body).not.toContain('Payment:');
    expect(body).not.toContain('Beginner class:');
    expect(body).not.toContain('Tickets / info:');
  });

  it('names the band and DJ alongside the music type', () => {
    const body = correctionBody(baseEvent({ music: 'mixed', band: 'The Hot Five', dj: 'DJ Bea' }));
    expect(body).toContain('Music: mixed (live: The Hot Five, DJ: DJ Bea)');
  });

  it('flags a cancelled listing', () => {
    expect(correctionBody(baseEvent({ cancelled: true }))).toContain('Listed as: CANCELLED');
    expect(correctionBody(baseEvent())).not.toContain('Listed as: CANCELLED');
  });

  it('reports the whole run for a multi-night card', () => {
    const body = correctionBody(baseEvent(), ['2026-07-03', '2026-07-04', '2026-07-05']);
    expect(body).toContain(
      'Date: 2026-07-03 to 2026-07-05 (3 nights: 2026-07-03, 2026-07-04, 2026-07-05)'
    );
  });

  it('reports a single date plainly when the card covers one night', () => {
    expect(correctionBody(baseEvent(), ['2026-07-03'])).toContain('Date: 2026-07-03');
  });
});

describe('buildCorrectionMailto', () => {
  it('addresses the corrections inbox', () => {
    expect(parseMailto(buildCorrectionMailto(baseEvent())).to).toBe(CORRECTIONS_EMAIL);
    expect(CORRECTIONS_EMAIL).toBe('corrections@stockholmswing.com');
  });

  it('round-trips subject and body through the URL', () => {
    const event = baseEvent();
    const parsed = parseMailto(buildCorrectionMailto(event));
    expect(parsed.subject).toBe(correctionSubject(event));
    expect(parsed.body).toBe(correctionBody(event));
  });

  // Ampersands and hashes in a title would otherwise terminate the query
  // string or start a fragment, silently truncating the report.
  it('survives titles with URL-significant characters', () => {
    const event = baseEvent({ title: 'Swing & Blues #3 — 50% off?' });
    const parsed = parseMailto(buildCorrectionMailto(event));
    expect(parsed.subject).toContain('Swing & Blues #3 — 50% off?');
    expect(parsed.body).toContain('Event: Swing & Blues #3 — 50% off?');
  });

  // The dialog's textareas accept anything the reporter types, newlines and
  // all — the same encoding hazard, from a field we don't control.
  it('survives answers with newlines and URL-significant characters', () => {
    const parsed = parseMailto(
      buildCorrectionMailto(baseEvent(), undefined, {
        whatsWrong: 'Price & door\nboth wrong #urgent',
        shouldSay: '150 kr, not 120 kr',
      })
    );
    expect(parsed.body).toContain('Price & door\nboth wrong #urgent');
    expect(parsed.body).toContain('150 kr, not 120 kr');
  });

  it('encodes newlines so the template arrives as separate lines', () => {
    const href = buildCorrectionMailto(baseEvent());
    expect(href).toContain('%0A');
    expect(parseMailto(href).body.split('\n').length).toBeGreaterThan(10);
  });

  // Several mail clients (notably older Outlook builds) drop everything past
  // ~2000 characters of a mailto URL.
  it('stays inside the mailto length most clients tolerate', () => {
    const href = buildCorrectionMailto(
      baseEvent({
        band: 'The Really Quite Long Named Orchestra',
        dj: 'DJ Someone With A Long Name',
        payment: 'Swish, card or cash at the door',
        beginnerClass: '19:00',
        floorType: 'studio',
      }),
      ['2026-07-03', '2026-07-04', '2026-07-05']
    );
    expect(href.length).toBeLessThan(2000);
  });
});
