"use client"
import Navbar from './Navbar';
import Hero from './Hero';
import Works from './Works';
import './index.css';

const LumzyPoc: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <div id="work">
        <Works />
      </div>

      {/* ─── Footer Section ────────────────────────────────── */}
      <footer className="seox-footer" style={{
        backgroundColor: '#0b0f19',
        padding: '60px 0 30px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        color: '#fff',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      }}>
        <div className="seox-container" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 4vw' }}>
          <div className="seox-footer-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div className="seox-footer-logo">
              <img src="/logo.png" alt="Lumzy" style={{ maxHeight: '42px', filter: 'brightness(0) invert(1)' }} />
            </div>
            <div className="seox-footer-socials" style={{ display: 'flex', gap: '25px' }}>
              {['Twitter', 'Instagram', 'Dribbble', 'LinkedIn'].map((social) => (
                <a key={social} href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>{social}</a>
              ))}
            </div>
          </div>

          <div className="seox-footer-divider" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '40px' }}></div>

          <div className="seox-footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', opacity: '0.5', fontSize: '0.85rem' }}>
            <div>© 2026 Lumzy. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '30px' }}>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        body { background-color: #050505; margin: 0; }
        #work { background-color: #050505; }
      `}</style>
    </div>
  );
};

export default LumzyPoc;
