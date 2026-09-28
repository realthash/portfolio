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
