import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/lib/site';
import { Besley, Schibsted_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { InstallToast } from '@/components/layout/InstallToast';
import { LanguagePrompt } from '@/components/layout/LanguagePrompt';
import { ToastStack } from '@/components/layout/ToastStack';
import { SkipToContentLink } from '@/components/layout/SkipToContentLink';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import './globals.css';

const besley = Besley({
  variable: '--font-besley',
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
});

const schibsted = Schibsted_Grotesk({
  variable: '--font-schibsted',
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
});

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
      className={`${besley.variable} ${schibsted.variable} h-full antialiased`}
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
      <body className="min-h-full flex flex-col">
        <LocaleProvider>
          <SkipToContentLink />
          <div className="min-h-screen flex flex-col relative bg-[var(--background)] text-[var(--on-surface)]">
            <Header />
            <main id="main-content" className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <ToastStack>
            <LanguagePrompt />
            <InstallToast />
          </ToastStack>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
