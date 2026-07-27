// The link-unfurl image for an event permalink (issue #12).
//
// Rendered by satori, which supports neither CSS custom properties nor Tailwind,
// so the palette below is hex literals rather than the design tokens used
// everywhere else. Keep them in step with docs/DESIGN.md by hand.

import { ImageResponse } from 'next/og';
import { formatEventDate } from '@/lib/date/format';
import type { FloorType, Style } from '@/lib/data/types';
import { getPermalinkEvents } from '@/features/events/loader';
import { styleLabel } from '@/features/events/model/labels';

export const alt = 'Event details';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const events = await getPermalinkEvents();
  return events.map((event) => ({ id: event.sourceId, date: event.date }));
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

// Style chip palette. Labels come from the shared `styleLabel`; only the colours
// are duplicated here, because satori can't read the tokens.
const STYLE_COLORS: Record<Style, { bg: string; fg: string }> = {
  'lindy-hop': { bg: '#8d712a', fg: '#fffbff' },
  balboa: { bg: '#4f5e7e', fg: '#ffffff' },
  blues: { bg: '#eae8de', fg: '#594138' },
  shag: { bg: '#f0eee3', fg: '#594138' },
  all: { bg: '#f0eee3', fg: '#594138' },
};

const FLOOR_TYPE_LABELS: Record<FloorType, string> = {
  studio: 'Dance studio',
  hall: 'Dance hall',
  bar: 'Bar / restaurant',
  outdoor: 'Outdoor',
};

export default async function Image({
  params,
}: {
  params: Promise<{ id: string; date: string }>;
}) {
  const { id, date } = await params;
  const events = await getPermalinkEvents();
  const event = events.find((e) => e.sourceId === id && e.date === date);

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

  const styleColor = STYLE_COLORS[event.style] ?? STYLE_COLORS.all;
  const styleText = styleLabel(event.style, { compact: true });
  const dateFormatted = formatEventDate(event.date);
  const titleTruncated =
    event.title.length > 60 ? event.title.slice(0, 57) + '…' : event.title;

  const performer = event.band
    ? `🎷 ${event.band}`
    : event.dj
      ? `🎧 ${event.dj}`
      : event.music === 'live'
        ? '🎷 Live music'
        : event.music === 'dj'
          ? '🎧 DJ set'
          : null;

  const logistics = [event.price, event.payment].filter(Boolean).join(' · ');

  const floorLabel = event.floorType ? FLOOR_TYPE_LABELS[event.floorType] : undefined;

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
          {/* Identity chips: style, floor type, beginner */}
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
                marginRight: 12,
              }}
            >
              {styleText}
            </span>
            {floorLabel && (
              <span
                style={{
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#594138',
                  backgroundColor: '#f0eee3',
                  padding: '6px 16px',
                  borderRadius: 4,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  marginRight: 12,
                }}
              >
                {floorLabel}
              </span>
            )}
            {event.beginnerClass && (
              <span
                style={{
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#2f5934',
                  backgroundColor: '#e5f3e6',
                  padding: '6px 16px',
                  borderRadius: 4,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'flex',
                }}
              >
                Beginner friendly
              </span>
            )}
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
              marginBottom: performer || logistics ? 8 : 0,
            }}
          >
            📍 {event.venue}
            {event.neighborhood ? ` · ${event.neighborhood}` : ''}
          </div>

          {/* Performer */}
          {performer && (
            <div
              style={{
                fontSize: 20,
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 600,
                color: '#8d7166',
                display: 'flex',
                alignItems: 'center',
                marginBottom: logistics ? 8 : 0,
              }}
            >
              {performer}
            </div>
          )}

          {/* Price / payment */}
          {logistics && (
            <div
              style={{
                fontSize: 18,
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 600,
                color: '#8d7166',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              💳 {logistics}
            </div>
          )}
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
