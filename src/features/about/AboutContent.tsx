import React from 'react';
import { Code, Flag } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { ChangelogTimeline } from '@/features/changelog/ChangelogTimeline';
import { ContributorsWall } from '@/features/contributors/ContributorsWall';
import { dictionary, type Locale } from '@/lib/i18n';
import {
  CONTACT_EMAIL,
  CORRECTIONS_EMAIL,
  EVENT_SUBMISSION_FORM_URL,
  GITHUB_DISCUSSIONS_URL,
  GITHUB_REPO_URL,
} from '@/lib/site';

/**
 * The About page body, shared by `/about` and `/sv/about` so the ~150 lines of
 * prose live in one place and the two locales stay diffable: the heading
 * structure and order are identical in both, only the words change.
 *
 * Copy comes from `lib/i18n`'s `about` namespace. Paragraphs that wrap an
 * inline link are assembled from `…Lead` / label / `…Tail` fragments that carry
 * their own spacing and punctuation — see `en.ts`'s header comment.
 */
export function AboutContent({ locale = 'en' }: { locale?: Locale }) {
  const d = dictionary(locale);
  const t = d.about;
  const newTab = d.common.opensInNewTab;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="max-w-2xl mx-auto">
        {/* Hero Title */}
        <div className="text-center mb-4 mt-0">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[var(--on-surface)] leading-tight">
            {t.titleLead}
            <span className="italic font-normal">Stockholm Swing</span>
          </h1>
          <p className="mt-1 font-sans text-xs md:text-sm text-[var(--on-surface-variant)] leading-relaxed max-w-md mx-auto">
            {t.tagline}
          </p>
        </div>

        {/* The two things a visitor can act on lead the page as cards; the
            background sections follow as plain prose. */}
        <div className="mt-8 space-y-6 font-sans text-[var(--on-surface-variant)] leading-relaxed">
          <section className="bg-[var(--surface-container-low)] p-6 rounded-lg border-2 border-[var(--border-ink)] shadow-[3px_3px_0px_0px_var(--shadow-ink)]">
            <h2 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-2">
              {t.organizer.heading}
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              {t.organizer.introLead}
              <a
                href={EVENT_SUBMISSION_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline font-bold"
              >
                {t.organizer.formLink}
                <span className="sr-only"> {newTab}</span>
              </a>
              {t.organizer.introMid}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--primary)] hover:underline font-bold">
                {t.organizer.emailLink}
              </a>
              {t.organizer.introTail}
            </p>
            <p className="text-sm leading-relaxed">
              {t.organizer.seriesLead}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--primary)] hover:underline font-bold">
                {t.organizer.seriesLink}
              </a>
              {t.organizer.seriesTail}
            </p>
          </section>

          <section className="bg-[var(--surface-container-low)] p-6 rounded-lg border-2 border-[var(--border-ink)] shadow-[3px_3px_0px_0px_var(--shadow-ink)]">
            <h2 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-2">
              {t.corrections.heading}
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              {t.corrections.bodyLead}
              <strong className="font-bold text-[var(--on-surface)]">{t.corrections.flagButton}</strong>
              {t.corrections.bodyTail}
            </p>
            <p className="text-sm leading-relaxed">
              {t.corrections.emailLead}
              <a
                href={`mailto:${CORRECTIONS_EMAIL}`}
                className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:underline font-bold"
              >
                <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                {CORRECTIONS_EMAIL}
              </a>
              {t.corrections.emailTail}
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
                <GitHubIcon className="w-4 h-4" />
                {t.community.link}
                <span className="sr-only"> {newTab}</span>
              </a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">
              {t.open.heading}
            </h2>
            <p className="text-[15px] sm:text-base mb-4">{t.open.body}</p>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline font-bold"
            >
              <Code className="w-4 h-4" />
              {t.open.link}
              <span className="sr-only"> {newTab}</span>
            </a>
          </section>

          <ChangelogTimeline locale={locale} />
          <ContributorsWall locale={locale} />
        </div>
      </div>
    </div>
  );
}
