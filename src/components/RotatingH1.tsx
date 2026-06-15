'use client';

import React, { useEffect, useState } from 'react';

const GREETINGS = [
  "Let's Dance, Stockholm",
  'See You on the Dance Floor',
  'Lace Up Your Dance Shoes',
  'Where Stockholm Goes to Swing',
  'Step Out and Swing',
  'The Floor is Yours',
  'Find Your Next Dance',
];

export function RotatingH1() {
  const [greeting, setGreeting] = useState(GREETINGS[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * GREETINGS.length);
    setGreeting(GREETINGS[randomIndex]);
  }, []);

  return (
    <h1 className="font-serif text-2xl md:text-3xl font-black tracking-tight text-[var(--on-surface)] leading-tight">
      {greeting === GREETINGS[0] ? (
        <>
          Let&apos;s Dance, <span className="italic font-normal">Stockholm</span>
        </>
      ) : (
        greeting
      )}
    </h1>
  );
}
