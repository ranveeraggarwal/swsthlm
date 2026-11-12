'use client';

// A horizontal scroller whose edges fade only where there is more to scroll to.
// The fade itself is CSS (`.filter-scroll-container` in globals.css): a mask on
// the scroller, so the content itself turns transparent at the edge. This
// component measures the scroll position and writes `--fade-start` /
// `--fade-end` (0–1) on the scroller. Each edge's strength follows the distance
// left to scroll on that side, so both fades ease out as you approach the edge
// rather than switching off at it (#463).
//
// A mask rather than a gradient overlaid on top: an overlay and the scroller's
// clipping edge round to device pixels separately when the panel's width is
// fractional, which left a one-pixel sliver of chip unfaded at each edge.
//
// The values are written straight to the element's style, not through React
// state: they change on every scroll frame, and the stylesheet's defaults
// ("at the start, more to the right") already cover the server HTML and the
// hydration pass, so there is nothing for React to reconcile.

import React, { useEffect, useRef } from 'react';

// How far from an edge the fade reaches full strength. Matches the fade's
// width in globals.css, so the gradient is fully on whenever a full fade's
// worth of content is hidden past it.
const FADE_RAMP_PX = 48;

type ScrollFadeProps = React.HTMLAttributes<HTMLDivElement>;

export function ScrollFade({ children, className, ...scrollerProps }: ScrollFadeProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      // Clamp to the real scroll range: iOS rubber-band overscroll briefly
      // reports a negative `scrollLeft` past the start (and more than the
      // maximum past the end), which would otherwise hold a fade on during
      // the bounce and then drop it all at once.
      const offset = Math.min(Math.max(el.scrollLeft, 0), maxScroll);
      const ramp = (distance: number) => Math.min(distance / FADE_RAMP_PX, 1).toFixed(3);
      el.style.setProperty('--fade-start', ramp(offset));
      el.style.setProperty('--fade-end', ramp(maxScroll - offset));
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
      ref={scrollerRef}
      className={className ? `filter-scroll-container ${className}` : 'filter-scroll-container'}
      {...scrollerProps}
    >
      {children}
    </div>
  );
}
