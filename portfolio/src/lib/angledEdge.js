// Angled top edge that flattens as a section scrolls to the top of the viewport.
//
// Instead of morphing the section's clip-path (which forces a full repaint every frame), the
// section's background sits inside `clip` (overflow: hidden), which is skewed so its top edge
// slants. `inner` gets the opposite skew around the same origin, so the background itself never
// looks sheared. Both are plain transforms, so the GPU handles the animation without repainting.
import { gsap } from './gsap.js';

const RAD_TO_DEG = 180 / Math.PI;

// `lowSide` is the side whose corner starts `height` px below the other ('left' or 'right').
export function animateAngledEdge({ section, clip, inner, lowSide, height = 120 }) {
  if (!section || !clip || !inner) return;

  // Pivot on the corner that stays put so only the low corner moves.
  const origin = lowSide === 'left' ? '100% 0' : '0 0';
  const sign = lowSide === 'left' ? -1 : 1;
  clip.style.transformOrigin = origin;
  inner.style.transformOrigin = origin;

  const state = { progress: 0 };
  const apply = () => {
    const offset = height * (1 - state.progress);
    const deg = sign * Math.atan(offset / section.offsetWidth) * RAD_TO_DEG;
    clip.style.transform = `skewY(${deg}deg)`;
    inner.style.transform = `skewY(${-deg}deg)`;
  };
  apply();

  // Stays fully angled until the top reaches 20% from the viewport top, flat by `top top`.
  gsap.to(state, {
    progress: 1,
    ease: 'none',
    onUpdate: apply,
    scrollTrigger: {
      trigger: section,
      start: 'top 20%',
      end: 'top top',
      scrub: 1,
      onRefresh: apply, // re-fit the angle when the section width changes
    },
  });
}
