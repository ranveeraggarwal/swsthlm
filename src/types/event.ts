export interface SwingEvent {
  id: string;
  title: string;
  status: 'published' | 'draft';
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
}
