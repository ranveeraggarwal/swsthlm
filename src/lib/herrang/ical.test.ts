import { describe, it, expect } from 'vitest';
import type { WeekSchedule } from './types';
import { buildTrackCalendar } from './ical';

const venues = [{ id: 'sp', name: "Small's Paradise", area: 'School Area' }];

const week: WeekSchedule = {
  week: 2,
  year: 2026,
  start: '2026-07-11',
  end: '2026-07-17',
  tracks: [
    { id: 'interm-g1', name: 'Intermediate — Group 1', level: 'Intermediate', group: 1 },
    { id: 'balboa', name: 'Balboa', level: 'Balboa' },
  ],
  classes: [
    { track: 'interm-g1', date: '2026-07-13', start: '09:00', end: '10:10', venue: 'sp', labels: ['Audition'] },
    { track: 'balboa', date: '2026-07-13', start: '09:00', end: '10:10', venue: 'sp' },
  ],
  specials: [
    { title: 'Barbara Billups & Sugar Sullivan', date: '2026-07-15', start: '14:00', end: '15:30', venues: ['sp'] },
  ],
};

describe('buildTrackCalendar', () => {
  const now = new Date(Date.UTC(2026, 6, 11, 12, 0, 0));
  const ics = buildTrackCalendar(week, week.tracks[0], venues, { now });

  it('contains only the track’s classes, tagged Europe/Stockholm', () => {
    expect(ics).toContain('X-WR-CALNAME:A Day in Herräng — Intermediate — Group 1');
    expect(ics).toContain('DTSTART;TZID=Europe/Stockholm:20260713T090000');
    expect(ics).toContain('SUMMARY:Intermediate — Group 1 [Audition]');
    expect(ics).not.toContain('SUMMARY:Balboa');
    expect(ics).toContain('BEGIN:VTIMEZONE');
  });

  it('includes the whole-camp specials in every feed', () => {
    expect(ics).toContain('SUMMARY:Barbara Billups & Sugar Sullivan');
    expect(ics).toContain('DTSTART;TZID=Europe/Stockholm:20260715T140000');
  });

  it('uses CRLF line endings', () => {
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(ics.split('\r\n').length).toBeGreaterThan(10);
  });
});
