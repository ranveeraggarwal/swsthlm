export interface SwingEvent {
  id: string;
  title: string;
  status: 'published' | 'draft';
  cancelled: boolean; // true when a series exception or oneoff status is cancelled
  date: string;       // YYYY-MM-DD
  start: string;      // HH:MM
  end: string;        // HH:MM
  venue: string;      // e.g., "Chicago Swing Dance Studio"
  address: string;    // e.g., "Hornsgatan 75"
  neighborhood?: string; // e.g., "Söder"
  style: string;      // e.g., "lindy", "balboa", "blues", "all"
  music: 'live' | 'dj' | 'mixed';
  organizer: string;
  band?: string;
  dj?: string;
  price?: string;
  payment?: string;
  ticket?: string;    // URL string
  body: string;       // Markdown or plain text description
  beginnerClass?: string;
  // Source provenance — used for multi-day one-off card merging.
  sourceType: 'series' | 'oneoff';
  sourceId: string;   // The series/oneoff id (without the date suffix)
}

/**
 * A presentation-layer card that may represent one or more consecutive nights
 * from the same one-off event. Single-occurrence cards (nightCount === 1) are
 * rendered identically to a plain SwingEvent; multi-night cards show a date
 * range header and an "N nights" indicator.
 */
export interface EventCard {
  /** The primary SwingEvent (first night). All card-face data comes from here. */
  event: SwingEvent;
  /** All occurrence dates for this card, in ascending order. */
  dates: string[];
  /** Total number of nights present in the expansion (remaining nights). */
  nightCount: number;
}
