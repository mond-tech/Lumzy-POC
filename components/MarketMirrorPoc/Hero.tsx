"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import './index.css';

const EASE_CINEMATIC = [0.76, 0, 0.24, 1] as const;
const EASE_SMOOTH    = [0.16, 1, 0.3, 1]  as const;

const HERO_SLIDES = [
  {
    image: '/hero.png',
    title: <>PERFECT MARKET <br /> RESEARCH</>,
    desc: 'We are a team of experts who know how to create and execute effective market research campaigns that will boost your growth.'
  },
  {
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
    title: <>STRATEGIC DATA <br /> INSIGHTS</>,
    desc: 'Unlocking deep industry analytics to transform your business trajectory with precision-targeted growth strategies.'
  }
];

const maskReveal: Variants = {
  hidden:   { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
  visible:  { clipPath: 'inset(0 0% 0 0)', opacity: 1, transition: { duration: 1.1, ease: EASE_CINEMATIC } },
};

const fadeUp = (delay: number): Variants => ({
  hidden:  { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_SMOOTH, delay } },
});

const Hero: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000); // Slightly longer for readability
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[index];

  return (
    <section
      id="home"
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        backgroundColor: '#050505',
      }}
    >
      {/* ── Seamless Cross-Fade Background ── */}
      <AnimatePresence initial={false}>
        <motion.div
           key={`bg-${index}`}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 2, ease: 'linear' }} // Linear fade for blending
           style={{
             position: 'absolute',
             inset: 0,
             backgroundImage: `url("${slide.image}")`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
           }}
        >
          {/* Internal image overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
        </motion.div>
      </AnimatePresence>

      {/* ── Synchronized Text Content ── */}
      <div className="container" style={{ position: 'relative', zIndex: 10, paddingTop: '80px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${index}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <motion.h1
                variants={maskReveal}
                style={{
                  fontSize: 'clamp(2.8rem, 8vw, 6.875rem)',
                  lineHeight: 1.1,
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  maxWidth: '1200px',
                  marginInline: 'auto',
                }}
              >
                {slide.title}
              </motion.h1>
            </div>

            <motion.p
              variants={fadeUp(0.4)}
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '1.75rem',
                maxWidth: '620px',
                marginInline: 'auto',
                fontWeight: 300,
                letterSpacing: '0.01em',
                lineHeight: 1.75,
                fontFamily: 'var(--font-main)',
              }}
            >
              {slide.desc}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ width: '60px', height: '1px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 auto 2.5rem' }}
        />

        <div style={{ overflow: 'hidden', padding: '15px 0 20px' }}>
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: EASE_CINEMATIC, delay: 0.9 }}
          >
            <a href="#work" className="hero-cta">Explore Work</a>
          </motion.div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="hero-dots" style={{ bottom: '20px' }}>
        {HERO_SLIDES.map((_, i) => (
          <div key={i} onClick={() => setIndex(i)} style={{ cursor: 'pointer' }}>
            {index === i ? (
              <div className="dot dot--ring"><div className="dot dot--center" /></div>
            ) : (
              <div className="dot dot--sm" />
            )}
          </div>
        ))}
      </div>

      <style>{`
        .hero-cta {
          display: inline-block;
          background: white;
          color: #151515;
          padding: 20px 50px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-family: var(--font-heading);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-cta:hover {
          background: var(--accent-blue);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 10px 40px rgba(50, 88, 232, 0.35);
        }
        .hero-dots {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          align-items: center;
          z-index: 20;
        }
        .dot { border-radius: 50%; transition: all 0.4s ease; }
        .dot--sm     { width: 8px; height: 8px; background: rgba(255,255,255,0.35); }
        .dot--ring   { width: 18px; height: 18px; border: 2px solid white; display: flex; align-items: center; justify-content: center; }
        .dot--center { width: 4px; height: 4px; background: white; }
        .dot:hover   { transform: scale(1.2); background: white; }
      `}</style>
    </section>
  );
};

export default Hero;
