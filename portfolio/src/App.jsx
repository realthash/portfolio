import { useRef } from 'react';
import Hero from './sections/Hero.jsx';
import Projects from './sections/Projects.jsx';
import { gsap, ScrollTrigger, useGSAP } from './lib/gsap.js';

export default function App() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const projectsRef = useRef(null);

  useGSAP(
    () => {
      // Smooth depth parallax on pinned hero as projects section slides over it
      gsap.to(heroRef.current, {
        scale: 1,
        opacity: 0.3,
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: projectsRef.current,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <div className="app-container" ref={containerRef}>
      <div className="hero-pin-wrapper" ref={heroRef}>
        <Hero />
      </div>
      <div className="projects-stack-wrapper" ref={projectsRef}>
        <Projects />
      </div>
    </div>
  );
}
