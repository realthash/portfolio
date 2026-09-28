import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
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
          .from('.hero__top > *, .hero__rule', { autoAlpha: 0, y: -14, stagger: 0.08, duration: 0.8 }, 0.6)
          .from('.hero__hello', { autoAlpha: 0, x: -24, duration: 0.9 }, 0.8)
          .from('.hero__line-inner', { yPercent: 110, stagger: 0.12, duration: 1 }, 0.85)
          .from('.hero__bio, .hero__location', { autoAlpha: 0, y: 18, stagger: 0.1, duration: 0.9 }, 1.1)
          .from('.hero__aside > *', { autoAlpha: 0, x: 24, stagger: 0.1, duration: 0.9 }, 1.1);
      });
    },
    { scope: root },
  );

  return (
    <section className="hero" ref={root} aria-label="Introduction">
      <div className="hero__bg" style={{ '--bg-image': `url(${background})` }} aria-hidden="true" />

      <header className="hero__top">
        <p className="hero__role">
          <span className="hero__role-main">{hero.role}</span>
          <span className="hero__role-sub">{hero.roleSub}</span>
        </p>
        <p className="hero__status">
          {hero.availability}
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
        <h1 className="hero__name">
          <span className="hero__line">
            <span className="hero__line-inner">{hero.name}</span>
          </span>
          <span className="hero__line">
            <span className="hero__line-inner">{hero.title}</span>
          </span>
        </h1>
        <p className="hero__bio">{hero.bio}</p>
        <p className="hero__location">
          <Pin />
          {hero.location}
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
              {skill}
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
