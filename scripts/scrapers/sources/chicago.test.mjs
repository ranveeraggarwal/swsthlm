import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, relevance } from './chicago.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(here, '../fixtures/chicago.html'), 'utf-8');
const events = parse(html);

describe('chicago parser', () => {
  it('parses the event page into one candidate', () => {
    expect(events).toHaveLength(1);
  });

  it('extracts the core fields from Chicago Elevdans', () => {
    expect(events[0]).toMatchObject({
      id: 'chicago-2026-06-13',
      name: 'Chicago Elevdans',
      venueId: 'chicago',
      date: '2026-06-13',
      start: '20:00',
      end: '23:00',
      style: 'all',
      music: 'live',
      organizer: 'Chicago Swing Dance Studio',
      status: 'live',
    });
  });

  it('sets the event URL from the Webflow item slug', () => {
    expect(events[0].url).toBe(
      'https://www.chicago75.se/evenemang/chicago-elevdans-3',
    );
  });

  it('declares all relevance (swing-dedicated venue)', () => {
    expect(relevance).toBe('all');
  });

  it('detects DJ nights from the title', () => {
    const djHtml = html.replaceAll('Chicago Elevdans', 'Chicago Swing Wednesdays - DJs The Hot Shots');
    const djEvents = parse(djHtml);
    expect(djEvents[0]?.music).toBe('dj');
  });

  it('returns [] when there is no parseable time', () => {
    const noTime = html.replace(
      /Mellan \d{2}:\d{2} [–-] \d{2}:\d{2}[^""]*/,
      'Ambitionen är hög',
    );
    expect(parse(noTime)).toHaveLength(0);
  });
});
