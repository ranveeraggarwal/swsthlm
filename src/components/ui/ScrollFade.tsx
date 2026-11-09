'use client';

// A horizontal scroller whose edges fade only where there is more to scroll to.
// The fade itself is CSS (`.filter-scroll-container` in globals.css); this
// component measures the scroll position and sets `data-fade-start` /
// `data-fade-end` on the wrapper so each edge fades only while content is
// hidden past it (#463).
//
// The first render (server HTML, and the client's hydration pass) assumes
// "at the start, more to the right" — the common case for a chip row on a
// phone — so there is no hydration mismatch; the real values land in an effect.

import React, { useEffect, useRef, useState } from 'react';

// Sub-pixel scroll positions (zoom, fractional device pixel ratios) mean the
// scroller rarely lands exactly on 0 or on its maximum.
const EDGE_TOLERANCE_PX = 2;

type ScrollFadeProps = React.HTMLAttributes<HTMLDivElement>;

export function ScrollFade({ children, ...scrollerProps }: ScrollFadeProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ start: false, end: true });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      // `scrollLeft` is negative in right-to-left layouts; `Math.abs` keeps
      // "distance from the start" meaningful either way.
      const offset = Math.abs(el.scrollLeft);
      const start = offset > EDGE_TOLERANCE_PX;
      const end = maxScroll - offset > EDGE_TOLERANCE_PX;
      setFade((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    // Re-measure when the scroller or its contents change size: viewport
    // rotation, the md: breakpoint switching to wrap, a locale change
    // relabelling the chips.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);

    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [children]);

  return (
    <div
      className="filter-scroll-container"
      data-fade-start={fade.start ? 'true' : undefined}
      data-fade-end={fade.end ? 'true' : undefined}
    >
      <div ref={scrollerRef} {...scrollerProps}>
        {children}
      </div>
    </div>
  );
}
