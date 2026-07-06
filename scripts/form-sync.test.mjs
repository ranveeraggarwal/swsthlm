import { describe, expect, it } from 'vitest';
import { mapResponse, parseFormDate, parseFormTime } from './form-sync.mjs';

const VENUES = {
  fields: ['id', 'name', 'address', 'neighborhood'],
  rows: [
    { id: 'chicago', name: 'Chicago Swing Dance Studio', address: 'Hornsgatan 75', neighborhood: 'Söder' },
    { id: 'norrport', name: 'Norrport', address: 'Roslagsgatan 38', neighborhood: 'Vasastan' },
  ],
};

// Full-shape response, keyed exactly like the Google Forms response sheet
// header row. Individual tests override just the fields they're exercising.
const response = (o = {}) => ({
  Timestamp: '7/15/2026 14:32:07',
  'Email address': 'organizer@example.com',
  'Event Name': 'Midsummer Swing Ball',
  'Dance Style': 'Lindy Hop',
  'Organizer Name': 'Chicago Swing Dance Studio',
  'Event Page / Ticket URL': 'https://example.com/midsummer',
  'Start Date': '2026-08-15',
  'End Date': '',
  'Doors open / Start time': '19:00',
  'End time': '23:00',
  Venue: 'Chicago Swing Dance Studio',
  'If other - venue name': '',
  'If other - address': '',
  'If other - neighborhood': '',
  Price: '150 kr',
  'Accepted Payment Methods': 'Swish',
  'Beginner Class?': 'Yes',
  'Beginner class start time': '19:00',
  Music: 'DJ',
  'DJ Name': 'Emma Lundqvist',
  'Band Name': '',
  'Your Name': 'Kim Organizer',
  'Event description': 'A midsummer social.',
  'Is this a correction to an existing listing?': 'No',
  'If yes, which event?': '',
  ...o,
});

describe('parseFormDate', () => {
  it('parses ISO dates', () => {
    expect(parseFormDate('2026-08-15')).toBe('2026-08-15');
  });
  it('parses day-first slash dates (ambiguous case)', () => {
    expect(parseFormDate('5/8/2026')).toBe('2026-08-05');
  });
  it('resolves unambiguous slash dates regardless of order', () => {
    expect(parseFormDate('15/8/2026')).toBe('2026-08-15');
    expect(parseFormDate('8/15/2026')).toBe('2026-08-15');
  });
  it('parses named-month dates', () => {
    expect(parseFormDate('August 15, 2026')).toBe('2026-08-15');
    expect(parseFormDate('15 August 2026')).toBe('2026-08-15');
  });
  it('returns null for garbage rather than guessing', () => {
    expect(parseFormDate('sometime in August')).toBeNull();
    expect(parseFormDate('')).toBeNull();
  });
});

describe('parseFormTime', () => {
  it('parses 24h HH:MM', () => {
    expect(parseFormTime('19:00')).toBe('19:00');
  });
  it('parses HH:MM:SS', () => {
    expect(parseFormTime('19:00:00')).toBe('19:00');
  });
  it('parses 12h with am/pm', () => {
    expect(parseFormTime('7:00 PM')).toBe('19:00');
    expect(parseFormTime('7:00 AM')).toBe('07:00');
    expect(parseFormTime('12:00 AM')).toBe('00:00');
  });
  it('returns null for garbage', () => {
    expect(parseFormTime('evening-ish')).toBeNull();
  });
});

describe('mapResponse', () => {
  it('maps a complete, well-formed submission to a draft oneoffs row', () => {
    const { row, issues } = mapResponse(response(), VENUES);
    expect(issues).toEqual([]);
    expect(row).toMatchObject({
      id: 'midsummer-swing-ball-2026-08-15',
      name: 'Midsummer Swing Ball',
      style: 'lindy-hop',
      venue_id: 'chicago',
      date: '2026-08-15',
      start: '19:00',
      end: '23:00',
      music: 'dj',
      dj: 'Emma Lundqvist',
      organizer: 'Chicago Swing Dance Studio',
      url: 'https://example.com/midsummer',
      status: 'draft',
      beginner_class: '19:00',
    });
  });

  it('routes corrections to the correction bucket instead of writing a row', () => {
    const { row, correction, issues } = mapResponse(
      response({ 'Is this a correction to an existing listing?': 'Yes', 'If yes, which event?': 'Wrong price on the Tuesday social' }),
      VENUES,
    );
    expect(row).toBeUndefined();
    expect(issues).toEqual([]);
    expect(correction.reference).toBe('Wrong price on the Tuesday social');
    expect(correction.name).toBe('Midsummer Swing Ball');
  });

  it('flags an unresolved venue instead of inventing one', () => {
    const { row, issues } = mapResponse(response({ Venue: 'Some Random Bar' }), VENUES);
    expect(row).toBeUndefined();
    expect(issues.some((i) => i.includes('Venue'))).toBe(true);
  });

  it('surfaces an "Other" venue as a proposal rather than writing a row', () => {
    const { row, issues, venueProposal } = mapResponse(
      response({ Venue: 'Other', 'If other - venue name': 'New Loft Space', 'If other - address': 'Testgatan 1', 'If other - neighborhood': 'Söder' }),
      VENUES,
    );
    expect(row).toBeUndefined();
    expect(venueProposal).toEqual({ name: 'New Loft Space', address: 'Testgatan 1', neighborhood: 'Söder' });
    expect(issues.some((i) => i.includes('New Loft Space'))).toBe(true);
  });

  it('flags missing required fields instead of writing an incomplete row', () => {
    const { row, issues } = mapResponse(response({ 'Event Page / Ticket URL': '' }), VENUES);
    expect(row).toBeUndefined();
    expect(issues.some((i) => i.includes('Ticket URL'))).toBe(true);
  });

  it('defaults an unrecognized style to "all" and notes it', () => {
    const { row, notes } = mapResponse(response({ 'Dance Style': 'Not sure' }), VENUES);
    expect(row.style).toBe('all');
    expect(notes.some((n) => n.startsWith('style:'))).toBe(true);
  });

  it('infers music from the band/DJ fields when the Music answer is unrecognized', () => {
    const { row, notes } = mapResponse(
      response({ Music: 'Not sure', 'DJ Name': '', 'Band Name': 'Swing Magnifique' }),
      VENUES,
    );
    expect(row.music).toBe('live');
    expect(notes.some((n) => n.startsWith('music:'))).toBe(true);
  });

  it('rejects an unparseable date rather than guessing', () => {
    const { row, issues } = mapResponse(response({ 'Start Date': 'next Saturday' }), VENUES);
    expect(row).toBeUndefined();
    expect(issues.some((i) => i.includes('Start Date'))).toBe(true);
  });
});
