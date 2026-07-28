'use client';

// The homepage's title and standfirst.
//
// Split out of `app/page.tsx` rather than making that route a client
// component: the route loads events at build time and emits the JSON-LD, both
// of which have to stay server-side (CODE_STRUCTURE rules 2 and 6). Only the
// two lines of copy need the locale, so only they cross the boundary.

import { useLocale } from '@/components/providers/LocaleProvider';

export function HomeHero() {
  const { bundle } = useLocale();

  return (
    <div className="text-center max-w-2xl mx-auto mb-4 mt-0">
      <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[var(--on-surface)] leading-tight">
        {bundle.home.title.lead}
        <span className="italic font-normal">{bundle.home.title.em}</span>
      </h1>
      <p className="mt-1 font-sans text-xs md:text-sm text-[var(--on-surface-variant)] leading-relaxed max-w-md mx-auto">
        {bundle.home.subtitle}
      </p>
    </div>
  );
}
