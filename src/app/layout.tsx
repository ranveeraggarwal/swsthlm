import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { InstallToast } from '@/components/InstallToast';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://stockholmswing.com'),
  title: 'Stockholm Swing',
  themeColor: '#a03b00',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-[var(--surface-container-lowest)] focus:text-[var(--primary)] focus:font-bold focus:underline outline-none">Skip to content</a>
        <div className="min-h-screen flex flex-col relative bg-[var(--background)] text-[var(--on-surface)]">
          <Header />
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <InstallToast />
        <Analytics />
      </body>
    </html>
  );
}
