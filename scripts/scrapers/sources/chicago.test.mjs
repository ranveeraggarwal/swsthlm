import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, relevance, mergeSameNight } from './chicago.mjs';

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

  it('extracts the price from the facts panel', () => {
    expect(events[0].price).toBe('200 kr (150 kr för rabatterade)');
  });

  it('leaves price empty when the page has no Pris row', () => {
    const noPrice = html.replace('>Pris<', '>Plats<');
    expect(parse(noPrice)[0]?.price).toBe('');
  });

  it('extracts the description from the rich-text body', () => {
    expect(events[0].description).toMatch(/^I slutet av varje kursomgång/);
    expect(events[0].description).toMatch(/Varmt välkomna alla!$/);
  });

  it('drops the repeated title line and the studio sign-off', () => {
    expect(events[0].description).not.toMatch(/chicago elevdans/i);
    expect(events[0].description).not.toMatch(/swing dance studio/i);
  });

  it('keeps paragraph and line breaks as literal \\n escapes, never real newlines', () => {
    expect(events[0].description).toMatch(/socialdansgolvet ännu\.\\n\\nVarmt välkomna alla!$/);
    expect(events[0].description).not.toMatch(/[\r\n]/);

    const withBr = html.replace('Varmt välkomna alla!<br/>', 'Varmt välkomna alla!<br/>Ta med vänner!<br/>');
    expect(parse(withBr)[0].description).toMatch(/Varmt välkomna alla!\\nTa med vänner!$/);
  });

  it('keeps dates out of the description (DATA.md hygiene)', () => {
    expect(events[0].description).not.toMatch(/\d{1,2}\/\d{1,2}/);
  });

  it('strips Webflow invisible filler from the description', () => {
    expect(events[0].description).not.toMatch(/[\u200b\u200c\u200d\u2060\ufeff\u00a0]/);
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

describe('mergeSameNight', () => {
  // The two pages Chicago published for 2026-10-04: a musicality taster that
  // runs straight into the jam. Both map to id chicago-2026-10-04.
  const base = { style: 'all', venueId: 'chicago', date: '2026-10-04', music: 'live', organizer: 'Chicago Swing Dance Studio', status: 'live' };
  const jam = {
    ...base,
    id: 'chicago-2026-10-04',
    name: 'Chicago "Swing" Jam Session #22',
    start: '19:00',
    end: '22:00',
    price: 'fri entré - men swisha dricks till husbandet!',
    url: 'https://www.chicago75.se/evenemang/chicago-swing-jam-session-22',
    description: 'A jam session at Chicago!',
  };
  const taster = {
    ...base,
    id: 'chicago-2026-10-04',
    name: 'Lindy Hop Musicality Class with Live Music',
    start: '18:00',
    end: '19:00',
    price: '200kr (140 kr för rabatterade)',
    url: 'https://www.chicago75.se/evenemang/lindy-hop-musicality-class-with-live-music',
    description: 'Explore how musicians think when they play.',
  };

  it('folds the taster into the jam instead of letting one replace the other', () => {
    for (const order of [[jam, taster], [taster, jam]]) {
      const merged = mergeSameNight(order);
      expect(merged).toHaveLength(1);
      expect(merged[0]).toMatchObject({
        id: 'chicago-2026-10-04',
        name: jam.name,
        url: jam.url,
        start: '18:00',
        end: '22:00',
        tasterClass: '18:00',
      });
    }
  });

  it('keeps both prices, the main event first', () => {
    expect(mergeSameNight([jam, taster])[0].price).toBe(
      'fri entré - men swisha dricks till husbandet!; taster class: 200kr (140 kr för rabatterade)',
    );
  });

  it('appends the taster blurb under its own title after the main description', () => {
    expect(mergeSameNight([taster, jam])[0].description).toBe(
      'A jam session at Chicago!\\n\\nLindy Hop Musicality Class with Live Music\\nExplore how musicians think when they play.',
    );
  });

  it('leaves events on different nights alone', () => {
    const other = { ...taster, id: 'chicago-2026-10-05', date: '2026-10-05' };
    expect(mergeSameNight([jam, other])).toEqual([jam, other]);
  });

  it('does not treat a class hours before the main event as its taster', () => {
    const course = { ...taster, name: 'Balboa kurs', start: '17:15', end: '18:15' };
    const zinken = { ...jam, name: "Zinken's Rhythm Club", start: '20:30', end: '22:30' };
    expect(mergeSameNight([course, zinken])).toHaveLength(2);
  });
});
