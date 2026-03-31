"use client"
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import './seox.css';
import './responsive.css';

// Reusable smooth fade-up animation component
const FadeUpSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

// Animated Counter Component
const CountUp: React.FC<{ end: number; suffix?: string; duration?: number }> = ({ end, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
};

const SeoxPoc: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Threshold set to 100px so it sticks shortly after beginning scroll
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="seox-body">

      {/* Dynamic Header: Static on Hero, Sticky thereafter */}
      <header className={`seox-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="seox-container">
          <nav className="seox-nav">
            <div className="seox-logo">
              <img src="/logo.png" alt="Lumzy" style={{ maxHeight: '42px', filter: 'brightness(0) invert(1)' }} />
            </div>

            <ul className="seox-menu">
              <li>Home</li>
              <li>Work</li>
              <li>About Us</li>
              <li>Our Team</li>
              <li>Case Studies</li>
            </ul>

            <div className="seox-nav-actions">
              <Search size={22} strokeWidth={2} color="#fff" className="seox-search-desktop" />
              <button className="seox-btn-primary seox-nav-btn">Contact Us</button>
            </div>
          </nav>
        </div>
      </header>

      {/* ─── 1. HERO SECTION ───────────────────────────────────── */}
      <section className="seox-hero">
        <div className="seox-grid-overlay"></div>
        <div className="seox-glow-red"></div>
        <div className="seox-glow-blue"></div>

        <div className="seox-container">
          {/* Hero Content */}
          <div className="seox-hero-content">
            <FadeUpSection>
              <div className="seox-eyebrow">
                <span style={{ color: '#c4ff33' }}>✹</span> PERFECT MARKET RESEARCH
              </div>
              <h1 className="seox-title">
                Grow Your
                <br /> Dream Business
              </h1>
              <p className="seox-desc">
                Welcome to Lumzy. We are a team of experts who know how to execute effective research campaigns that will boost your visibility, strategy, and reputation.
              </p>

              <div className="seox-audit-form">
                <input type="text" placeholder="Enter Business Email" />
                <button>Get Started</button>
              </div>
            </FadeUpSection>

            {/* Hero Visuals */}
            <div className="seox-hero-visuals">
              <motion.div
                className="seox-floating-element seox-element-rocket"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '20px' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=400"
                  alt="Marketing Tools"
                  style={{ width: '100px', height: '100px', borderRadius: '15px', objectFit: 'cover' }}
                />
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="seox-hero-circle-mask"
              >
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1588"
                  alt="Digital Agency Specialist"
                  className="seox-hero-img"
                />
              </motion.div>

              <motion.div
                className="seox-floating-element seox-element-target"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '20px' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400"
                  alt="Business Strategy"
                  style={{ width: '120px', height: '120px', borderRadius: '15px', objectFit: 'cover' }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 1.5 PARTNER BAR (SOCIAL PROOF) ────────────────────── */}
      <section className="seox-partner-bar">
        <div className="seox-partner-scroll">
          <motion.div
            className="seox-partner-track"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          >
            {[
              'Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Shopify', 'Paypal', 'Stripe',
              'Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Shopify', 'Paypal', 'Stripe'
            ].map((partner, index) => (
              <div key={index} className="seox-partner-logo">
                {partner}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 2. STATS SECTION ──────────────────────────────────── */}
      <section className="seox-stats-section">
        <div className="seox-container">
          <div className="seox-stats-grid">

            {/* Left Info block */}
            <FadeUpSection>
              <div className="seox-stats-info">
                <h2>The Results Speak<br />For Themselves</h2>
                <p>
                  Established in 2009, we are a full-service market research firm.
                  We aspire to be your most reliable research and consulting partner,
                  addressing your most critical challenges for a sustainable growth.
                </p>
              </div>
            </FadeUpSection>

            {/* Right Cards block */}
            <div className="seox-stats-cards">

              <FadeUpSection delay={0.1}>
                <div className="seox-stat-card">
                  <div className="seox-card-glow glow-1"></div>
                  <h3>Global Clients</h3>
                  <p>Partnering with businesses across the globe to achieve outstanding insights.</p>
                  <div className="seox-stat-number"><CountUp end={100} suffix="+" /></div>
                </div>
              </FadeUpSection>

              <FadeUpSection delay={0.3}>
                <div className="seox-stat-card">
                  <div className="seox-card-glow glow-2"></div>
                  <h3>Projects Finished</h3>
                  <p>A decade of operational excellence delivering incalculable success to our clients.</p>
                  <div className="seox-stat-number"><CountUp end={10} suffix="k+" /></div>
                </div>
              </FadeUpSection>

              <FadeUpSection delay={0.5}>
                <div className="seox-stat-card">
                  <div className="seox-card-glow glow-3"></div>
                  <h3>Research Reports</h3>
                  <p>Comprehensive market analysis across all sectors and industries globally.</p>
                  <div className="seox-stat-number"><CountUp end={1} suffix="k+" /></div>
                </div>
              </FadeUpSection>

            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. SERVICES SECTION ───────────────────────────────── */}
      <section className="seox-services-section">
        <div className="seox-container">
          <div className="seox-services-grid">

            <FadeUpSection>
              <div>
                <div className="seox-service-eyebrow">
                  <span style={{ color: '#000', fontSize: '1.2rem' }}>✹</span> BUSINESS RESEARCH
                </div>
                <h2>Amazing Service<br />at Lumzy</h2>
                <p>
                  Valuably operating in the MR world for nearly a decade, our team has been performing marvelous robust engagements
                  handling innovative requirements that translate to solid business decisions.
                </p>
                <button className="seox-btn-primary">Explore Services</button>
              </div>
            </FadeUpSection>

            <FadeUpSection delay={0.2}>
              <div className="seox-services-visual">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070"
                  alt="Agency Team Working Together"
                />
              </div>
            </FadeUpSection>

          </div>
        </div>
      </section>

      {/* ─── 4. FOOTER ────────────────────────────────────────── */}
      <footer className="seox-footer">
        <div className="seox-container">
          <div className="seox-footer-top">
            <div className="seox-footer-logo">
              <img src="/logo.png" alt="Lumzy" style={{ maxHeight: '42px', filter: 'brightness(0) invert(1)' }} />
            </div>
            <div className="seox-footer-socials">
              {['Twitter', 'Instagram', 'Dribbble', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="seox-footer-link">{social}</a>
              ))}
            </div>
          </div>

          <div className="seox-footer-divider"></div>

          <div className="seox-footer-bottom">
            <div className="seox-footer-copy">
              © 2026 Lumzy. All rights reserved.
            </div>
            <div className="seox-footer-legal">
              <a href="#" className="seox-footer-link">Privacy Policy</a>
              <a href="#" className="seox-footer-link">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SeoxPoc;
