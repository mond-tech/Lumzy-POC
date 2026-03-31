"use client"
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './blossom.css';
import './responsive.css';

/* ─── DATA ──────────────────────────────────────────────── */
const heroSlides = [
  {
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
    title: 'WELCOME TO LUMZY',
    lead: 'Extraordinary art studio & creative minimal',
  },
  {
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
    title: 'CREATIVE DIGITAL AGENCY',
    lead: 'Turning insights into architectural brand design',
  },
];

const services = [
  {
    icon: 'fa-solid fa-magnifying-glass-chart',
    title: 'UX/CX Research',
    desc: 'Deep dives into user and customer experiences to drive engagement and loyalty through actionable insights.',
  },
  {
    icon: 'fa-solid fa-users-rays',
    title: 'Expert Network',
    desc: 'Connecting you with industry specialists for in-depth knowledge and niche consulting services.',
  },
  {
    icon: 'fa-solid fa-chart-line',
    title: 'Research & Analytics',
    desc: 'Groundbreaking differentiators supported with meaningful insights for solid business growth.',
  },
  {
    icon: 'fa-solid fa-earth-americas',
    title: 'Online Research',
    desc: 'Innovative global research techniques translating to robust engagements and data-driven results.',
  },
];

const portfolioItems = [
  { id: 1, title: 'RETAIL STUDY', category: 'WEB DESIGN', img: '/port_retail.png' },
  { id: 2, title: 'EV CARS STUDY', category: 'BRANDING', img: '/port_ev.png' },
  { id: 3, title: 'HEALTH & WELLNESS TRENDS', category: 'PHOTOGRAPHY', img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=2070' },
  { id: 4, title: 'BFSI ANALYSIS', category: 'ILLUSTRATOR', img: '/p2.png' },
  { id: 5, title: 'REAL ESTATE', category: 'WEB DESIGN', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070' },
  { id: 6, title: 'AGRICULTURE', category: 'BRANDING', img: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2070' },
  { id: 7, title: 'CPG CONSUMER STUDY', category: 'PHOTOGRAPHY', img: '/hero.png' },
  { id: 8, title: 'GLOBAL DIGITAL TRENDS', category: 'ILLUSTRATOR', img: '/about_history.png' },
];






const categories = ['ALL', 'WEB DESIGN', 'BRANDING', 'PHOTOGRAPHY', 'ILLUSTRATOR'];

/* ─── COMPONENT ─────────────────────────────────────────── */
const BlossomPoc: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [historySlide, setHistorySlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const historyImages = [
    '/about_history.png',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070'
  ];

  const filteredItems =
    activeCategory === 'ALL'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  /* Hero auto-slide */
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="blossom-wrapper">
      {/* ─── SIDEBAR NAVIGATION ──────────────────────────── */}
      <aside className={`blossom-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="blossom-logo-area">
          <div className="blossom-logo">
            <img src="/logo.png" alt="Lumzy" />
          </div>
        </div>

        <nav className="blossom-nav">
          <ul>
            <li className="active"><a href="#home">HOME</a></li>
            <li><a href="#about">ABOUT US</a></li>
            <li><a href="#work">WORK</a></li>
            <li><a href="#services">SERVICES</a></li>
            <li><a href="#case-studies">CASE STUDIES</a></li>
            <li><a href="#contact">CONTACT US</a></li>
          </ul>
        </nav>

        <div className="blossom-sidebar-footer">
          <div className="blossom-search">
            <input type="text" placeholder="search..." />
          </div>
          <div className="sidebar-divider"></div>
          <div className="blossom-socials">
            <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#"><i className="fa-brands fa-twitter"></i></a>
            <a href="#"><i className="fa-brands fa-google-plus-g"></i></a>
            <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
            <a href="#"><i className="fa-brands fa-behance"></i></a>
          </div>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* ─── MAIN CONTENT ────────────────────────────────── */}
      <main className="blossom-main">
        <section className="blossom-hero">
          <AnimatePresence>
            <motion.div
              key={currentSlide}
              className="hero-slide"
              style={{ backgroundImage: `url(${heroSlides[currentSlide].img})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: 'easeInOut' }}
            >
              <div className="hero-overlay"></div>
              <motion.div
                className="hero-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h1>{heroSlides[currentSlide].title}</h1>
                <p className="hero-lead">{heroSlides[currentSlide].lead}</p>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <button className="hero-nav prev" onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button className="hero-nav next" onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </section>

        {/* 2 ─ OUR HISTORY */}
        <section className="blossom-history">
          <div className="blossom-container">
            <div className="history-grid">
              <div className="history-image">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={historySlide}
                    src={historyImages[historySlide]}
                    alt="Our History"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                </AnimatePresence>
                <div className="slider-dots">
                  {historyImages.map((_: string, idx: number) => (
                    <span
                      key={idx}
                      className={`dot ${historySlide === idx ? 'active' : ''}`}
                      onClick={() => setHistorySlide(idx)}
                    ></span>
                  ))}
                </div>
              </div>
              <div className="history-text">
                <h2>OUR HISTORY</h2>
                <div className="accent-line"></div>
                <p className="lead">
                  We are passionate, creative and enthusiastic designer
                </p>
                <p className="desc">
                  Established in 2009, we are a full service market research firm addressing the most critical challenges to help clients transform their enterprise for sustainable growth in a competitive industry. We excel at handling complex requirements with innovative techniques that delight our 500+ global clients.
                </p>
                <a href="#" className="read-more">
                  READ MORE
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3 ─ SERVICES */}
        <section className="blossom-services">
          <div className="services-grid">
            {services.map((service, idx) => (
              <div key={idx} className="service-card">
                <div className="service-inner">
                  <i className={service.icon}></i>
                  <h6>{service.title}</h6>
                  <div className="service-desc-wrapper">
                    <p>{service.desc}</p>
                  </div>
                </div>
                <div className="read-more-bar">READ MORE</div>
              </div>
            ))}
          </div>
        </section>


        {/* 4 ─ LATEST WORK */}
        <section className="blossom-works">
          <div className="blossom-container-full">
            <div className="works-header">
              <h2>Latest work</h2>
              <div className="filter-bar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={activeCategory === cat ? 'active' : ''}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="accent-line works-accent"></div>

            <div className="portfolio-grid">
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    className="portfolio-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img src={item.img} alt={item.title} />
                    <div className="portfolio-overlay">
                      <div className="overlay-content">
                        <div className="link-icon">
                          <i className="fa-solid fa-link"></i>
                        </div>
                        <h4>{item.title}</h4>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="works-footer">
              <button className="btn-view-all">VIEW PORTFOLIO</button>
            </div>
          </div>
        </section>




        <footer className="blossom-footer">
          <div className="footer-container">
            <div className="footer-top">
              <div className="footer-logo">
                <img src="/logo.png" alt="Lumzy" style={{ height: '50px', width: 'auto' }} />
              </div>
              <div className="footer-socials">
                <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#"><i className="fa-brands fa-twitter"></i></a>
                <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
                <a href="#"><i className="fa-brands fa-instagram"></i></a>
              </div>
            </div>

            <hr className="footer-divider" />

            <div className="footer-bottom">
              <div className="footer-copyright">
                © 2026 Lumzy. All rights reserved.
              </div>
              <div className="footer-legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default BlossomPoc;
