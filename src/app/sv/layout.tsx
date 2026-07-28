import type { Metadata, Viewport } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { playfair, jakarta } from '@/lib/fonts';
import { RootShell } from '@/components/layout/RootShell';
import { dictionary } from '@/lib/i18n';
import '../globals.css';

// Mirrors `app/(en)/layout.tsx` — its own root layout (its own `<html>`/
// `<body>`), per the "multiple root layouts" pattern, since a shared ancestor
// layout has no way to know which locale segment matched.
//
// The site name stays "Stockholm Swing" in both trees — it's a proper noun,
// not copy. Everything else here is per-locale as of #266.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: dictionary('sv').meta.site.description,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'STHLM Swing',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  // Fallback only — see the note in `app/(en)/layout.tsx`.
  openGraph: {
    siteName: SITE_NAME,
    locale: 'sv',
    alternateLocale: 'en',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  themeColor: '#a03b00',
};

export default function SwedishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})()",
          }}
        />
      </head>
      <RootShell locale="sv">{children}</RootShell>
    </html>
  );
}
