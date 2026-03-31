"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Lightbulb, Rocket, BarChart3, ArrowRight } from 'lucide-react';
import './index.css';

const EASE_CINEMATIC = [0.76, 0, 0.24, 1] as const;
const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;

const CATEGORIES = ['All', 'Retail', 'BFSI', 'Automobile', 'Ecommerce'];

const PORTFOLIO = [
  { id: 1, title: 'Retail Analytics', category: 'Retail', image: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=2070&auto=format&fit=crop' },
  { id: 2, title: 'Financial Modeling', category: 'BFSI', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop' },
  { id: 3, title: 'Automobile Trends', category: 'Automobile', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070&auto=format&fit=crop' },
  { id: 4, title: 'Ecommerce Growth', category: 'Ecommerce', image: 'https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?q=80&w=2070&auto=format&fit=crop' },
];

const SERVICES = [
  {
    icon: <Lightbulb size={48} strokeWidth={1} />,
    title: 'Expert Networks',
    description:
      'Unlock direct access to industry leaders for critical, data-driven insights that drive core business strategy.',
  },
  {
    icon: <Rocket size={48} strokeWidth={1} />,
    title: 'UX / CX Research',
    description:
      'Dive deep into user psychology to elevate customer journeys with comprehensive behavioral research methodologies.',
  },
  {
    icon: <BarChart3 size={48} strokeWidth={1} />,
    title: 'Research & Analytics',
    description:
      'Leverage advanced proprietary analytics and robust frameworks to ensure total clarity in mission-critical decisions.',
  },
];

const maskReveal: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 1.1, ease: EASE_CINEMATIC } },
};

const maskRevealDelayed = (delay: number): Variants => ({
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 1.1, ease: EASE_CINEMATIC, delay } },
});

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.18 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_SMOOTH } },
};

const Works: React.FC = () => {
  const [active, setActive] = useState('All');

  const items = active === 'All'
    ? PORTFOLIO
    : PORTFOLIO.filter((p) => p.category === active);

  return (
    <section id="work" style={{ backgroundColor: '#111' }}>

      {/* ── Capabilities Sub-Section (Formerly Services) ── */}
      <div className="capabilities-banner">
        <div className="container">
          <div style={{ overflow: 'hidden', marginBottom: '2rem', textAlign: 'center' }}>
            <motion.span
              className="works-eyebrow"
              variants={maskReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              OUR CAPABILITIES
            </motion.span>
          </div>

          <div style={{ overflow: 'hidden', textAlign: 'center' }}>
            <motion.h2
              className="works-title"
              style={{ marginInline: 'auto' }}
              variants={maskRevealDelayed(0.15)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              WE PROVIDE GENIUS SOLUTIONS <br /> FOR YOUR BUSINESS
            </motion.h2>
          </div>
        </div>
      </div>

      <div className="capabilities-cards">
        <div className="container">
          <motion.div
            className="capabilities-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {SERVICES.map((svc, i) => (
              <motion.div key={i} className="capability-card" variants={cardVariants}>
                <div className="capability-icon">{svc.icon}</div>
                <h3 className="capability-title">{svc.title}</h3>
                <p className="capability-desc">{svc.description}</p>
                <a href="#" className="learn-more">
                  Learn more <ArrowRight size={16} strokeWidth={1.5} />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Portfolio Sub-Section ── */}
      <div className="portfolio-header">
        <div style={{ overflow: 'hidden', marginBottom: '1.25rem' }}>
          <motion.span
            className="works-eyebrow"
            variants={maskReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            WHAT WE HAVE DONE
          </motion.span>
        </div>

        <div style={{ overflow: 'hidden', marginBottom: '3rem' }}>
          <motion.h2
            className="works-title"
            variants={maskRevealDelayed(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Sample Projects
          </motion.h2>
        </div>

        <div className="works-filters">
          {CATEGORIES.map((cat, i) => (
            <React.Fragment key={cat}>
              <button
                onClick={() => setActive(cat)}
                className={`filter-btn ${active === cat ? 'filter-btn--active' : ''}`}
              >
                {cat}
              </button>
              {i < CATEGORIES.length - 1 && (
                <span className="filter-slash">/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <motion.div layout className="works-grid">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="portfolio-card"
            >
              <img src={item.image} alt={item.title} className="portfolio-img" />
              <div className="portfolio-overlay">
                <h4 className="portfolio-label">{item.title}</h4>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .capabilities-banner {
          padding: 10rem 0 6rem;
          background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)),
                      url('/services_hero.png') center / cover fixed;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .capabilities-cards {
          padding: 6rem 0;
          background-color: #111;
        }
        .capabilities-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 5rem;
        }
        .capability-card { 
          text-align: center; 
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          padding: 0 1rem;
        }
        .capability-icon { color: white; margin-bottom: 2.5rem; display: flex; justify-content: center; }
        .capability-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: white;
          font-family: var(--font-heading);
          margin-bottom: 1.5rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .capability-desc {
          color: #888;
          font-size: 0.95rem;
          line-height: 1.85;
          margin-bottom: 2.5rem;
          flex-grow: 1;
        }
        .learn-more {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          transition: all 0.3s ease;
          margin-top: auto;
        }
        .learn-more:hover { color: var(--accent-blue); }
        .learn-more svg   { transition: transform 0.3s ease; }
        .learn-more:hover svg { transform: translateX(5px); }

        .portfolio-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6rem 0 6rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .works-eyebrow {
          display: block;
          color: #888;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          margin-bottom: 1.5rem;
        }
        .works-title {
          font-size: clamp(2.2rem, 4vw, 3.5rem);
          font-weight: 800;
          color: white;
          line-height: 1.15;
          font-family: var(--font-heading);
          margin-bottom: 2rem;
          max-width: 900px;
        }
        .works-filters {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }
        .filter-btn {
          font-size: 0.9rem;
          font-weight: 500;
          font-family: var(--font-main);
          color: #444;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.3s ease;
          letter-spacing: 0.04em;
        }
        .filter-btn--active { color: white; font-weight: 600; }
        .filter-btn:hover { color: #bbb; }
        .filter-slash { color: #333; font-size: 0.85rem; font-weight: 300; user-select: none; }

        .works-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 480px;
          width: 100%;
          gap: 0;
        }
        .portfolio-card { position: relative; overflow: hidden; cursor: pointer; }
        .portfolio-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(100%);
          transition: transform 0.7s ease, filter 0.7s ease;
          display: block;
        }
        .portfolio-card:hover .portfolio-img { transform: scale(1.06); filter: grayscale(0%); }
        .portfolio-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 45%, rgba(0,0,0,0.72) 100%);
          display: flex;
          align-items: flex-end;
          padding: 2rem;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .portfolio-card:hover .portfolio-overlay { opacity: 1; }
        .portfolio-label {
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          font-family: var(--font-heading);
          letter-spacing: 0.01em;
        }
        @media (max-width: 1024px) {
          .works-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 360px; }
          .capabilities-grid { grid-template-columns: 1fr; gap: 3rem; text-align: center; }
          .capability-icon { display: flex; justify-content: center; }
        }
        @media (max-width: 600px) {
          .works-grid { grid-template-columns: 1fr; grid-auto-rows: 300px; }
        }
      `}</style>
    </section>
  );
};

export default Works;
