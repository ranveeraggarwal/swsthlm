// English chrome copy. `satisfies LocaleBundle` rather than `: LocaleBundle`
// so the exported value keeps its literal (not widened) type, while the
// compiler still checks every key against the contract.

import type { LocaleBundle } from './bundle';

export const en = {
  nav: {
    calendar: 'Calendar',
    about: 'About',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  a11y: {
    skipToContent: 'Skip to content',
  },
} satisfies LocaleBundle;
