import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/lib/site';
import { DEFAULT_LOCALE, LOCALE_PENDING_ATTR, LOCALE_STORAGE_KEY } from '@/i18n';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { InstallToast } from '@/components/layout/InstallToast';
import { LanguagePrompt } from '@/components/layout/LanguagePrompt';
import { ToastStack } from '@/components/layout/ToastStack';
import { SkipToContentLink } from '@/components/layout/SkipToContentLink';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
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
        {/* Runs before first paint. Two jobs, both of which have to happen
            before anything is drawn: stamp the theme, and — when a language
            other than the built-in one is stored — veil the page until that
            language has been applied, so a returning reader doesn't watch the
            site translate itself.

            The timeout is a fail-open, and it is not optional: hiding content
            behind a script is how a page ends up blank forever when the
            bundle 404s. Worst case the veil lifts on its own and the reader
            sees the swap they'd have seen anyway. */}
        <script
          dangerouslySetInnerHTML={{
            __html: [
              '(function(){',
              "try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='light'}",
              "document.documentElement.setAttribute('data-theme',t)}",
              "catch(e){document.documentElement.setAttribute('data-theme','light')}",
              'try{',
              `var l=localStorage.getItem('${LOCALE_STORAGE_KEY}');`,
              `if(l&&l!=='${DEFAULT_LOCALE}'){`,
              'var d=document.documentElement;',
              `d.setAttribute('${LOCALE_PENDING_ATTR}','');`,
              `setTimeout(function(){d.removeAttribute('${LOCALE_PENDING_ATTR}')},2000);`,
              '}}catch(e){}',
              '})()',
            ].join(''),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LocaleProvider>
          <SkipToContentLink />
          <div
            data-app-shell
            className="min-h-screen flex flex-col relative bg-[var(--background)] text-[var(--on-surface)]"
          >
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
