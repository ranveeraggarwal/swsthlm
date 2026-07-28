// English chrome copy. `satisfies LocaleBundle` rather than `: LocaleBundle`
// so the exported value keeps its literal (not widened) type, while the
// compiler still checks every key against the contract.

import type { LocaleBundle } from './bundle';

export const en = {
  nav: {
    calendar: 'Calendar',
    about: 'About',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  a11y: {
    skipToContent: 'Skip to content',
  },
  freshness: {
    updated: 'Schedule updated {time}',
  },
  dates: {
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekdaysLong: [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ],
    monthsShort: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],
    monthsLong: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    compactWeekdayDate: '{weekdayShort} {day} {monthShort}',
    eventDate: '{weekdayLong}, {monthShort} {day}',
    eventDateShort: '{weekdayShort} {day} {monthShort}',
    monthHeading: '{monthLong} {year}',
    rangeDay: '{weekdayShort} {day}',
    rangeSeparator: '&',
  },
  relativeTime: {
    justNow: 'just now',
    pattern: '{count} {unit} ago',
    units: {
      minute: { one: 'minute', other: 'minutes' },
      hour: { one: 'hour', other: 'hours' },
      day: { one: 'day', other: 'days' },
      week: { one: 'week', other: 'weeks' },
    },
  },
  styles: {
    'lindy-hop': { label: 'Lindy Hop' },
    balboa: { label: 'Balboa' },
    blues: { label: 'Blues' },
    shag: { label: 'Shag' },
    all: { label: 'Social – all styles', compact: 'All styles', filter: 'All Styles' },
  },
  music: {
    live: 'Live music',
    dj: 'DJ set',
    mixed: 'Live music & DJ set',
  },
  floors: {
    studio: 'Dance studio',
    hall: 'Dance hall',
    bar: 'Bar / restaurant',
    outdoor: 'Outdoor',
  },
  temporal: {
    'happening-now': 'Happening Now',
    ended: 'Ended',
    tonight: 'Tonight',
    tomorrow: 'Tomorrow',
    'this-week': 'This Week',
  },
  beginnerClass: {
    friendly: 'Beginner friendly',
    atTime: 'Beginner class {time}',
  },
  home: {
    title: { lead: 'Stockholm in ', em: 'Full Swing' },
    subtitle: 'Your guide to Lindy Hop, Balboa, Shag, and Blues social dancing in Stockholm.',
  },
  listing: {
    showingAll: 'Showing all {count} {noun}',
    showingFiltered: 'Showing {description}',
    hideFilters: 'Hide Filters',
    showFilters: 'Filter & Search',
    reset: 'Reset',
    sections: {
      comingUp: { lead: '', em: 'Coming Up' },
      thisWeek: { lead: 'Happening ', em: 'This Week' },
      later: { lead: '', em: 'Later' },
      upcoming: { lead: 'Upcoming ', em: 'Events' },
    },
  },
  filters: {
    title: { lead: 'Filters ', em: '& Search' },
    searchLabel: 'Search events',
    searchPlaceholder: 'Search by band, DJ, venue, title...',
    clearSearch: 'Clear search',
    byStyle: 'Filter by Style',
    music: 'Music',
    liveMusicOnly: 'Live Music Only',
    byVenue: 'Filter by Venue',
    allVenues: 'All Venues',
    eventNoun: { one: 'event', other: 'events' },
    liveMusicQualifier: 'Live Music',
    atVenue: '{description} at {venue}',
    matchingSearch: '{description} matching "{search}"',
    emptyState: {
      styleAndVenue: 'No {style} events at {venue} right now',
      style: 'No {style} events right now',
      venue: 'No events at {venue} right now',
      none: 'No events match your filters',
    },
  },
  card: {
    readMore: 'Read more',
    showLess: 'Show less',
    cancelled: 'Cancelled',
    nights: { one: 'night', other: 'nights' },
    source: 'Source',
    sourceHint: ' — tickets and event info (opens in a new tab)',
    opensInNewTab: ' (opens in a new tab)',
    livePrefix: 'Live: ',
    djPrefix: 'DJ: ',
  },
  actions: {
    addToCalendar: 'Add to calendar',
    addToCalendarTitle: 'Add to Calendar',
    addIntro: 'Add {title} on {date} to your calendar.',
    downloadIcs: 'Download .ics file',
    share: 'Share event',
    linkCopied: 'Link copied!',
    subscribe: 'Subscribe',
    subscribeTitle: 'Subscribe to Calendar',
    subscribeBlurb: 'Add the event feed to your calendar app, kept up to date automatically.',
    feedUrlLabel: 'Calendar feed URL',
    copy: 'Copy',
    copied: 'Copied',
    copyFeedLink: 'Copy feed link',
  },
  empty: {
    body: 'Try adjusting your search terms or filters to find dance events.',
    clearAll: 'Clear all filters',
    subscribeCta: 'Subscribe to get notified',
    organizersCta: 'Organizers: add your event',
  },
  footer: {
    tagline: 'By dancers, for dancers. Made in Stockholm 🇸🇪 with ❤️.',
    github: 'GitHub Community (opens in a new tab)',
  },
  install: {
    title: 'Add to Home Screen',
    body: 'Quick access to Stockholm swing events',
    action: 'Install',
    dismiss: 'Dismiss',
  },
  modal: {
    close: 'Close',
  },
  corrections: {
    trigger: 'Report wrong info',
    triggerFor: 'Report wrong info about {title}',
    title: 'Send a correction',
    intro:
      "Tell us what's wrong with {title} and we'll fix the listing. This opens an email — nothing is sent until you send it.",
    prompts: {
      whatsWrong: "What's wrong",
      shouldSay: 'What it should say instead',
      howYouKnow: 'How I know',
    },
    placeholders: {
      whatsWrong: 'The venue was closed, the DJ has changed…',
      shouldSay: 'Doors at 19:30, 120 kr…',
      howYouKnow: 'I was there tonight / I organise it',
    },
    currentlySays: 'What the site currently says',
    noMailApp: 'No mail app? Write to',
    currentlySaysHint: 'Included in the email so we can find the listing.',
    openEmail: 'Open email',
  },
} satisfies LocaleBundle;
