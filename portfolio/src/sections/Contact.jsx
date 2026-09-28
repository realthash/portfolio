import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { contact } from '../data/content.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import background from '../assets/background.webp';
import './Contact.css';

// Reusable character stagger text component
function CharStaggerText({
  text,
  as: Component = 'span',
  className = '',
  charClassName = '',
  style,
  ...props
}) {
  if (text == null) return null;
  const str = String(text);
  const words = str.split(' ');

  return (
    <Component className={`char-stagger-root ${className}`} style={style} aria-label={str} {...props}>
      {words.map((word, wIdx) => (
        <span key={wIdx} className="char-stagger-word">
          {word.split('').map((char, cIdx) => (
            <span key={cIdx} className="char-stagger-mask">
              <span className={`char-stagger-char ${charClassName}`}>{char}</span>
            </span>
          ))}
          {wIdx < words.length - 1 && (
            <span className="char-stagger-mask char-stagger-space" aria-hidden="true">
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </Component>
  );
}

function ArrowUpRight({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function CheckIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function Contact() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const formCardRef = useRef(null);
  const infoRef = useRef(null);
  const angledLineRef = useRef(null);
  const lineRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const activeEmail = contact.email;
  const activePhone = contact.phone;
  const activeAddress = contact.address;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      // Never fake a success: keep the visitor's message and point them to direct email instead
      console.error('EmailJS is not configured: set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY.');
      setSubmitting(false);
      setStatusMessage({
        type: 'error',
        text: 'The contact form is unavailable right now. Please email directly at ' + activeEmail
      });
      return;
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: form.name,
          from_email: form.email,
          reply_to: form.email,
          company: form.company,
          message: form.message,
          to_email: activeEmail,
        },
        {
          publicKey,
          // Client-side throttle: one message per 10s from this browser to deter accidental double sends / spam
          limitRate: { id: 'contact-form', throttle: 10000 },
        }
      );

      setSubmitting(false);
      setSubmitted(true);
      setStatusMessage({ type: 'success', text: 'Message sent successfully! I will get back to you soon.' });
      setForm({ name: '', email: '', company: '', message: '' });
      setTimeout(() => {
        setSubmitted(false);
        setStatusMessage({ type: '', text: '' });
      }, 6000);
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubmitting(false);
      setStatusMessage({
        type: 'error',
        text: error?.status === 429
          ? 'Please wait a few seconds before sending another message.'
          : 'Failed to send message. Please email directly at ' + activeEmail
      });
    }
  };

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(activeEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;

      // 1. Morphing top angled cut: matching Projects and Certifications chevron rhythm
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
            start: 'top 20%',
            end: 'top top',
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

      // Animate horizontal dividing line expanding matching Projects and Certifications
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

      // 2. ENTRANCE ANIMATION: CHAR STAGGER RISE ON EVERY TEXT IN CONTACT SECTION
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // A) Header Bar Text Characters
        const headerChars = el.querySelectorAll('.contact__header .char-stagger-char');
        if (headerChars.length > 0) {
          gsap.fromTo(
            headerChars,
            { yPercent: 125, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.018,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }

        // B) Centerpiece Title "Let's Talk" Characters
        const titleChars = el.querySelectorAll('.contact__title .char-stagger-char');
        if (titleChars.length > 0) {
          gsap.fromTo(
            titleChars,
            {
              yPercent: 130,
              opacity: 0,
              rotateX: -30,
            },
            {
              yPercent: 0,
              opacity: 1,
              rotateX: 0,
              duration: 0.9,
              stagger: 0.045,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: titleRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }

        // C) Form Card Entrance (container) + Label & Button Characters
        if (formCardRef.current) {
          gsap.fromTo(
            formCardRef.current,
            { y: 50, opacity: 0, scale: 0.98 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: formCardRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }

        const formChars = el.querySelectorAll('.contact__form .char-stagger-char');
        if (formChars.length > 0) {
          gsap.fromTo(
            formChars,
            { yPercent: 120, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.012,
              ease: 'power3.out',
              delay: 0.15,
              scrollTrigger: {
                trigger: formCardRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }

        // D) Right Column Contact Details (Phone, Email, Address, Hours, Socials) Characters
        const infoChars = el.querySelectorAll('.contact__info-col .char-stagger-char');
        if (infoChars.length > 0) {
          gsap.fromTo(
            infoChars,
            { yPercent: 120, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.012,
              ease: 'power3.out',
              delay: 0.2,
              scrollTrigger: {
                trigger: infoRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }

        // E) Footer Text Characters
        const footerChars = el.querySelectorAll('.contact__footer .char-stagger-char');
        if (footerChars.length > 0) {
          gsap.fromTo(
            footerChars,
            { yPercent: 120, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.01,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: '.contact__footer',
                start: 'top 95%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }
      });
    },
    { scope: rootRef },
  );

  const headingText = contact.heading || "Let's Talk";

  return (
    <section className="contact" ref={rootRef} id="contact" aria-label="Contact Section">
      {/* Background with background.webp */}
      <div
        className="contact__bg"
        style={{ '--bg-image': `url(${background})` }}
        aria-hidden="true"
      >
        <div className="contact__bg-glow contact__bg-glow--top" />
        <div className="contact__bg-glow contact__bg-glow--card" />
        <div className="contact__bg-pattern" />
      </div>

      {/* Angled decorative hairline along top cut */}
      <div className="contact__angled-border" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="contact__angled-svg">
          <line
            ref={angledLineRef}
            x1="0"
            y1="120"
            x2="1200"
            y2="0"
            stroke="url(#contactAngledGrad)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="contactAngledGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e0141e" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#e0141e" stopOpacity="0.4" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.2)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#e0141e" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="contact__wrapper">
        {/* Header matching Projects & Certifications structure */}
        <div className="contact__header-wrap">
          <div className="contact__header">
            <CharStaggerText as="h2" className="contact__header-title" text="CONTACT & REACH OUT" />
            <div className="contact__line" ref={lineRef} aria-hidden="true" />
            <span className="contact__header-status">
              <span className="contact__status-pulse" aria-hidden="true" />
              <CharStaggerText text="AVAILABLE FOR WORK" />
            </span>
          </div>
        </div>

        {/* Section Heading with Char Stagger Rise Animation */}
        <div className="contact__heading-wrap" ref={titleRef}>
          <CharStaggerText as="h3" className="contact__title" text={headingText} />
        </div>

        {/* 2-Column Content Grid */}
        <div className="contact__grid">
          {/* Left Column: Form Card matching reference image */}
          <div className="contact__card-col" ref={formCardRef}>
            <div className="contact__card">
              <form className="contact__form" onSubmit={handleSubmit}>
                {/* Field 1: Your Name */}
                <div className="contact__form-group">
                  <label htmlFor="contact-name" className="contact__label">
                    <CharStaggerText text="Your Name" />
                    <span className="contact__required char-stagger-mask" aria-hidden="true">
                      <span className="char-stagger-char">*</span>
                    </span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your first name"
                    value={form.name}
                    onChange={handleChange}
                    className="contact__input"
                  />
                </div>

                {/* Field 2: Email Address */}
                <div className="contact__form-group">
                  <label htmlFor="contact-email" className="contact__label">
                    <CharStaggerText text="Email Address" />
                    <span className="contact__required char-stagger-mask" aria-hidden="true">
                      <span className="char-stagger-char">*</span>
                    </span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    placeholder="Email@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    className="contact__input"
                  />
                </div>

                {/* Field 3: Company */}
                <div className="contact__form-group">
                  <label htmlFor="contact-company" className="contact__label">
                    <CharStaggerText text="Company" />
                    <span className="contact__required char-stagger-mask" aria-hidden="true">
                      <span className="char-stagger-char">*</span>
                    </span>
                  </label>
                  <input
                    id="contact-company"
                    name="company"
                    type="text"
                    required
                    placeholder="Add a subject"
                    value={form.company}
                    onChange={handleChange}
                    className="contact__input"
                  />
                </div>

                {/* Field 4: Message */}
                <div className="contact__form-group">
                  <label htmlFor="contact-message" className="contact__label">
                    <CharStaggerText text="Message" />
                    <span className="contact__required char-stagger-mask" aria-hidden="true">
                      <span className="char-stagger-char">*</span>
                    </span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="5"
                    required
                    placeholder="Write your message"
                    value={form.message}
                    onChange={handleChange}
                    className="contact__textarea"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`contact__submit-btn ${submitting ? 'is-loading' : ''} ${submitted ? 'is-success' : ''}`}
                >
                  {submitting ? (
                    <span className="contact__spinner" />
                  ) : submitted ? (
                    <span className="contact__submit-success">
                      <CheckIcon /> <CharStaggerText text="Message Sent!" />
                    </span>
                  ) : (
                    <CharStaggerText text="Send Message" />
                  )}
                </button>

                {/* Status or Alert feedback message */}
                {statusMessage.text && (
                  <div
                    className={`contact__status-alert contact__status-alert--${statusMessage.type}`}
                    role="alert"
                  >
                    {statusMessage.text}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column: Contact Details matching reference image */}
          <div className="contact__info-col" ref={infoRef}>
            {/* Top Info Block: Phone & Bold Accent Email */}
            <div className="contact__info-block contact__info-stagger">
              <a href={`tel:${activePhone.replace(/\s+/g, '')}`} className="contact__phone">
                <CharStaggerText text={activePhone} />
              </a>
              <div className="contact__email-row">
                <a href={`mailto:${activeEmail}`} className="contact__email" title="Send an email">
                  <CharStaggerText text={activeEmail} />
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="contact__copy-btn"
                  title="Copy email to clipboard"
                  aria-label="Copy email"
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  <span className="contact__copy-text">
                    <CharStaggerText text={copied ? 'Copied!' : 'Copy'} />
                  </span>
                </button>
              </div>
            </div>

            {/* Middle Info Block: Address & Office Hours */}
            <div className="contact__meta-block contact__info-stagger">
              <div className="contact__meta-item">
                <CharStaggerText
                  as="h3"
                  className="contact__meta-title"
                  text={contact.addressTitle || 'Address'}
                />
                <CharStaggerText as="p" className="contact__meta-desc" text={activeAddress} />
              </div>

              <div className="contact__meta-item">
                <CharStaggerText
                  as="h3"
                  className="contact__meta-title"
                  text={contact.officeHoursTitle || 'Office Hours'}
                />
                <CharStaggerText as="p" className="contact__meta-desc" text={contact.officeHours} />
              </div>
            </div>

            {/* Bottom Info Block: Social Links with glide diagonal arrows */}
            <div className="contact__socials-block contact__info-stagger">
              <nav aria-label="Social media profiles" className="contact__socials-list">
                {contact.socials.map((item) => (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact__social-link"
                  >
                    <CharStaggerText className="contact__social-name" text={item.label} />
                    <ArrowUpRight className="contact__social-arrow" />
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Footer */}
        <footer className="contact__footer">
          <CharStaggerText
            as="p"
            text={`© ${new Date().getFullYear()} Thashmika Rathnayake. All rights reserved.`}
          />
        </footer>
      </div>
    </section>
  );
}
