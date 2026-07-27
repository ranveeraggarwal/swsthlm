// Shared `next/font/google` instances. English and Swedish each have their own
// root layout (see docs/architecture/CODE_STRUCTURE.md's i18n note), and
// `next/font` loaders are meant to be called once and re-exported rather than
// invoked separately per file.

import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

export const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

export const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
});
