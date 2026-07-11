// Root layout for the /herrang microsite — deliberately a SEPARATE root from
// the main site (route-group multiple-root-layouts pattern). No shared header,
// nav, fonts, or theme: the design system here is the camp's daily poster,
// not the Savoy. See the design brief in the PR that introduced this.

import type { Metadata, Viewport } from 'next';
import { Archivo_Black, Inter } from 'next/font/google';
import './herrang.css';

const display = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-hg-display',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-hg-body',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://stockholmswing.com'),
  title: 'A Day in Herräng',
  description:
    'What is happening today in Herräng — your track’s classes, tonight’s DJs, shows and jams. At a glance, on a phone, possibly at 2am.',
  // A tool for people physically at the camp; not for search engines, and not
  // linked from the main site's nav or sitemap.
  robots: { index: false, follow: false },
  openGraph: {
    siteName: 'A Day in Herräng',
    locale: 'en',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#141414',
};

export default function HerrangLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Decide the ground before first paint. Auto rule: night 20:00–08:00,
            manual override in localStorage wins. Mirrors src/lib/herrang/time.ts. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var p=localStorage.getItem('herrang.theme.v1');var h=new Date().getHours();var n=p==='\"night\"'||(p!=='\"day\"'&&(h>=20||h<8));document.documentElement.setAttribute('data-hg',n?'night':'day')}catch(e){document.documentElement.setAttribute('data-hg','day')}})()",
          }}
        />
      </head>
      <body className="hg-body">{children}</body>
    </html>
  );
}
