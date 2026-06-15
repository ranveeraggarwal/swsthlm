'use client';

import React, { useEffect, useState } from 'react';

// Each greeting: [bold main text, italic closing word/phrase]
// The italic+normal weight treatment matches the site's visual identity.
// Index 0 is the SSR default — crawlers always see "Swing Dance Stockholm".
const GREETINGS: [string, string][] = [
  ['Swing Dance', 'Stockholm'],
  ['Stockholm in', 'Full Swing'],
  ['See You on the', 'Floor'],
  ['Dance,', 'Stockholm'],
];

export function RotatingH1() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * GREETINGS.length));
  }, []);

  const [main, italic] = GREETINGS[index];

  return (
    <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[var(--on-surface)] leading-tight">
      {main} <span className="italic font-normal">{italic}</span>
    </h1>
  );
}
