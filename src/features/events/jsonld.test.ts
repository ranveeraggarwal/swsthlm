import { describe, expect, it } from 'vitest';
import { eventToJsonLd } from './jsonld';
import type { SwingEvent } from './model/event';

const baseEvent = (overrides: Partial<SwingEvent> = {}): SwingEvent => ({
  id: 'norrport-2026-10-15',
  title: 'Tommy Löbel Swing Band',
  cancelled: false,
  date: '2026-10-15',
  start: '19:00',
  end: '22:00',
  venue: 'Norrport',
  address: 'Roslagsgatan 38',
  neighborhood: 'Vasastan',
  style: 'all',
  music: 'live',
  organizer: 'Norrport',
  ticket: 'https://example.com',
  body: '',
  sourceType: 'oneoff',
  sourceId: 'norrport-2026-10-15',
  ...overrides,
});

describe('eventToJsonLd price', () => {
  it('does not mark an unknown (empty) price as free', () => {
    const ld = eventToJsonLd(baseEvent({ price: undefined }));
    expect(ld.isAccessibleForFree).toBeUndefined();
    expect(ld.offers).toBeUndefined();
  });

  it('marks an explicitly free price as free', () => {
    const ld = eventToJsonLd(baseEvent({ price: 'Free (no booking needed)' }));
    expect(ld.isAccessibleForFree).toBe(true);
    expect(ld.offers).toMatchObject({ price: 0, priceCurrency: 'SEK' });
  });

  it('emits the first number of a priced event', () => {
    const ld = eventToJsonLd(baseEvent({ price: '100/80 kr' }));
    expect(ld.isAccessibleForFree).toBeUndefined();
    expect(ld.offers).toMatchObject({ price: '100', priceCurrency: 'SEK' });
  });

  it('emits no offer for a non-numeric price that is not free', () => {
    const ld = eventToJsonLd(baseEvent({ price: 'By donation' }));
    expect(ld.isAccessibleForFree).toBeUndefined();
    expect(ld.offers).toBeUndefined();
  });
});
