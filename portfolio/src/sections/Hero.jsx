import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { hero } from '../data/content.js';
import background from '../assets/background.webp';
import portfolioWord from '../assets/portfolio-word.webp';
import portrait from '../assets/hero-portrait.webp';
import './Hero.css';

function Sparkle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.4 7.6 4.4 11.6 12 12-7.6.4-11.6 4.4-12 12-.4-7.6-4.4-11.6-12-12 7.6-.4 11.6-4.4 12-12Z" />
    </svg>
  );
}

function Pin() {
  return (
    <svg className="hero__pin" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*<>/';

// Adds a scramble-decode for each element to the timeline, starting `gap` seconds apart.
// Duration scales with text length so short and long labels finish at a similar pace.
function addScramble(tl, targets, position, { gap = 0.1, speed = 0.045, min = 0.7 } = {}) {
  gsap.utils.toArray(targets).forEach((el, i) => {
    const text = el.textContent;
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, position + i * gap).to(
      el,
      {
        duration: Math.max(min, text.length * speed),
        ease: 'none',
        scrambleText: { text, chars: SCRAMBLE_CHARS, revealDelay: 0.3, speed: 0.6 },
      },
      '<',
    );
  });
}

// Masked line-by-line rise. autoSplit re-splits after fonts load or on resize.
function revealLines(targets, delay) {
  return gsap.utils.toArray(targets).map((el, i) =>
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 100,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          delay: delay + i * 0.2,
        }),
    }),
  );
}

export default function Hero() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.1 } });

        tl.from('.hero__bg', { autoAlpha: 0, scale: 1.08, duration: 1.6, ease: 'power2.out' })
          .from('.hero__word', { autoAlpha: 0, yPercent: 12, scale: 1.04, duration: 1.5 }, 0.15)
          .from('.hero__portrait', { autoAlpha: 0, y: 70, duration: 1.4 }, 0.35)
          .from('.hero__rule', { scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: 'power2.inOut' }, 0.5)
          .from('.hero__top .hero__spark', { autoAlpha: 0, rotate: -90, duration: 0.8 }, 0.9)
          // Handwriting wipe: clip from left to right; negative insets leave room for script swashes.
          .fromTo(
            '.hero__hello',
            { clipPath: 'inset(-30% 100% -30% -10%)' },
            { clipPath: 'inset(-30% -10% -30% -10%)', duration: 1.4, ease: 'power2.inOut' },
            0.8,
          )
          .from('.hero__location .hero__pin', { autoAlpha: 0, y: -8, duration: 0.6 }, 1.5)
          .from('.hero__badge', { autoAlpha: 0, scale: 0.6, duration: 0.8, ease: 'back.out(1.6)' }, 1.2)
          .from('.hero__skills .hero__spark', { autoAlpha: 0, rotate: -90, scale: 0.4, stagger: 0.15, duration: 0.6 }, 1.4);

        addScramble(tl, '.hero__top .js-scramble', 0.6);
        addScramble(tl, '.hero__line-inner', 0.9, { gap: 0.25, speed: 0.07, min: 1.2 });
        addScramble(tl, '.hero__location .js-scramble', 1.5);
        addScramble(tl, '.hero__skills .js-scramble', 1.45, { gap: 0.15 });

        revealLines('.hero__bio, .hero__tagline p', 1.2);
      });
    },
    { scope: root },
  );

  return (
    <section className="hero" ref={root} aria-label="Introduction">
      <div className="hero__bg" style={{ '--bg-image': `url(${background})` }} aria-hidden="true" />

      <header className="hero__top">
        <p className="hero__role">
          <span className="hero__role-main js-scramble">{hero.role}</span>
          <span className="hero__role-sub js-scramble">{hero.roleSub}</span>
        </p>
        <p className="hero__status">
          <span className="js-scramble">{hero.availability}</span>
          <Sparkle className="hero__spark" />
        </p>
      </header>
      <div className="hero__rule" aria-hidden="true" />

      <div className="hero__stage" aria-hidden="true">
        <img className="hero__word" src={portfolioWord} alt="" />
        <img className="hero__portrait" src={portrait} alt="" fetchPriority="high" />
      </div>

      <div className="hero__intro">
        <p className="hero__hello">{hero.greeting}</p>
        <div className="hero__headings">
          <h1 className="hero__name" aria-label={hero.name}>
            <span className="hero__line hero__line--name">
              <span className="hero__line-inner">{hero.name}</span>
            </span>
          </h1>
          <p className="hero__title" aria-label={hero.title}>
            <span className="hero__line hero__line--title">
              <span className="hero__line-inner">{hero.title}</span>
            </span>
          </p>
        </div>
        <p className="hero__bio">{hero.bio}</p>
        <p className="hero__location">
          <Pin />
          <span className="js-scramble">{hero.location}</span>
        </p>
      </div>

      <aside className="hero__aside">
        <div className="hero__tagline">
          <span className="hero__badge">
            <Sparkle className="hero__badge-icon" />
          </span>
          <p>{hero.tagline}</p>
        </div>
        <ul className="hero__skills">
          {hero.skills.map((skill) => (
            <li key={skill}>
              <Sparkle className="hero__spark" />
              <span className="js-scramble">{skill}</span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
