import { useRef, useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Hero from './sections/Hero.jsx';
import Projects from './sections/Projects.jsx';
import Certifications from './sections/Certifications.jsx';
import Contact from './sections/Contact.jsx';
import { gsap, ScrollTrigger, useGSAP } from './lib/gsap.js';

export default function App() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const certificationsRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    // Configure Lenis for a stable, uniform scroll speed across the site
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // Sync Lenis scroll events with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis RAF from GSAP's central ticker
    const tickerUpdate = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
    };
  }, []);

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
          scrub: 1,
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
      <div className="certifications-stack-wrapper" ref={certificationsRef}>
        <Certifications />
      </div>
      <div className="contact-stack-wrapper" ref={contactRef}>
        <Contact />
      </div>
    </div>
  );
}
