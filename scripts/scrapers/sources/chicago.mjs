import * as cheerio from 'cheerio';
import { titleCase } from '../lib/candidate.mjs';

export const id = 'chicago';
export const label = 'Chicago Swing Dance Studio';
export const url = 'https://www.chicago75.se/evenemang';
export const relevance = 'all';

const VENUE_ID = 'chicago';
const ORGANIZER = 'Chicago Swing Dance Studio';

/**
 * Parse the Chicago HTML into CandidateEvent[].
 */
export function parse(html) {
  const $ = cheerio.load(html);
  const events = [];

  // Year from "Last Published" comment or current year.
  // Use non-greedy match to avoid swallowing the whole page if it's one line.
  const publishedMatch = html.match(/Last Published:.*?\b(\d{4})\b/);
  const publishedYear = publishedMatch ? publishedMatch[1] : new Date().getFullYear().toString();

  // "som börjar kl 20:00" -> "20:00"
  const globalWednesdayTimeMatch = html.match(/som börjar kl (\d{1,2})[:.](\d{2})/);
  const globalWednesdayTime = globalWednesdayTimeMatch
    ? `${globalWednesdayTimeMatch[1].padStart(2, '0')}:${globalWednesdayTimeMatch[2]}`
    : null;

  // The current fixture doesn't have an explicit end time for socials,
  // but series.csv says 23:00 for the Wednesday regular slots.
  const globalEndTime = '23:00';

  $('.blog66_item-copy').each((_, el) => {
    const $el = $(el);

    // Extract date, e.g., "Onsdag 17/6"
    const dateText = $el.find('.text-size-small').text().trim();
    const dateMatch = dateText.match(/(\d{1,2})\/(\d{1,2})/);
    if (!dateMatch) return;

    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const date = `${publishedYear}-${month}-${day}`;

    const title = $el.find('h3').text().trim();
    if (!title) return;

    // Time from card text
    let start = '';
    let end = '';
    const timeMatch = $el.text().match(/\b(\d{1,2})[:.](\d{2})\b/);
    if (timeMatch) {
      start = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    } else if (dateText.toLowerCase().includes('onsdag') && globalWednesdayTime) {
      start = globalWednesdayTime;
    }

    if (!start) return;

    // Determine end time
    if (dateText.toLowerCase().includes('onsdag')) {
      end = globalEndTime;
    }

    let music = '';
    if (title.toLowerCase().includes('live')) music = 'live';
    else if (title.toLowerCase().includes('dj')) music = 'dj';

    events.push({
      id: `${VENUE_ID}-${date}`,
      name: titleCase(title),
      style: 'all',
      venueId: VENUE_ID,
      date,
      start,
      end,
      music,
      organizer: ORGANIZER,
      url,
      status: 'live',
    });
  });

  return events;
}

export async function scrape() {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
  return parse(await res.text());
}
