// Shared handle to the Lenis instance so modals can pause smooth scrolling.
import { useEffect } from 'react';

let lenisInstance = null;

export function setLenis(lenis) {
  lenisInstance = lenis;
}

// Freeze page scroll (Lenis + native) while `active` is true so the page and
// its scrubbed ScrollTrigger animations stop repainting behind an open modal.
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const { documentElement } = document;
    const prevOverflow = documentElement.style.overflow;
    documentElement.style.overflow = 'hidden';
    lenisInstance?.stop();
    return () => {
      documentElement.style.overflow = prevOverflow;
      lenisInstance?.start();
    };
  }, [active]);
}

// Smooth-scroll to a section through Lenis, falling back to native scrolling.
// `target` is a selector or a pixel offset.
export function scrollToTarget(target) {
  const dest = typeof target === 'string' ? document.querySelector(target) : target;
  if (dest == null) return;
  if (lenisInstance) lenisInstance.scrollTo(dest, { duration: 1.4 });
  else if (typeof dest === 'number') window.scrollTo({ top: dest, behavior: 'smooth' });
  else dest.scrollIntoView({ behavior: 'smooth' });
}
