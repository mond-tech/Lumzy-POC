"use client"
import React, { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import './index.css';

const NAV_LINKS = [
  { name: 'Home', href: '#' },
  { name: 'Work', href: '#work' },
  { name: 'About Us', href: '#about' },
  { name: 'Our Team', href: '#team' },
  { name: 'Case Studies', href: '#news' },
  { name: 'Contact Us', href: '#contact' },
];

const SECTION_IDS = ['contact', 'work', 'about', 'team', 'news'];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Home');

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);

      let current = 'Home';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          if (id === 'team') current = 'Our Team';
          else if (id === 'work') current = 'Work';
          else if (id === 'about') current = 'About Us';
          else if (id === 'news') current = 'Case Studies';
          else if (id === 'contact') current = 'Contact Us';
          else current = id.charAt(0).toUpperCase() + id.slice(1);
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 50,
        transition: 'all 0.5s ease',
        backgroundColor: isScrolled ? 'rgba(21, 21, 21, 0.95)' : 'transparent',
        padding: isScrolled ? '20px 0' : '40px 0',
      }}
    >
      <div className="navbar-inner">
        {/* Logo */}
        <a href="#">
          <img src="/logo.png" alt="Lumzy" style={{ maxHeight: '45px' }} />
        </a>

        {/* Desktop Links */}
        <ul className="desktop-menu">
          {NAV_LINKS.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className={`nav-link ${activeSection === link.name ? 'active' : ''}`}
              >
                {link.name}
              </a>
            </li>
          ))}
          <li>
            <button aria-label="Search" className="search-btn">
              <Search size={18} strokeWidth={2.5} />
            </button>
          </li>
        </ul>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          aria-label="Toggle menu"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <style>{`
        .navbar-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1320px;
          width: 100%;
          margin: 0 auto;
          padding: 0 4vw;
          box-sizing: border-box;
        }

        .desktop-menu {
          display: flex;
          gap: 2.5rem;
          align-items: center;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          font-family: var(--font-main);
          font-size: 0.95rem;
          font-weight: 700;
          color: white;
          position: relative;
          padding-bottom: 8px;
          transition: opacity 0.3s ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background-color: var(--accent-blue);
          transition: width 0.3s ease;
        }

        .nav-link.active::after,
        .nav-link:hover::after {
          width: 20px;
        }

        .search-btn {
          color: white;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
        }

        .mobile-toggle {
          display: none;
          color: white;
          background: none;
          border: none;
          cursor: pointer;
        }

        @media (max-width: 991px) {
          .desktop-menu  { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
