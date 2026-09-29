import { useState, useEffect, useCallback } from 'react';

// Tracks a native horizontally-scrolling row of cards: which cards are fully
// visible, whether the row is at either end, and a helper to step one card
// at a time. Positions come from the browser, so it stays correct at every
// breakpoint without knowing how many cards fit.
export function useHorizontalScroller(ref, { enabled = true } = {}) {
  const [state, setState] = useState({ first: 0, last: 0, atStart: true, atEnd: true });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return undefined;

    // Start from the first card whenever the row (re)becomes a scroller, e.g.
    // coming back from the "view all" grid, which doesn't reset it by itself.
    el.scrollLeft = 0;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const cards = Array.from(el.children);
      const left = el.scrollLeft;
      const right = left + el.clientWidth;
      // Tolerance absorbs sub-pixel snapping and cards that peek by a hair
      const tol = 4;

      let first = -1;
      let last = -1;
      cards.forEach((card, i) => {
        const start = card.offsetLeft;
        const end = start + card.offsetWidth;
        if (start >= left - tol && end <= right + tol) {
          if (first === -1) first = i;
          last = i;
        }
      });
      // A card wider than the viewport is never "fully" visible — fall back
      // to the one nearest the left edge.
      if (first === -1) {
        first = cards.findIndex((c) => c.offsetLeft + c.offsetWidth > left + tol);
        last = first;
      }

      const next = {
        first: Math.max(0, first),
        last: Math.max(0, last),
        atStart: left <= tol,
        atEnd: right >= el.scrollWidth - tol,
      };
      setState((prev) =>
        prev.first === next.first &&
        prev.last === next.last &&
        prev.atStart === next.atStart &&
        prev.atEnd === next.atEnd
          ? prev
          : next,
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // Flag the row while it moves so CSS can switch off card hover effects — otherwise every
    // card sliding under a stationary pointer kicks off its hover transitions mid-scroll.
    let idleTimer = 0;
    const onScroll = () => {
      schedule();
      el.classList.add('is-scrolling');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => el.classList.remove('is-scrolling'), 150);
    };

    measure();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      el.classList.remove('is-scrolling');
    };
  }, [ref, enabled]);

  const scrollByCard = useCallback(
    (dir) => {
      const el = ref.current;
      const card = el?.firstElementChild;
      if (!card) return;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
    },
    [ref],
  );

  return { ...state, scrollByCard };
}
