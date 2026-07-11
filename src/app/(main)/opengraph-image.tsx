import { ImageResponse } from 'next/og';

export const alt =
  'Stockholm Swing – Lindy Hop, Balboa, Shag & Blues in Stockholm';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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

export default async function Image() {
  const [playfair, jakarta] = await Promise.all([
    loadFont('Playfair Display', 700),
    loadFont('Plus Jakarta Sans', 600),
  ]);

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
        {/* Top accent bar */}
        <div
          style={{
            width: '100%',
            height: 8,
            backgroundColor: '#a03b00',
            display: 'flex',
          }}
        />

        {/* Decorative corner elements */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 60,
            width: 80,
            height: 80,
            borderLeft: '3px solid #e1bfb2',
            borderTop: '3px solid #e1bfb2',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            right: 60,
            width: 80,
            height: 80,
            borderRight: '3px solid #e1bfb2',
            borderBottom: '3px solid #e1bfb2',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 80px',
          }}
        >
          {/* Music note accent */}
          <div
            style={{
              fontSize: 40,
              color: '#a03b00',
              marginBottom: 16,
              fontFamily: 'Plus Jakarta Sans',
              opacity: 0.6,
              display: 'flex',
            }}
          >
            {'♪ ♫ ♪'}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontFamily: 'Playfair Display',
              fontWeight: 700,
              color: '#1b1c16',
              textAlign: 'center',
              lineHeight: 1.1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span>Stockholm</span>
            <span
              style={{
                fontStyle: 'italic',
                fontWeight: 700,
                color: '#a03b00',
              }}
            >
              Swing
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 120,
              height: 3,
              backgroundColor: '#a03b00',
              margin: '28px 0',
              display: 'flex',
            }}
          />

          {/* Tagline */}
          <div
            style={{
              fontSize: 24,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
              color: '#594138',
              textAlign: 'center',
              lineHeight: 1.5,
              display: 'flex',
            }}
          >
            Lindy Hop · Balboa · Shag · Blues
          </div>

          <div
            style={{
              fontSize: 20,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
              color: '#8d7166',
              textAlign: 'center',
              marginTop: 8,
              display: 'flex',
            }}
          >
            Social dancing in Stockholm
          </div>
        </div>

        {/* Bottom bar with URL */}
        <div
          style={{
            width: '100%',
            height: 52,
            backgroundColor: '#a03b00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
