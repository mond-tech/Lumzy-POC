"use client";
 
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import imagesLoaded from "imagesloaded";
import Splitting from "splitting";
import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";
 
// ─── Character scramble pool ──────────────────────────────────────────────────
const lettersAndSymbols = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m',
  'n','o','p','q','r','s','t','u','v','w','x','y','z',
  '!','@','#','$','%','^','&','*','-','_','+','=',';',':','<','>',','
];
 
// ─── Types ────────────────────────────────────────────────────────────────────
export interface CaseStudy {
  title: string;
  desc:  string;
  date:  string;
  src:   string;
  link:  string;
}
 
// ─── Clip animation config (one per row of 3 cards) ──────────────────────────
const SETTINGS = [
  { orientation: 'vertical',   slicesTotal: 5,  animation: { duration: 0.5, ease: 'power3.inOut' } },
  { orientation: 'vertical',   slicesTotal: 15, animation: { duration: 0.5, ease: 'power3.inOut' } },
  { orientation: 'horizontal', slicesTotal: 5,  animation: { duration: 0.6, ease: 'expo.inOut'   } },
  { orientation: 'horizontal', slicesTotal: 15, animation: { duration: 0.6, ease: 'expo.inOut'   } },
];
 
// ─── shuffleChars ─────────────────────────────────────────────────────────────
function shuffleChars(chars: Element[]) {
  chars.forEach(char => {
    const el = char as HTMLElement;
    gsap.killTweensOf(el);
    gsap.fromTo(el,
      { opacity: 0 },
      {
        duration: 0.03,
        innerHTML: () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)],
        repeat: 3,
        repeatRefresh: true,
        opacity: 1,
        repeatDelay: 0.05,
        onComplete: () => { gsap.set(el, { innerHTML: el.dataset.initial, delay: 0.03 }); },
      }
    );
  });
}
 
// ─── Single card ──────────────────────────────────────────────────────────────
const ProjectCard = ({ project, index }: { project: CaseStudy; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef  = useRef<HTMLDivElement>(null);
 
  const settings = SETTINGS[Math.floor(index / 3) % SETTINGS.length];
 
  useEffect(() => {
    if (!cardRef.current || !imgRef.current) return;
 
    const card   = cardRef.current;
    const imgEl  = imgRef.current;
    const isVert = settings.orientation === 'vertical';
    const axis   = isVert ? 'yPercent' : 'xPercent';
 
    // ── Splitting ────────────────────────────────────────────────────────────
    Splitting({ target: card });
    const chars = {
      date:  [...card.querySelectorAll('.card__date  .char')] as HTMLElement[],
      title: [...card.querySelectorAll('.card__title .char')] as HTMLElement[],
      link:  [...card.querySelectorAll('.card__link  .char')] as HTMLElement[],
    };
    [...chars.date, ...chars.title, ...chars.link].forEach(el => {
      el.dataset.initial = el.innerHTML;
    });
 
    // ── Build image slices ───────────────────────────────────────────────────
    const wrap = document.createElement('div');
    wrap.className = 'card__img-wrap';
    const slices: HTMLDivElement[] = [];
    for (let i = 0; i < settings.slicesTotal; i++) {
      const s = document.createElement('div');
      s.className = 'card__img-inner';
      s.style.backgroundImage = `url(${project.src})`;
      wrap.appendChild(s);
      slices.push(s);
    }
    imgEl.appendChild(wrap);
    imgEl.style.setProperty(isVert ? '--columns' : '--rows', String(settings.slicesTotal));
 
    // ── Clip-paths ───────────────────────────────────────────────────────────
    slices.forEach((slice, pos) => {
      const a1 = pos * 100 / settings.slicesTotal;
      const b1 = a1 + 100 / settings.slicesTotal;
      gsap.set(slice, {
        clipPath: isVert
          ? `polygon(${a1}% 0%, ${b1}% 0%, ${b1}% 100%, ${a1}% 100%)`
          : `polygon(0% ${a1}%, 100% ${a1}%, 100% ${b1}%, 0% ${b1}%)`,
        [isVert ? 'left' : 'top']: pos * -1,
        inset: 0,
      });
    });
 
    // ── DOM refs for GSAP color tweens ───────────────────────────────────────
    const DOM = {
      title: card.querySelector('.card__title'),
      desc:  card.querySelector('.card__desc'),
      date:  card.querySelector('.card__date'),
      index: card.querySelector('.card__index'),
      link:  card.querySelector('.card__link'),
    };
 
    // ── Hover enter ──────────────────────────────────────────────────────────
    const onEnter = () => {
      shuffleChars(chars.date);
      shuffleChars(chars.title);
      shuffleChars(chars.link);
 
      gsap.timeline({ defaults: { duration: settings.animation.duration, ease: settings.animation.ease } })
        .addLabel('start', 0)
        .fromTo(imgEl,  { [axis]: 100, opacity: 0 }, { [axis]: 0, opacity: 1 }, 'start')
        .fromTo(wrap,   { [axis]: -100 },             { [axis]: 0 },             'start')
        .fromTo(slices, {
          [axis]: (pos: number) => pos % 2 ? gsap.utils.random(-75, -25) : gsap.utils.random(25, 75)
        }, { [axis]: 0 }, 'start')
        .to(DOM.title, { color: 'var(--gsap-text-title-hover)', textShadow: 'var(--gsap-text-title-shadow)', duration: 0.3 }, 'start+=0.1')
        .to(DOM.desc,  { color: 'var(--gsap-text-desc-hover)',  duration: 0.3 }, 'start+=0.1')
        .to(DOM.date,  { color: 'var(--gsap-text-date-hover)',  duration: 0.3 }, 'start+=0.1')
        .to(DOM.index, { color: 'var(--gsap-text-index-hover)', textShadow: 'var(--gsap-text-index-shadow)', duration: 0.3 }, 'start+=0.1')
        .to(DOM.link,  { color: 'var(--gsap-text-link-hover)',  duration: 0.3 }, 'start+=0.1')
    };
 
    // ── Hover leave ──────────────────────────────────────────────────────────
    const onLeave = () => {
      gsap.timeline({ defaults: { duration: settings.animation.duration, ease: settings.animation.ease } })
        .addLabel('start', 0)
        .to(imgEl,  { [axis]: 100, opacity: 0 }, 'start')
        .to(wrap,   { [axis]: -100 },             'start')
        .to(slices, {
          [axis]: (pos: number) => pos % 2 ? gsap.utils.random(-75, 25) : gsap.utils.random(25, 75)
        }, 'start')
        .to(DOM.title, { color: 'var(--text-default)',          textShadow: 'none', duration: 0.3 }, 'start')
        .to(DOM.desc,  { color: 'var(--text-muted)',            duration: 0.3 }, 'start')
        .to(DOM.date,  { color: 'var(--text-muted)',            duration: 0.3 }, 'start')
        .to(DOM.index, { color: 'var(--text-accent-secondary)', textShadow: 'none', duration: 0.3 }, 'start')
        .to(DOM.link,  { color: 'var(--text-accent)',           duration: 0.3 }, 'start')
    };
 
    gsap.set(imgEl, { opacity: 0 });
    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
 
    return () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
      wrap.remove();
    };
  }, [project, settings]);
 
  return (
    <article className="card" ref={cardRef}>
      <div className="card__img" ref={imgRef} />
 
      <div className="card__content">
        <div className="card__header">
          <span className="card__index">{(index + 1).toString().padStart(2, '0')}</span>
          <span className="card__date" data-splitting>{project.date}</span>
        </div>
 
        <h3 className="card__title" data-splitting>{project.title}</h3>
        <p className="card__desc">{project.desc}</p>
 
        <div className="card__footer">
          <a href={project.link} className="card__link">
            <span data-splitting>Read More</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
};
 
// ─── Grid wrapper ──────────────────────────────────────────────────────────────
interface ClipHoverGridProps {
  projects: CaseStudy[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
}
 
export default function ClipHoverGrid({ projects, header, footer }: ClipHoverGridProps) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const overlayRef      = useRef<HTMLDivElement>(null);
  const [theme, setTheme]               = useState<'light' | 'dark'>('dark');
  const [isTransitioning, setTransitioning] = useState(false);
 
  useEffect(() => {
    if (!containerRef.current) return;
    imagesLoaded(containerRef.current, { background: true }, () => {
      document.body.classList.remove('loading');
    });
  }, []);
 
  const switchTheme = (next: 'light' | 'dark') => {
    if (next === theme || isTransitioning) return;
    setTransitioning(true);
 
    const overlay = overlayRef.current;
    if (!overlay) { setTheme(next); setTransitioning(false); return; }
 
    // Phase 1: fade overlay in
    overlay.style.opacity = '1';
 
    setTimeout(() => {
      // Phase 2: swap theme while hidden
      setTheme(next);
 
      setTimeout(() => {
        // Phase 3: fade overlay back out
        overlay.style.opacity = '0';
        setTimeout(() => setTransitioning(false), 350);
      }, 60);
    }, 300);
  };
 
  return (
    <div className="clip-hover-wrapper" data-theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
 
      {/* ── Crossfade overlay (covers gradient snap) ── */}
      <div className="theme-overlay" ref={overlayRef} />
 
      {/* ── Theme Toggle ── */}
      <div className="theme-toggle">
        <button
          className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
          onClick={() => switchTheme('light')}
          disabled={isTransitioning}
        >
          Opal
        </button>
        <button
          className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => switchTheme('dark')}
          disabled={isTransitioning}
        >
          Midnight
        </button>
      </div>
 
      <div className="page-layout">
        {header}
        <section className="card-grid" ref={containerRef}>
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </section>
        {footer}
      </div>
    </div>
  );
}
 
// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,700&family=Jost:wght@300;400&family=Space+Grotesk:wght@700&family=IBM+Plex+Sans:wght@400;500&family=JetBrains+Mono:wght@400;700&display=swap%27);
 
/* Pre-connect for faster font loading */
/* Both font stacks are loaded immediately so theme switch doesn't trigger fresh fetches */
 
 
/* Slowed down for an 'ambient' look */
 
@keyframes meshGrad {
  0%   { background-position: 0%   50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0%   50%; }
}
 
@keyframes liquidGlass {
  0%   { background-position: 0%   0%;   }
  50%  { background-position: 100% 100%; }
  100% { background-position: 0%   0%;   }
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
 
/* ── Opal (Light) ── */
.clip-hover-wrapper[data-theme='light'] {
  /* Backgrounds */
  --bg-grad:        linear-gradient(-45deg, #F8F9FA, #FFF5F5, #F0F9FF, #F5F3FF, #F8F9FA);
  --card-bg:        linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(240, 249, 255, 0.4) 35%, rgba(245, 243, 255, 0.2) 70%, rgba(255, 255, 255, 0.65) 100%);
  --card-shadow-idle:  inset 0 1px 1.5px rgba(255,255,255,0.9), inset 0 -20px 50px rgba(255,255,255,0.4),  0 10px 30px -10px rgba(0,0,0,0.03);
  --card-shadow-hover:
    inset 0 0 8px 1px rgba(139,92,246,0.5),
    inset 0 0 25px 3px rgba(99,102,241,0.2),
    inset 0 0 50px 5px rgba(139,92,246,0.1),
    0 15px 45px -10px rgba(0,0,0,0.08);
  --img-overlay:    linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 80%);
  --img-glow:       radial-gradient(circle at center, rgba(99,102,241,0.35), transparent 85%);
  --glow-blur: 18px;
 
  /* Text */
  --text-default:          #1D1D1F;
  --text-muted:            #64748B;
  --text-accent:           #6366f1;
  --text-accent-secondary: #818cf8;
  --line-color:            #e2e8f0;
 
  /* GSAP hover overrides */
  --gsap-text-title-hover: #ffffff;
  --gsap-text-title-shadow: none;
  --gsap-text-desc-hover:  rgb(226,232,240);
  --gsap-text-date-hover:  rgb(203,213,225);
  --gsap-text-index-hover: #c7d2fe;
  --gsap-text-index-shadow: none;
  --gsap-text-link-hover:  #ffffff;
  --gsap-line-hover:       rgba(255,255,255,0.3);
 
  /* Border glow opacity */
  --glow-opacity-idle:  0.6;
  --glow-opacity-hover: 0.85;
  --glow-blur: 14px;
 
  /* Typography — Cormorant Garamond Bold Italic (H1) + Jost Light (body) */
  --heading-font:      'Cormorant Garamond', Georgia, serif;
  --heading-weight:    700;
  --heading-style:     italic;
  --heading-condensed: normal;
  --body-font:         'Jost', 'Inter', sans-serif;
  --body-weight:       300;
  --body-condensed:    normal;
  --body-ls:           normal;
 
  /* Toggle pill */
  --toggle-bg:           rgba(255,255,255,0.6);
  --toggle-border:       rgba(0,0,0,0.05);
  --toggle-text:         #1d1d1f;
  --toggle-active-bg:    #fff;
  --toggle-active-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
 
/* ── Midnight (Dark) ── */
.clip-hover-wrapper[data-theme='dark'] {
  /* Backgrounds */
  --bg-grad:        linear-gradient(-35deg, #04060b, #0B0F19, #080C14, #0B0F19, #04060b);
  --card-bg:        linear-gradient(135deg, rgba(8,10,15,0.85) 0%, rgba(12,15,22,0.45) 35%, rgba(6,182,212,0.05) 75%, rgba(8,10,15,0.7) 100%);
  --card-shadow-idle:  inset 0 1px 1px rgba(255,255,255,0.08), inset 0 -20px 50px rgba(0,0,0,0.8),  0 10px 40px -10px rgba(0,0,0,0.6);
  --card-shadow-hover:
    inset 0 0 10px 1px rgba(6,182,212,0.8),
    inset 0 0 30px 2px rgba(6,182,212,0.4),
    inset 0 0 60px 5px rgba(6,182,212,0.2),
    0 25px 70px rgba(0,0,0,0.9);
  --img-overlay:    linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 80%);
  --img-glow:       radial-gradient(circle at center, rgba(6,182,212,0.45), transparent 90%);
  --glow-blur: 24px;
 
  /* Text */
  --text-default:          #ffffff;
  --text-muted:            #94a3b8;
  --text-accent:           #38bdf8;
  --text-accent-secondary: #38bdf8;
  --line-color:            #334155;
 
  /* GSAP hover overrides */
  --gsap-text-title-hover: #ffffff;
  --gsap-text-title-shadow: 0 0 15px rgba(255,255,255,0.3);
  --gsap-text-desc-hover:  rgb(226,232,240);
  --gsap-text-date-hover:  rgb(203,213,225);
  --gsap-text-index-hover: #06b6d4;
  --gsap-text-index-shadow: 0 0 10px rgba(6,182,212,0.5);
  --gsap-text-link-hover:  #22d3ee;
  --gsap-line-hover:       #06b6d4;
 
  /* Border glow opacity */
  --glow-opacity-idle:  0.8;
  --glow-opacity-hover: 1;
 
  /* Typography — Space Grotesk Bold (H1) + IBM Plex Sans (body) */
  --heading-font:      'Space Grotesk', 'Inter', sans-serif;
  --heading-weight:    700;
  --heading-style:     normal;
  --heading-condensed: normal;
  --body-font:         'IBM Plex Sans', 'Inter', sans-serif;
  --body-weight:       400;
  --body-condensed:    normal;
  --body-ls:           0.01em;
 
  /* Toggle pill */
  --toggle-bg:           rgba(8,10,15,0.65);
  --toggle-border:       rgba(255,255,255,0.08);
  --toggle-text:         #94a3b8;
  --toggle-active-bg:    #0f131a;
  --toggle-active-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   WRAPPER
───────────────────────────────────────────────────────────────────────────── */
.clip-hover-wrapper {
  min-height: 100vh;
  color: var(--text-default);
  font-family: 'Inter', sans-serif;
  padding: 4vw 6vw;
  background: var(--bg-grad);
  background-size: 300% 300%;
  animation: meshGrad 18s ease infinite;
  transition: background 0.8s ease, color 0.8s ease;
}
 
.page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 10;
  width: 100%;
}
 
/* ── Crossfade overlay: covers gradient snap during theme switch ── */
.theme-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity;
}
 
/* ── Cinematic Grain Texture ── */
.clip-hover-wrapper::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}
[data-theme='dark'].clip-hover-wrapper::after { opacity: 0.04; }
 
/* ── Theme-aware page heading ── */
.clip-hover-wrapper h1 {
  font-family: var(--heading-font);
  font-weight: var(--heading-weight) !important;
  font-style: var(--heading-style);
  font-stretch: var(--heading-condensed);
  letter-spacing: -0.02em;
  transition: color 0.5s ease;
}
 
/* ── Theme-aware subheadings and description (page header only) ── */
.clip-hover-wrapper > .page-layout > header p,
.clip-hover-wrapper > .page-layout > header h2,
.clip-hover-wrapper > .page-layout > header h3,
.clip-hover-wrapper > .page-layout > header h4 {
  font-family: var(--body-font);
  font-weight: var(--body-weight);
  font-stretch: var(--body-condensed);
  transition: color 0.5s ease;
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOGGLE
───────────────────────────────────────────────────────────────────────────── */
.theme-toggle {
  position: absolute;
  top: 2rem;
  right: 4vw;
  display: flex;
  gap: 0.2rem;
  background: var(--toggle-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 0.3rem;
  border-radius: 30px;
  border: 1px solid var(--toggle-border);
  z-index: 100;
  transition: background 0.4s ease, border-color 0.4s ease;
}
.theme-btn {
  background: transparent;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--toggle-text);
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}
.theme-btn:active { transform: scale(0.96); }
.theme-btn:disabled { pointer-events: none; opacity: 0.6; }
.theme-btn:hover:not(:disabled) { color: var(--text-default); }
.theme-btn.active {
  background: var(--toggle-active-bg);
  color: var(--text-default);
  box-shadow: var(--toggle-active-shadow);
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   CARD GRID
───────────────────────────────────────────────────────────────────────────── */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 1550px;
  margin: 4rem auto 0;
}
@media (min-width: 900px)  { .card-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1280px) { .card-grid { grid-template-columns: repeat(3, 1fr); } }
 
/* ─────────────────────────────────────────────────────────────────────────────
   CARD SHELL
───────────────────────────────────────────────────────────────────────────── */
.card {
  position: relative;
  height: clamp(420px, 52vh, 560px);
  background: var(--card-bg);
  background-size: 200% 200%;
  animation: liquidGlass 12s ease-in-out infinite;
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2.2rem 2.5rem;
  cursor: pointer;
  box-shadow: var(--card-shadow-idle);
  will-change: transform, box-shadow;
  transition:
    transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.5s ease,
    background 0.5s ease,
    border-color 0.5s ease;
}
 
 
.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--card-shadow-hover);
  background: radial-gradient(circle at center, color-mix(in srgb, var(--gsap-line-hover), transparent 60%) 0%, transparent 95%), var(--card-bg);
}
 
/* ── Image overlay ── */
.card__img {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
  background-size: cover;
  background-position: center;
}
 
/* Dark gradient so text remains readable + Internal image glow bleed */
.card__img::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  background: var(--img-overlay);
  opacity: 1;
  transition: background 0.5s ease;
}
 
.card:hover .card__img {
  box-shadow: var(--card-shadow-hover);
}
 
.card:hover .card__img::after {
  background: var(--img-glow), var(--img-overlay);
}
 
.card__img-wrap {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.card:hover .card__img-inner {
  filter: brightness(1.15) contrast(1.1);
  transform: scale(1.05);
  transition: filter 0.5s ease, transform 1.2s cubic-bezier(0.1, 0, 0.1, 1);
}
 
.card__img-inner {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(1.05) contrast(1.05);
  will-change: filter, transform;
}
 
/* ── Card content ── */
.card__content {
  position: relative;
  z-index: 10;
  width: 100%;
  pointer-events: none;
}
 
.card__header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.6rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.card__index { color: var(--text-accent-secondary); font-weight: 700; transition: color 0.5s; }
.card__date  { color: var(--text-muted); transition: color 0.5s; }
 
 
.card__title {
  font-size: clamp(1.35rem, 1.9vw, 1.8rem);
  font-weight: 500;
  margin: 0;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--text-default);
  transition: color 0.5s ease;
}
.card__desc {
  font-size: 0.9rem;
  line-height: 1.55;
  letter-spacing: var(--body-ls);
  color: var(--text-muted);
  margin: 0.9rem 0 1.8rem;
  max-width: 88%;
  transition: color 0.5s ease;
}
 
.card__footer { margin-top: auto; }
 
.card__link {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-accent);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: gap 0.3s ease, color 0.5s ease, text-shadow 0.3s ease;
}
.card__link:hover { gap: 0.9rem; }
 
/* ── Splitting.js ── */
.char { display: inline-block; white-space: pre; }
`;
 
 