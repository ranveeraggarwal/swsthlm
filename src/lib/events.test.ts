import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getEvents } from './events';
import * as fs from 'node:fs';

vi.mock('node:fs');
vi.mock('@/lib/datetime', () => ({
  getStockholmCurrentDate: () => '2026-06-01',
}));

describe('getEvents', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('filters out TBA values for band and dj', async () => {
    const mockVenues = 'id,name,address,neighborhood\nchicago,Chicago,Hornsgatan 75,Södermalm';
    const mockSeries = 'id,name,style,venue_id,weekday,start,end,price,payment,beginner_class,music,dj,band,organizer,url,description,status,valid_from,valid_to\n' +
      'series-1,Series 1,lindy-hop,chicago,wednesday,19:00,23:00,,,19:00,live,TBA,t.b.a,Organizer,https://example.com,Desc,live,2026-06-01,2026-06-30';
    const mockExceptions = 'series_id,date,cancelled,start,end,dj,band,music,price,note,description';
    const mockOneoffs = 'id,name,style,venue_id,date,end_date,start,end,price,payment,beginner_class,music,dj,band,organizer,url,description,status\n' +
      'oneoff-1,Oneoff 1,lindy-hop,chicago,2026-06-05,,19:00,22:00,,,19:00,live,  TBA  ,T.B.A,Organizer,https://example.com,Desc,live';

    vi.mocked(fs.readFileSync).mockImplementation((path: string | number | URL | Buffer) => {
      const p = path.toString();
      if (p.endsWith('venues.csv')) return mockVenues;
      if (p.endsWith('series.csv')) return mockSeries;
      if (p.endsWith('exceptions.csv')) return mockExceptions;
      if (p.endsWith('oneoffs.csv')) return mockOneoffs;
      return '';
    });

    const events = await getEvents();

    const seriesEvent = events.find(e => e.id.startsWith('series-1'));
    expect(seriesEvent?.dj).toBeUndefined();
    expect(seriesEvent?.band).toBeUndefined();

    const oneoffEvent = events.find(e => e.id.startsWith('oneoff-1'));
    expect(oneoffEvent?.dj).toBeUndefined();
    expect(oneoffEvent?.band).toBeUndefined();
  });

  it('keeps real band and dj names', async () => {
    const mockVenues = 'id,name,address,neighborhood\nchicago,Chicago,Hornsgatan 75,Södermalm';
    const mockSeries = 'id,name,style,venue_id,weekday,start,end,price,payment,beginner_class,music,dj,band,organizer,url,description,status,valid_from,valid_to\n' +
      'series-1,Series 1,lindy-hop,chicago,wednesday,19:00,23:00,,,19:00,live,DJ Name,Band Name,Organizer,https://example.com,Desc,live,2026-06-01,2026-06-30';
    const mockExceptions = 'series_id,date,cancelled,start,end,dj,band,music,price,note,description';
    const mockOneoffs = '';

    vi.mocked(fs.readFileSync).mockImplementation((path: string | number | URL | Buffer) => {
      const p = path.toString();
      if (p.endsWith('venues.csv')) return mockVenues;
      if (p.endsWith('series.csv')) return mockSeries;
      if (p.endsWith('exceptions.csv')) return mockExceptions;
      if (p.endsWith('oneoffs.csv')) return mockOneoffs;
      return '';
    });

    const events = await getEvents();
    const event = events.find(e => e.id.startsWith('series-1'));
    expect(event?.dj).toBe('DJ Name');
    expect(event?.band).toBe('Band Name');
  });

  it('propagates cancelled=true from a series exception and still includes the occurrence', async () => {
    const mockVenues = 'id,name,address,neighborhood\nchicago,Chicago,Hornsgatan 75,Södermalm';
    // A single-week series on Wednesday 2026-06-03
    const mockSeries = 'id,name,style,venue_id,weekday,start,end,price,payment,beginner_class,music,dj,band,organizer,url,description,status,valid_from,valid_to\n' +
      'series-cancel,Cancel Series,lindy-hop,chicago,wednesday,19:00,23:00,,,, dj,,,Organizer,https://example.com,,live,2026-06-03,2026-06-03';
    // Exception cancels the sole occurrence
    const mockExceptions = 'series_id,date,cancelled,start,end,dj,band,music,price,note,description\n' +
      'series-cancel,2026-06-03,yes,,,,,,,Venue closed,';
    const mockOneoffs = '';

    vi.mocked(fs.readFileSync).mockImplementation((path: string | number | URL | Buffer) => {
      const p = path.toString();
      if (p.endsWith('venues.csv')) return mockVenues;
      if (p.endsWith('series.csv')) return mockSeries;
      if (p.endsWith('exceptions.csv')) return mockExceptions;
      if (p.endsWith('oneoffs.csv')) return mockOneoffs;
      return '';
    });

    const events = await getEvents();
    // The cancelled occurrence must still be present (not hidden)
    const event = events.find(e => e.id.startsWith('series-cancel'));
    expect(event).toBeDefined();
    expect(event?.cancelled).toBe(true);
  });

  it('propagates cancelled=true from a oneoff with status=cancelled and still includes it', async () => {
    const mockVenues = 'id,name,address,neighborhood\nchicago,Chicago,Hornsgatan 75,Södermalm';
    const mockSeries = 'id,name,style,venue_id,weekday,start,end,price,payment,beginner_class,music,dj,band,organizer,url,description,status,valid_from,valid_to';
    const mockExceptions = 'series_id,date,cancelled,start,end,dj,band,music,price,note,description';
    const mockOneoffs = 'id,name,style,venue_id,date,end_date,start,end,price,payment,beginner_class,music,dj,band,organizer,url,description,status\n' +
      'cancelled-oneoff,Cancelled Oneoff,lindy-hop,chicago,2026-06-10,,19:00,22:00,,,,dj,,,Organizer,https://example.com,,cancelled';

    vi.mocked(fs.readFileSync).mockImplementation((path: string | number | URL | Buffer) => {
      const p = path.toString();
      if (p.endsWith('venues.csv')) return mockVenues;
      if (p.endsWith('series.csv')) return mockSeries;
      if (p.endsWith('exceptions.csv')) return mockExceptions;
      if (p.endsWith('oneoffs.csv')) return mockOneoffs;
      return '';
    });

    const events = await getEvents();
    // Cancelled oneoff must still appear in the list
    const event = events.find(e => e.id.startsWith('cancelled-oneoff'));
    expect(event).toBeDefined();
    expect(event?.cancelled).toBe(true);
  });
});
