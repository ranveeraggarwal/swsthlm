// Site-wide constants. These were previously copy-pasted into a dozen files
// (`const SITE_URL = 'https://stockholmswing.com'` appeared six times), which
// meant a domain change was a grep-and-pray exercise. One definition each.

/** Canonical production origin. Never derive this from `window` — permalinks,
 *  ICS UIDs and calendar subscriptions must point at the stable host even when
 *  the page is served from a Vercel preview deploy. */
export const SITE_URL = 'https://stockholmswing.com';

/** Bare host, for the `webcal://` scheme which has no https:// prefix. */
export const SITE_HOST = 'stockholmswing.com';

export const CALENDAR_FEED_PATH = '/calendar.ics';
export const CALENDAR_FEED_URL = `${SITE_URL}${CALENDAR_FEED_PATH}`;
/** `webcal://` hands off to the OS calendar app and subscribes rather than
 *  importing a one-time snapshot. */
export const CALENDAR_WEBCAL_URL = `webcal://${SITE_HOST}${CALENDAR_FEED_PATH}`;
export const CALENDAR_NAME = 'Stockholm Swing Dance Calendar';

/** Organizer-facing intake. An Action drains its responses into pull requests
 *  (see docs/architecture/FORM_SYNC.md). */
export const EVENT_SUBMISSION_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSd87pOy31N_3xKthqalT-sDrFB2yoe74Z8HGr8q1HSs6Pis2g/viewform';

export const GITHUB_REPO_URL = 'https://github.com/ranveeraggarwal/swsthlm';
export const GITHUB_DISCUSSIONS_URL = `${GITHUB_REPO_URL}/discussions`;

export const CONTACT_EMAIL = 'hello@stockholmswing.com';
export const CORRECTIONS_EMAIL = 'corrections@stockholmswing.com';
