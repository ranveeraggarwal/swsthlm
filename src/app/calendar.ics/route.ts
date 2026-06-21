// The ICS subscription feed (issue #8). Served at `/calendar.ics` and intended
// to be subscribed to via `webcal://stockholmswing.com/calendar.ics`.
//
// Built statically at deploy time (like the rest of the site) from the same
// expanded occurrence list the homepage renders, so the feed and the site never
// disagree. Calendar clients re-poll on their own schedule (REFRESH-INTERVAL),
// and the site rebuilds on every data push, keeping subscribers current.

import { getCalendarEvents } from '@/lib/events';
import { buildCalendar } from '@/lib/ical';

export const dynamic = 'force-static';

const SITE_URL = 'https://stockholmswing.com';

export async function GET() {
  const events = await getCalendarEvents();
  const body = buildCalendar(events, { siteUrl: SITE_URL });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="stockholm-swing.ics"',
      'Cache-Control': 'public, max-age=0, s-maxage=43200, stale-while-revalidate=86400',
    },
  });
}
