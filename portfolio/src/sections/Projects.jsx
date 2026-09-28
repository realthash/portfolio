import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { projects } from '../data/projects.js';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { useScrollLock } from '../lib/scrollLock.js';
import background from '../assets/background.webp';
import './Projects.css';

function ArrowIcon({ className = '' }) {
  return (
    <svg className={`proj-arrow-svg ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="14 6 20 12 14 18" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Projects() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const lineRef = useRef(null);
  const angledLineRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [themeOverrides, setThemeOverrides] = useState({});
  const [viewAll, setViewAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Maximum index for carousel (showing 3 cards on desktop)
  const maxIndex = Math.max(0, projects.length - 3);

  // GSAP ScrollTrigger entrance & morph animations
  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;

      // Stays fully angled until top reaches 20% from the viewport top; flattens between top 20% and top 0% (top top)
      const initialAngle = 120;
      const angleState = { y1: initialAngle };

      gsap.fromTo(
        el,
        {
          clipPath: `polygon(0% ${initialAngle}px, 100% 0px, 100% 100%, 0% 100%)`,
        },
        {
          clipPath: 'polygon(0% 0px, 100% 0px, 100% 100%, 0% 100%)',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 20%', // Angled until top reaches 20%
            end: 'top top',   // Flat beyond this point
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        angleState,
        { y1: initialAngle },
        {
          y1: 0,
          ease: 'none',
          onUpdate: () => {
            if (angledLineRef.current) {
              angledLineRef.current.setAttribute('y1', angleState.y1);
            }
          },
          scrollTrigger: {
            trigger: el,
            start: 'top 20%',
            end: 'top top',
            scrub: 1,
          },
        },
      );

      // Animate horizontal dividing line expanding
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }

      // Animate project cards staggered upward entrance
      gsap.fromTo(
        '.projects__card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    },
    { scope: rootRef, dependencies: [viewAll] },
  );

  useScrollLock(Boolean(selectedProject));

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = (e, projId) => {
    e.stopPropagation();
    setThemeOverrides((prev) => ({
      ...prev,
      [projId]: prev[projId] === 'dark' ? 'light' : 'dark',
    }));
  };

  const getCurrentImage = (proj) => {
    if (typeof proj.image === 'string') return proj.image;
    const currentMode = themeOverrides[proj.id] || proj.theme || 'dark';
    return proj.image[currentMode] || proj.image.dark || proj.image.light;
  };

  const hasMultipleThemes = (proj) => typeof proj.image === 'object' && proj.image.light && proj.image.dark;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="projects" ref={rootRef} id="projects" aria-label="Selected Projects">
      {/* Background layer using background.webp */}
      <div className="projects__bg" style={{ '--bg-image': `url(${background})` }} aria-hidden="true" />

      {/* Angled top hairline border */}
      <div className="projects__angled-border" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="projects__angled-svg">
          <line ref={angledLineRef} x1="0" y1="120" x2="1200" y2="0" stroke="url(#projAngledGrad)" strokeWidth="1.5" />
          <defs>
            <linearGradient id="projAngledGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e0141e" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#e0141e" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header matching user image reference */}
      <div className="projects__header-wrap">
        <div className="projects__header">
          <h2 className="projects__title">SELECTED PROJECTS</h2>
          <div className="projects__line" ref={lineRef} aria-hidden="true" />
          <button
            type="button"
            className={`projects__view-all ${viewAll ? 'is-active' : ''}`}
            onClick={() => setViewAll((v) => !v)}
            aria-label={viewAll ? 'Show 3 featured projects' : 'View all projects'}
          >
            <span>{viewAll ? 'SHOW FEATURED' : 'VIEW ALL PROJECTS'}</span>
            <ArrowIcon className="projects__view-all-arrow" />
          </button>
        </div>

        {/* Carousel controls (visible when not in viewAll grid mode) */}
        {!viewAll && (
          <div className="projects__nav-bar">
            <span className="projects__counter">
              Showing <strong>{activeIndex + 1}–{Math.min(activeIndex + 3, projects.length)}</strong> of {projects.length}
            </span>
            <div className="projects__nav-arrows">
              <button
                type="button"
                className="projects__nav-btn"
                onClick={prevSlide}
                aria-label="Previous projects"
                disabled={activeIndex === 0}
              >
                ←
              </button>
              <button
                type="button"
                className="projects__nav-btn"
                onClick={nextSlide}
                aria-label="Next projects"
                disabled={activeIndex >= maxIndex}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Projects Showcase Container */}
      <div className={`projects__container ${viewAll ? 'projects__container--grid' : 'projects__container--carousel'}`}>
        <div
          className="projects__track"
          ref={trackRef}
          style={
            !viewAll
              ? {
                  transform: `translateX(-${activeIndex * (100 / 3)}%)`,
                }
              : undefined
          }
        >
          {projects.map((proj) => {
            const imgSrc = getCurrentImage(proj);
            const isDarkCard = proj.theme === 'dark' || themeOverrides[proj.id] === 'dark';

            return (
              <article
                key={proj.id}
                className={`projects__card ${isDarkCard ? 'projects__card--dark' : 'projects__card--light'}`}
                onClick={() => setSelectedProject(proj)}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${proj.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProject(proj);
                  }
                }}
              >
                {/* Visual Viewport Frame (Matches screenshot mockup presentation) */}
                <div className="projects__frame">
                  <div className="projects__frame-inner">
                    {/* Simulated browser header bar for editorial feel */}
                    <div className="projects__frame-bar">
                      <div className="projects__frame-dots">
                        <span className="dot dot--red" />
                        <span className="dot dot--yellow" />
                        <span className="dot dot--green" />
                      </div>
                      <span className="projects__frame-url">{proj.title.toLowerCase().replace(/\s+/g, '-')}.app</span>
                      {hasMultipleThemes(proj) && (
                        <button
                          type="button"
                          className="projects__theme-toggle"
                          onClick={(e) => toggleTheme(e, proj.id)}
                          title="Toggle dark/light preview"
                          aria-label="Toggle preview theme"
                        >
                          {themeOverrides[proj.id] === 'light' ? '🌙 Dark' : '☀️ Light'}
                        </button>
                      )}
                    </div>

                    {/* Image display with ambient background */}
                    <div className="projects__preview-stage">
                      <img
                        src={imgSrc}
                        alt={`${proj.title} preview`}
                        className={`projects__img ${imgSrc.endsWith('.svg') ? 'projects__img--contain' : 'projects__img--cover'}`}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="projects__preview-overlay">
                        <span className="projects__quick-view">Quick View</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Info Bar: Red Number + Title/Category + Arrow (Exact match to image) */}
                <div className="projects__info">
                  <div className="projects__meta-left">
                    <span className="projects__number">{proj.id}</span>
                    <div className="projects__titles">
                      <h3 className="projects__card-title">{proj.title}</h3>
                      <span className="projects__card-subtitle">{proj.subtitle}</span>
                    </div>
                  </div>

                  <div className="projects__meta-right">
                    <span className="projects__card-arrow" aria-hidden="true">
                      →
                    </span>
                  </div>
                </div>

                {/* Tech Pills (Minimalist tags matching clean design) */}
                <div className="projects__tags">
                  {proj.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="projects__tag">
                      {tag}
                    </span>
                  ))}
                  {proj.tags.length > 3 && (
                    <span className="projects__tag projects__tag--more">+{proj.tags.length - 3}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Project Detail Modal — portaled to <body> so it isn't trapped under
          later sections by this section's stacking context and clip-path */}
      {selectedProject && createPortal(
        <div
          className="projects__modal-backdrop"
          onClick={() => setSelectedProject(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          data-lenis-prevent
        >
          <div
            className="projects__modal"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <button
              type="button"
              className="projects__modal-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project modal"
            >
              <CloseIcon />
            </button>

            <div className="projects__modal-header">
              <span className="projects__modal-number">{selectedProject.id}</span>
              <div>
                <h3 id="modal-title" className="projects__modal-title">{selectedProject.title}</h3>
                <p className="projects__modal-subtitle">{selectedProject.subtitle}</p>
              </div>
            </div>

            <div className="projects__modal-preview">
              <img
                src={getCurrentImage(selectedProject)}
                alt={selectedProject.title}
                className="projects__modal-img"
                decoding="async"
              />
            </div>

            <div className="projects__modal-body">
              <h4 className="projects__modal-section-title">OVERVIEW</h4>
              <p className="projects__modal-desc">{selectedProject.description}</p>

              <h4 className="projects__modal-section-title">TECHNOLOGIES &amp; TOOLS</h4>
              <div className="projects__modal-tags">
                {selectedProject.tags.map((tag) => (
                  <span key={tag} className="projects__modal-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="projects__modal-actions">
                {selectedProject.liveUrl && selectedProject.liveUrl !== '#' && (
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="projects__btn projects__btn--primary"
                  >
                    <span>Launch Live App</span>
                    <ExternalIcon />
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="projects__btn projects__btn--secondary"
                  >
                    <GithubIcon />
                    <span>View Repository</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
