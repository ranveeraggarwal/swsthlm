import { ImageResponse } from 'next/og';
import { getPermalinkEvents } from '@/lib/events';
import { formatEventDate } from '@/lib/datetime';

export const alt = 'Event details';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const events = await getPermalinkEvents();
  return events.map((event) => ({
    id: event.id.split(':')[0],
    date: event.date,
  }));
}

async function loadFont(
  family: string,
  weight: number
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`;
  const css = await (await fetch(url)).text();
  const match = css.match(/url\(([^)]+)\)/);
  if (!match) throw new Error(`Failed to load font: ${family}`);
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

const STYLE_COLORS: Record<string, { bg: string; fg: string }> = {
  lindy: { bg: '#8d712a', fg: '#fffbff' },
  balboa: { bg: '#4f5e7e', fg: '#ffffff' },
  blues: { bg: '#eae8de', fg: '#594138' },
  all: { bg: '#f0eee3', fg: '#594138' },
};

const STYLE_LABELS: Record<string, string> = {
  lindy: 'Lindy Hop',
  balboa: 'Balboa',
  blues: 'Blues',
  all: 'All Styles',
  shag: 'Shag',
};

export default async function Image({
  params,
}: {
  params: Promise<{ id: string; date: string }>;
}) {
  const { id, date } = await params;
  const events = await getPermalinkEvents();
  const event = events.find(
    (e) => e.id.split(':')[0] === id && e.date === date
  );

  if (!event) {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#fcfaef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          color: '#1b1c16',
        }}
      >
        Stockholm Swing
      </div>,
      size
    );
  }

  const [playfair, jakarta] = await Promise.all([
    loadFont('Playfair Display', 700),
    loadFont('Plus Jakarta Sans', 600),
  ]);

  const styleKey = event.style.toLowerCase();
  const styleColor = STYLE_COLORS[styleKey] ?? STYLE_COLORS.all;
  const styleLabel =
    STYLE_LABELS[styleKey] ??
    styleKey.charAt(0).toUpperCase() + styleKey.slice(1);
  const dateFormatted = formatEventDate(event.date);
  const titleTruncated =
    event.title.length > 60 ? event.title.slice(0, 57) + '…' : event.title;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fcfaef',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top bar with branding */}
        <div
          style={{
            width: '100%',
            height: 56,
            backgroundColor: '#a03b00',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          <span
            style={{
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 16,
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            stockholmswing.com
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 60px',
          }}
        >
          {/* Style badge */}
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <span
              style={{
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 14,
                fontWeight: 600,
                color: styleColor.fg,
                backgroundColor: styleColor.bg,
                padding: '6px 16px',
                borderRadius: 4,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {styleLabel}
            </span>
          </div>

          {/* Event title */}
          <div
            style={{
              fontSize: 52,
              fontFamily: 'Playfair Display',
              fontWeight: 700,
              color: '#1b1c16',
              lineHeight: 1.15,
              marginBottom: 24,
              display: 'flex',
            }}
          >
            {titleTruncated}
          </div>

          {/* Date */}
          <div
            style={{
              fontSize: 24,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
              color: '#a03b00',
              marginBottom: 12,
              display: 'flex',
            }}
          >
            {dateFormatted}
          </div>

          {/* Time */}
          <div
            style={{
              fontSize: 22,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
              color: '#594138',
              marginBottom: 16,
              display: 'flex',
            }}
          >
            {event.start} – {event.end}
          </div>

          {/* Venue */}
          <div
            style={{
              fontSize: 20,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
              color: '#8d7166',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            📍 {event.venue}
            {event.neighborhood ? ` · ${event.neighborhood}` : ''}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            width: '100%',
            height: 8,
            backgroundColor: '#a03b00',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Playfair Display', data: playfair, weight: 700 as const },
        { name: 'Plus Jakarta Sans', data: jakarta, weight: 600 as const },
      ],
    }
  );
}
