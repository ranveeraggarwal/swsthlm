import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/lib/site';
import { playfair, jakarta } from '@/lib/fonts';
import { RootShell } from '@/components/layout/RootShell';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Stockholm Swing',
  description: 'Lindy Hop, Balboa, Shag, and Blues social dancing in Stockholm.',
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
  openGraph: {
    siteName: 'Stockholm Swing',
    locale: 'en',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  themeColor: '#a03b00',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
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
      <RootShell locale="en">{children}</RootShell>
    </html>
  );
}
