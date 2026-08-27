'use client';

// The About page's body.
//
// Split out of `app/about/page.tsx` so the route can keep exporting
// `metadata`, which is server-only, while the prose reads the locale. Same
// split as `HomeHero`, one page up in size.
//
// Several paragraphs have links or bold runs inside them, so they render
// through `<Interpolate>`: the sentence stays whole in the locale file and
// this component supplies the nodes. See `@/i18n/template`.

import React from 'react';
import { Code, Flag } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { Interpolate } from '@/components/ui/Interpolate';
import { useLocale } from '@/components/providers/LocaleProvider';
import { ChangelogTimeline } from '@/features/changelog/ChangelogTimeline';
import { ContributorsWall } from '@/features/contributors/ContributorsWall';
import {
  CONTACT_EMAIL,
  CORRECTIONS_EMAIL,
  GITHUB_DISCUSSIONS_URL,
  GITHUB_REPO_URL,
} from '@/lib/site';

const LINK = 'text-[var(--primary)] hover:underline font-bold';

export function AboutContent() {
  const { bundle } = useLocale();
  const t = bundle.about;

  const newTabHint = <span className="sr-only">{bundle.card.opensInNewTab}</span>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="max-w-2xl mx-auto">
        {/* Hero Title */}
        <div className="text-center mb-4 mt-0">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[var(--on-surface)] leading-tight">
            {t.title.lead}
            <span className="italic font-normal">{t.title.em}</span>
          </h1>
          <p className="mt-1 font-sans text-xs md:text-sm text-[var(--on-surface-variant)] leading-relaxed max-w-md mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* The two things a visitor can act on lead the page as cards; the
            background sections follow as plain prose. */}
        <div className="mt-8 space-y-6 font-sans text-[var(--on-surface-variant)] leading-relaxed">
          <section className="bg-[var(--surface-container-low)] p-6 rounded-lg border-2 border-[var(--border-ink)] shadow-[3px_3px_0px_0px_var(--shadow-ink)]">
            <h2 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-2">
              {t.organizers.heading}
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              <Interpolate
                template={t.organizers.intro}
                values={{
                  email: (
                    <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
                      {t.organizers.emailLink}
                    </a>
                  ),
                }}
              />
            </p>
            <p className="text-sm leading-relaxed">
              <Interpolate
                template={t.organizers.series}
                values={{
                  contact: (
                    <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
                      {t.organizers.contactLink}
                    </a>
                  ),
                }}
              />
            </p>
          </section>

          <section className="bg-[var(--surface-container-low)] p-6 rounded-lg border-2 border-[var(--border-ink)] shadow-[3px_3px_0px_0px_var(--shadow-ink)]">
            <h2 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-2">
              {t.corrections.heading}
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              <Interpolate
                template={t.corrections.intro}
                values={{
                  flagButton: (
                    <strong className="font-bold text-[var(--on-surface)]">
                      {t.corrections.flagButton}
                    </strong>
                  ),
                }}
              />
            </p>
            <p className="text-sm leading-relaxed">
              <Interpolate
                template={t.corrections.writeDirectly}
                values={{
                  email: (
                    <a
                      href={`mailto:${CORRECTIONS_EMAIL}`}
                      className={`inline-flex items-center gap-1.5 ${LINK}`}
                    >
                      <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                      {CORRECTIONS_EMAIL}
                    </a>
                  ),
                }}
              />
            </p>
          </section>
        </div>

        {/* Informative Text Sections */}
        <div className="mt-10 space-y-10 font-sans text-[var(--on-surface-variant)] leading-relaxed font-body-md">
          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">
              {t.mission.heading}
            </h2>
            <p className="text-[15px] sm:text-base">{t.mission.body}</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">
              {t.community.heading}
            </h2>
            <p className="text-[15px] sm:text-base mb-4">{t.community.body}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
              <a
                href={GITHUB_DISCUSSIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline font-bold"
              >
                <GitHubIcon className="w-4 h-4" aria-hidden="true" />
                {t.community.githubLink}
                {newTabHint}
              </a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">
              {t.openSource.heading}
            </h2>
            <p className="text-[15px] sm:text-base mb-4">{t.openSource.body}</p>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline font-bold"
            >
              <Code className="w-4 h-4" aria-hidden="true" />
              {t.openSource.githubLink}
              {newTabHint}
            </a>
          </section>

          <ChangelogTimeline />
          <ContributorsWall />
        </div>
      </div>
    </div>
  );
}
