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
  language: {
    label: 'Language',
    code: 'EN',
    names: { en: 'English', sv: 'Swedish' },
    switchTo: 'Switch to {language}',
    changed: 'Language: {language}',
  },
  languagePrompt: {
    question: 'Would you like to read this site in English?',
    accept: 'Switch to English',
    decline: 'No thanks',
    dismiss: 'Close',
  },
  permalink: {
    backToAll: 'All events',
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
    'rock-n-roll': { label: 'Rock\'n\'roll' },
    all: { label: 'Social – all styles', compact: 'All styles', filter: 'All Styles' },
  },
  music: {
    live: 'Live music',
    dj: 'DJ set',
    mixed: 'Live music & DJ set',
  },
  musicBadge: {
    live: 'Live band',
    dj: 'DJ set',
    mixed: 'Live band + DJ',
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
  tasterClass: {
    atTime: 'Taster class {time}',
  },
  home: {
    kicker: 'The swing dance calendar for Stockholm',
    title: { lead: 'Stockholm dances to a ', em: 'different beat.' },
    subtitle:
      'Discover the live music, social dancing and people keeping swing alive in Stockholm — from Lindy Hop and Balboa to Blues and Shag.',
    exploreEvents: 'Explore events',
    discoverMusic: 'Discover the music',
    cover: { lead: 'Stockholm in ', em: 'Full Swing' },
  },
  rains: {
    kanelbulle: 'Happy Cinnamon Bun Day! Throw a bun',
  },
  listing: {
    showingAll: 'Showing all {count} {noun}',
    showingFiltered: 'Showing {description}',
    hideFilters: 'Hide Filters',
    showFilters: 'Filter & Search',
    reset: 'Reset',
    sections: {
      comingUp: { lead: 'On the dance floor ', em: 'soon.' },
      thisWeek: { lead: 'On the dance floor ', em: 'this week.' },
      later: { lead: 'Further ', em: 'ahead.' },
      upcoming: { lead: 'Coming up ', em: 'in Stockholm.' },
    },
    kickers: {
      comingUp: 'The next two weeks',
      thisWeek: 'This week',
      later: 'The calendar',
      upcoming: 'The calendar',
      music: 'The bandstand',
      styles: 'Dance styles',
    },
  },
  musicFeature: {
    heading: { lead: 'The music ', em: 'never stops.' },
    standfirst:
      'Swing was made for dancing to a band in the room. Here’s who’s on the bandstand next.',
    sideA: 'Side A · On the bandstand',
    sideB: 'Side B · Liner notes',
    stats: {
      liveNights: { one: 'night with a live band', other: 'nights with a live band' },
      bands: { one: 'band on the bill', other: 'bands on the bill' },
      djNights: { one: 'DJ night', other: 'DJ nights' },
    },
    statsNote: 'Counted from everything in the calendar right now.',
    showLive: 'Show live-music nights',
    moreNights: { one: '+ {count} more night', other: '+ {count} more nights' },
  },
  danceStyles: {
    heading: { lead: 'Find your ', em: 'rhythm.' },
    standfirst:
      'Four dances, one music. All-styles socials welcome every one of them; some nights belong to a single dance.',
    tempo: 'Tempo',
    entries: {
      'lindy-hop': {
        origin: 'Harlem · late 1920s',
        tempo: 'Medium to fast',
        description:
          'The original swing dance, born in Harlem’s ballrooms: grounded, joyful, and built to swing out and improvise with the band.',
      },
      balboa: {
        origin: 'Southern California · 1930s',
        tempo: 'Fast',
        description:
          'A close-embrace dance made for crowded floors and hot tempos — small, smooth footwork with a lot going on between two people.',
      },
      shag: {
        origin: 'USA · 1930s',
        tempo: 'Fast',
        description:
          'Bouncy, kick-happy and playful: the dance for when the band takes the tempo through the roof.',
      },
      blues: {
        origin: 'Juke joints · early 1900s',
        tempo: 'Slow',
        description:
          'Slow, grounded and close to the music — dancing the groove and the feeling more than the steps.',
      },
    },
    dedicated: { one: '{count} dedicated night listed', other: '{count} dedicated nights listed' },
    none: 'No dedicated nights listed right now — every all-styles social is yours.',
    show: 'Show {style} nights',
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
    admissionStamp: {
      top: 'Live swing',
      bottom: 'Admit one',
    },
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
  theme: {
    switchToLight: 'Switch to light theme',
    switchToDark: 'Switch to dark theme',
  },
  footer: {
    tagline: 'By dancers, for dancers. Made in Stockholm 🇸🇪 with ❤️.',
    subscribe: 'Subscribe to the calendar',
    addEvent: 'Add your event',
    sourceCode: 'Community on GitHub',
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
    missingWhatsWrong: "Tell us what's wrong so we know what to fix.",
    currentlySays: 'What the site currently says',
    noMailApp: 'No mail app? Write to',
    currentlySaysHint: 'Included in the email so we can find the listing.',
    openEmail: 'Open email',
  },
  about: {
    title: { lead: 'About ', em: 'Stockholm Swing' },
    subtitle: 'One place for every social, workshop, and jam in Stockholm.',
    organizers: {
      heading: 'Are you an organizer?',
      intro:
        'If you host a one-time or occasional Lindy Hop, Balboa, Blues, or Shag event in Stockholm, {email} with the details. A maintainer adds it to the schedule. You don\'t need a GitHub account.',
      emailLink: 'send us an email',
      series: 'Running a recurring weekly series? {contact} and we\'ll get it set up.',
      contactLink: 'Contact us directly',
    },
    corrections: {
      heading: 'Spotted something wrong?',
      intro:
        'Prices change, DJs swap, and some weeks a regular series simply doesn\'t run. Every event has a {flagButton} that opens a short correction form — what\'s wrong, what it should say, and how you know. Sending it hands us an email with the listing\'s current details already attached, so we can find the row and fix it.',
      flagButton: 'flag button',
      writeDirectly: 'You can also write to us directly at {email}.',
    },
    mission: {
      heading: 'Our Mission',
      body: 'Stockholm Swing was born out of a desire to unite the local swing dance scene under one clear, lightweight, and easy-to-use platform. Instead of searching through fragmented social media feeds, different studio pages, and email newsletters, we aggregate everything in one central schedule.',
    },
    community: {
      heading: 'Community First',
      body: 'This project is built and maintained by members of the community for the community. We are not affiliated with any single dance studio or organization, meaning we showcase events, socials, tea dances, and workshops from all organizers across Stockholm fairly and transparently.',
      githubLink: 'GitHub Community',
    },
    openSource: {
      heading: 'Built in the Open',
      body: 'The entire site, its data, and the tools that maintain it live in a public GitHub repository. If you\'d like to fix a listing, add a feature, or just see how it works, the code is right there. Contributions are welcome.',
      githubLink: 'View on GitHub',
    },
  },
  changelog: {
    heading: 'What\'s new',
    subheading: 'Major updates to the site, month by month',
    entriesInEnglish: null,
  },
  contributors: {
    heading: 'Contributors',
    subheading: 'The people who\'ve built and maintained this site',
    onGitHub: '{name} on GitHub',
  },
} satisfies LocaleBundle;
