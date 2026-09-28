import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { certifications } from '../data/certifications.js';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { useScrollLock } from '../lib/scrollLock.js';
import { animateAngledEdge } from '../lib/angledEdge.js';
import './Certifications.css';

function ArrowIcon({ className = '' }) {
  return (
    <svg className={`cert-arrow-svg ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

function VerifiedBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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

export default function Certifications() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const lineRef = useRef(null);
  const edgeClipRef = useRef(null);
  const edgeInnerRef = useRef(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [viewAll, setViewAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Maximum index for carousel (showing 3 cards on desktop)
  const maxIndex = Math.max(0, certifications.length - 3);

  // GSAP ScrollTrigger entrance & morph animations with side-flipped starting bar
  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;

      // SIDE FLIPPING STARTING BAR: right corner starts low and flattens as the section reaches the top
      animateAngledEdge({
        section: el,
        clip: edgeClipRef.current,
        inner: edgeInnerRef.current,
        lowSide: 'right',
      });

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

      // Animate certification cards staggered upward entrance
      gsap.fromTo(
        '.certifications__card',
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

  useScrollLock(Boolean(selectedCert));

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedCert(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="certifications" ref={rootRef} id="certifications" aria-label="Certifications & Credentials">
      {/* Lighter ambient background layers inside the skewed clip that forms the angled top edge */}
      <div className="angled-clip" ref={edgeClipRef} aria-hidden="true">
        <div className="angled-clip__inner" ref={edgeInnerRef}>
          <div className="certifications__bg">
            <div className="certifications__bg-glow certifications__bg-glow--top" />
            <div className="certifications__bg-glow certifications__bg-glow--bottom" />
            <div className="certifications__bg-pattern" />
          </div>
        </div>
        <div className="angled-clip__line certifications__angled-line" />
      </div>

      {/* Header following Projects section structure */}
      <div className="certifications__header-wrap">
        <div className="certifications__header">
          <h2 className="certifications__title">CERTIFICATIONS &amp; LICENSES</h2>
          <div className="certifications__line" ref={lineRef} aria-hidden="true" />
          <button
            type="button"
            className={`certifications__view-all ${viewAll ? 'is-active' : ''}`}
            onClick={() => setViewAll((v) => !v)}
            aria-label={viewAll ? 'Show 3 featured certificates' : 'View all certificates'}
          >
            <span>{viewAll ? 'SHOW FEATURED' : 'VIEW ALL CERTIFICATES'}</span>
            <ArrowIcon className="certifications__view-all-arrow" />
          </button>
        </div>

        {/* Carousel controls (visible when not in viewAll grid mode) */}
        {!viewAll && (
          <div className="certifications__nav-bar">
            <span className="certifications__counter">
              Showing <strong>{activeIndex + 1}–{Math.min(activeIndex + 3, certifications.length)}</strong> of {certifications.length}
            </span>
            <div className="certifications__nav-arrows">
              <button
                type="button"
                className="certifications__nav-btn"
                onClick={prevSlide}
                aria-label="Previous certificates"
                disabled={activeIndex === 0}
              >
                ←
              </button>
              <button
                type="button"
                className="certifications__nav-btn"
                onClick={nextSlide}
                aria-label="Next certificates"
                disabled={activeIndex >= maxIndex}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Certifications Showcase Container */}
      <div className={`certifications__container ${viewAll ? 'certifications__container--grid' : 'certifications__container--carousel'}`}>
        <div
          className="certifications__track"
          ref={trackRef}
          style={
            !viewAll
              ? {
                  transform: `translateX(-${activeIndex * (100 / 3)}%)`,
                }
              : undefined
          }
        >
          {certifications.map((cert) => (
            <article
              key={cert.id}
              className="certifications__card"
              onClick={() => setSelectedCert(cert)}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${cert.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCert(cert);
                }
              }}
            >
              {/* Mockup Frame (Matches project structure with clean light-theme styling) */}
              <div className="certifications__frame">
                <div className="certifications__frame-inner">
                  {/* Simulated browser header bar for editorial feel */}
                  <div className="certifications__frame-bar">
                    <div className="certifications__frame-dots">
                      <span className="dot dot--red" />
                      <span className="dot dot--yellow" />
                      <span className="dot dot--green" />
                    </div>
                    <span className="certifications__frame-url">
                      {cert.domain || 'credential.verify'}
                    </span>
                    <span className="certifications__badge">
                      <VerifiedBadgeIcon />
                      <span>Verified</span>
                    </span>
                  </div>

                  {/* Certificate preview stage with ambient background */}
                  <div className="certifications__preview-stage">
                    <img
                      src={cert.image}
                      alt={`${cert.title} credential`}
                      className="certifications__img"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="certifications__preview-overlay">
                      <span className="certifications__quick-view">Inspect Credential</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Info Bar: Red Number + Title/Issuer + Arrow */}
              <div className="certifications__info">
                <div className="certifications__meta-left">
                  <span className="certifications__number">{cert.id}</span>
                  <div className="certifications__titles">
                    <h3 className="certifications__card-title">{cert.title}</h3>
                    <span className="certifications__card-subtitle">
                      {cert.issuer} • {cert.date}
                    </span>
                  </div>
                </div>

                <div className="certifications__meta-right">
                  <span className="certifications__card-arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              </div>

              {/* Focus tags */}
              <div className="certifications__tags">
                {cert.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="certifications__tag">
                    {tag}
                  </span>
                ))}
                {cert.tags.length > 3 && (
                  <span className="certifications__tag certifications__tag--more">
                    +{cert.tags.length - 3}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Certificate Detail Modal — portaled to <body> so it isn't clipped by
          this section's clip-path / stacking context */}
      {selectedCert && createPortal(
        <div
          className="certifications__modal-backdrop"
          onClick={() => setSelectedCert(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-modal-title"
          data-lenis-prevent
        >
          <div
            className="certifications__modal"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <button
              type="button"
              className="certifications__modal-close"
              onClick={() => setSelectedCert(null)}
              aria-label="Close certificate modal"
            >
              <CloseIcon />
            </button>

            <div className="certifications__modal-header">
              <span className="certifications__modal-number">{selectedCert.id}</span>
              <div>
                <h3 id="cert-modal-title" className="certifications__modal-title">
                  {selectedCert.title}
                </h3>
                <p className="certifications__modal-subtitle">
                  {selectedCert.issuer} — Issued {selectedCert.date}
                </p>
              </div>
            </div>

            <div className="certifications__modal-preview">
              <img
                src={selectedCert.image}
                alt={selectedCert.title}
                className="certifications__modal-img"
                decoding="async"
              />
            </div>

            <div className="certifications__modal-body">
              <h4 className="certifications__modal-section-title">CREDENTIAL OVERVIEW</h4>
              <p className="certifications__modal-desc">{selectedCert.description}</p>

              <h4 className="certifications__modal-section-title">CORE COMPETENCIES &amp; SKILLS</h4>
              <div className="certifications__modal-tags">
                {selectedCert.tags.map((tag) => (
                  <span key={tag} className="certifications__modal-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="certifications__modal-actions">
                <a
                  href={selectedCert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="certifications__btn certifications__btn--primary"
                >
                  <span>
                    {selectedCert.link.startsWith('http')
                      ? 'Verify Official Credential'
                      : 'View High-Res Certificate'}
                  </span>
                  <ExternalIcon />
                </a>
                <button
                  type="button"
                  className="certifications__btn certifications__btn--secondary"
                  onClick={() => setSelectedCert(null)}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
