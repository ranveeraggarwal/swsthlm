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

  it('extracts DJ name from "DJs [Name]" title', () => {
    const djHtml = html.replaceAll('Chicago Elevdans', 'Chicago Swing Wednesdays - DJs The Hot Shots');
    const djEvents = parse(djHtml);
    expect(djEvents[0]?.dj).toBe('The Hot Shots');
  });

  it('detects DJ night without a named DJ ("DJ-kväll")', () => {
    const djHtml = html.replaceAll('Chicago Elevdans', 'Onsdag DJ-kväll');
    const djEvents = parse(djHtml);
    expect(djEvents[0]?.music).toBe('dj');
    expect(djEvents[0]?.dj).toBeFalsy();
  });

  it('extracts the band from a "Chicago Live Wednesdays - [Band]" title', () => {
    const liveHtml = html.replaceAll('Chicago Elevdans', "Chicago Live Wednesdays - Hällgren's Lucky Quartet");
    const liveEvents = parse(liveHtml);
    expect(liveEvents[0]?.music).toBe('live');
    expect(liveEvents[0]?.band).toBe("Hällgren's Lucky Quartet");
  });

  it('leaves band unset for titles without the "Chicago Live Wednesdays -" pattern', () => {
    expect(events[0]?.band).toBeFalsy();
  });

  it('sets the beginner drop-in class for Chicago Live Wednesdays, at doors time', () => {
    const liveHtml = html.replaceAll('Chicago Elevdans', "Chicago Live Wednesdays - Hällgren's Lucky Quartet");
    const liveEvents = parse(liveHtml);
    expect(liveEvents[0]?.beginnerClass).toBe(liveEvents[0]?.start);
  });

  it('leaves beginnerClass unset for nights that are not Chicago Live Wednesdays', () => {
    expect(events[0]?.beginnerClass).toBeFalsy();
  });

  it('returns [] when there is no parseable time', () => {
    const noTime = html.replace(
      /Mellan \d{2}:\d{2} [–-] \d{2}:\d{2}[^""]*/,
      'Ambitionen är hög',
    );
    expect(parse(noTime)).toHaveLength(0);
  });
});
