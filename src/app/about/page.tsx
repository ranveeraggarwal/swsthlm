import React from 'react';
import { Sparkles, Code } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Stockholm Swing',
  description:
    'Stockholm\'s single, optimized calendar and aggregator for Lindy Hop, Balboa, Blues, and Shag dancing events and workshops.',
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="max-w-2xl mx-auto">
        {/* Hero Title */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded border border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[var(--primary)] font-sans text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Stockholm&apos;s Swing Dance Aggregator
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-black tracking-tight text-[var(--on-surface)] leading-tight">
            About Stockholm Swing
          </h1>
        </div>

        {/* Intro Description Card - Static Neobrutalist Shadow */}
        <div className="p-8 rounded-lg border-2 border-[var(--on-surface)] bg-[var(--surface-container-lowest)] shadow-[4px_4px_0px_0px_var(--on-surface)] mb-10 text-center">
          <p className="font-serif text-xl md:text-2xl text-[var(--on-surface)] leading-relaxed italic text-[var(--on-surface-variant)]">
            &ldquo;Your single, optimized calendar for Lindy Hop, Balboa, Blues, and Shag dancing events in Stockholm. Evoking the warm, tactile energy of vintage jazz halls.&rdquo;
          </p>
        </div>

        {/* Informative Text Sections */}
        <div className="space-y-10 font-sans text-[var(--on-surface-variant)] leading-relaxed font-body-md">
          <section>
            <h3 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">Our Mission</h3>
            <p className="text-[15px] sm:text-base">
              Stockholm Swing was born out of a desire to unite the local swing dance scene under one clear,
              lightweight, and easy-to-use platform. Instead of searching through fragmented social media feeds,
              different studio pages, and email newsletters, we aggregate everything in one central schedule.
            </p>
          </section>

          <section>
            <h3 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">Community First</h3>
            <p className="text-[15px] sm:text-base">
              This project is built and maintained by members of the community for the community. We are not
              affiliated with any single dance studio or organization, meaning we showcase events, socials, tea dances,
              and workshops from all organizers across Stockholm fairly and transparently.
            </p>
          </section>

          <section>
            <h3 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">Open Source</h3>
            <p className="text-[15px] sm:text-base mb-4">
              We love open source. Stockholm Swing is built in the open and released under the MIT License —
              the entire site, its data, and the tools that maintain it live in a public GitHub repository.
              If you&apos;d like to fix a listing, add a feature, or just see how it works, the code is right there.
              Contributions are welcome.
            </p>
            <a
              href="https://github.com/ranveeraggarwal/swsthlm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline font-bold"
            >
              <Code className="w-4 h-4" />
              View on GitHub
            </a>
          </section>

          <section className="bg-[var(--surface-container-low)] p-6 rounded-lg border-2 border-[var(--on-surface)] shadow-[3px_3px_0px_0px_var(--on-surface)]">
            <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-2">Are you an organizer?</h3>
            <p className="text-sm leading-relaxed mb-3">
              If you host a one-time or occasional Lindy Hop, Balboa, Blues, or Shag event in Stockholm, fill in our{' '}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSd87pOy31N_3xKthqalT-sDrFB2yoe74Z8HGr8q1HSs6Pis2g/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline font-bold"
              >
                event submission form
              </a>
              . A bot turns submissions into pull requests; a maintainer reviews and merges. You don&apos;t need a GitHub account.
            </p>
            <p className="text-sm leading-relaxed">
              Running a recurring weekly series?{' '}
              <a href="mailto:swing@walagran.com" className="text-[var(--primary)] hover:underline font-bold">
                Contact us directly
              </a>{' '}
              and we&apos;ll get it set up.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
