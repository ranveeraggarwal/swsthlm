import React from 'react';
import { Code, Flag } from 'lucide-react';
import { CORRECTIONS_EMAIL } from '@/lib/corrections';
import { GitHubIcon } from '@/components/GitHubIcon';
import { ChangelogTimeline } from '@/components/ChangelogTimeline';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Stockholm Swing',
  description:
    'One place for every Lindy Hop, Balboa, Blues, and Shag social, workshop, and jam in Stockholm.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="max-w-2xl mx-auto">
        {/* Hero Title */}
        <div className="text-center mb-4 mt-0">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[var(--on-surface)] leading-tight">
            About <span className="italic font-normal">Stockholm Swing</span>
          </h1>
          <p className="mt-1 font-sans text-xs md:text-sm text-[var(--on-surface-variant)] leading-relaxed max-w-md mx-auto">
            One place for every social, workshop, and jam in Stockholm.
          </p>
        </div>

        {/* The one actionable thing on this page leads; the background follows. */}
        <section className="mt-8 bg-[var(--surface-container-low)] p-6 rounded-lg border-2 border-[var(--border-ink)] shadow-[3px_3px_0px_0px_var(--shadow-ink)] font-sans text-[var(--on-surface-variant)] leading-relaxed">
          <h2 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-2">Are you an organizer?</h2>
          <p className="text-sm leading-relaxed mb-3">
            If you host a one-time or occasional Lindy Hop, Balboa, Blues, or Shag event in Stockholm, fill in our{' '}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSd87pOy31N_3xKthqalT-sDrFB2yoe74Z8HGr8q1HSs6Pis2g/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline font-bold"
            >
              event submission form
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            . A bot turns submissions into pull requests; a maintainer reviews and merges. You don&apos;t need a GitHub account.
          </p>
          <p className="text-sm leading-relaxed">
            Running a recurring weekly series?{' '}
            <a href="mailto:hello@stockholmswing.com" className="text-[var(--primary)] hover:underline font-bold">
              Contact us directly
            </a>{' '}
            and we&apos;ll get it set up.
          </p>
        </section>

        {/* Informative Text Sections */}
        <div className="mt-10 space-y-10 font-sans text-[var(--on-surface-variant)] leading-relaxed font-body-md">
          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">Our Mission</h2>
            <p className="text-[15px] sm:text-base">
              Stockholm Swing was born out of a desire to unite the local swing dance scene under one clear,
              lightweight, and easy-to-use platform. Instead of searching through fragmented social media feeds,
              different studio pages, and email newsletters, we aggregate everything in one central schedule.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">Community First</h2>
            <p className="text-[15px] sm:text-base mb-4">
              This project is built and maintained by members of the community for the community. We are not
              affiliated with any single dance studio or organization, meaning we showcase events, socials, tea dances,
              and workshops from all organizers across Stockholm fairly and transparently.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
              <a
                href="https://github.com/ranveeraggarwal/swsthlm/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline font-bold"
              >
                <GitHubIcon className="w-4 h-4" />
                GitHub Community
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">Spotted something wrong?</h2>
            <p className="text-[15px] sm:text-base mb-4">
              Prices change, DJs swap, and some weeks a regular series simply doesn&apos;t run. Every event
              has a <strong className="font-bold text-[var(--on-surface)]">flag button</strong> that opens a
              short correction form — what&apos;s wrong, what it should say, and how you know. Sending it
              hands us an email with the listing&apos;s current details already attached, so we can find the
              row and fix it. You can also write to us directly.
            </p>
            <a
              href={`mailto:${CORRECTIONS_EMAIL}`}
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline font-bold"
            >
              <Flag className="w-4 h-4" aria-hidden="true" />
              {CORRECTIONS_EMAIL}
            </a>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">Built in the Open</h2>
            <p className="text-[15px] sm:text-base mb-4">
              The entire site, its data, and the tools that maintain it live in a public GitHub repository.
              If you&apos;d like to fix a listing, add a feature, or just see how it works, the code is right there.
              Contributions are welcome.
            </p>
            <p className="text-[15px] sm:text-base mb-4">
              It&apos;s released under the{' '}
              <a
                href="https://github.com/ranveeraggarwal/swsthlm/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline font-bold"
              >
                Business Source License 1.1
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              : use it, change it, and share it freely — including commercially — as long as you&apos;re not
              building a rival listing for swing events in Stockholm. Running your own copy, covering a
              different city, or contributing back here are all fine. The license converts to MIT on 7 July 2030.
            </p>
            <a
              href="https://github.com/ranveeraggarwal/swsthlm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline font-bold"
            >
              <Code className="w-4 h-4" />
              View on GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </section>

          <ChangelogTimeline />
        </div>
      </div>
    </div>
  );
}
