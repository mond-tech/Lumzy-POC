'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import './HeroSlider.css';

declare global {
  interface Window {
    rgbKineticSlider: any;
    images: string[];
    texts: string[][];
  }
}

const sliderImages = [
  '/hero/image1.avif',
  '/hero/image2.avif',
  '/hero/image3.avif',
];

const sliderTexts = [
  ['Earth', 'Surface gravity‎: ‎9.807 m/s²'],
  ['Mars', 'Surface gravity‎: ‎3.711 m/s²'],
  ['Venus', 'Surface gravity‎: ‎8.87 m/s²'],
];

export default function HeroSlider() {
  const [dependenciesLoaded, setDependenciesLoaded] = useState({
    gsap: false,
    imagesLoaded: false,
    pixi: false,
    pixiFilters: false,
    slider: false,
  });

  const sliderInstance = useRef<any>(null);

  // Initialize once EVERY script is ready
  useEffect(() => {
    const allReady = Object.values(dependenciesLoaded).every((val) => val === true);

    if (allReady && typeof window !== 'undefined' && window.rgbKineticSlider) {
      // Set global variables just in case the script looks for them
      window.images = sliderImages;
      window.texts = sliderTexts;

      const container = document.getElementById('rgbKineticSlider');
      if (container) container.innerHTML = '';

      sliderInstance.current = new window.rgbKineticSlider({
        slideImages: sliderImages,
        itemsTitles: sliderTexts,
        
        backgroundDisplacementSprite: 'https://images.unsplash.com/photo-1558865869-c93f6f8482af?ixlib=rb-1.2.1&auto=format&fit=crop&w=2081&q=80',
        cursorDisplacementSprite: 'https://images.unsplash.com/photo-1558865869-c93f6f8482af?ixlib=rb-1.2.1&auto=format&fit=crop&w=2081&q=80',

        cursorImgEffect: true,
        cursorTextEffect: false,
        cursorScaleIntensity: 0.65,
        cursorMomentum: 0.14,
        swipe: true,
        swipeDistance: window.innerWidth * 0.4,
        swipeScaleIntensity: 2,
        slideTransitionDuration: 1,
        transitionScaleIntensity: 30,
        transitionScaleAmplitude: 160,
        nav: true,
        navElement: '.main-nav',
        imagesRgbEffect: false,
        imagesRgbIntensity: 0.9,
        navImagesRgbIntensity: 80,
        textsDisplay: true,
        textsSubTitleDisplay: true,
        textsTiltEffect: true,
        googleFonts: ['Playfair Display:700', 'Roboto:400'],
        buttonMode: false,
        textsRgbEffect: true,
        textsRgbIntensity: 0.03,
        navTextsRgbIntensity: 15,
        textTitleColor: 'white',
        textTitleSize: 125,
        mobileTextTitleSize: 70,
        textTitleLetterspacing: 3,
        textSubTitleColor: 'white',
        textSubTitleSize: 21,
        mobileTextSubTitleSize: 16,
        textSubTitleLetterspacing: 2,
        textSubTitleOffsetTop: 90,
        mobileTextSubTitleOffsetTop: 60,
      });

      // Helper functions for navigation
      const nextSlide = () => {
        const nextBtn = document.querySelector('.main-nav.next') as HTMLElement;
        if (nextBtn) nextBtn.click();
      };

      const prevSlide = () => {
        const prevBtn = document.querySelector('.main-nav.prev') as HTMLElement;
        if (prevBtn) prevBtn.click();
      };

      // Auto-play functionality: changes image every 4 seconds
      const autoPlayInterval = setInterval(nextSlide, 4000);

      // Scroll navigation functionality
      let lastScrollTime = 0;
      const scrollThrottle = 1500; // 1.5 seconds cooldown to prevent rapid skipping

      const handleWheel = (e: WheelEvent) => {
        const now = Date.now();
        if (now - lastScrollTime < scrollThrottle) return;

        // Check for meaningful scroll delta to avoid jitter
        if (Math.abs(e.deltaY) > 50) {
          if (e.deltaY > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          lastScrollTime = now;
        }
      };

      window.addEventListener('wheel', handleWheel, { passive: true });

      // Cleanup listeners and interval on unmount
      return () => {
        clearInterval(autoPlayInterval);
        window.removeEventListener('wheel', handleWheel);
      };
    }
  }, [dependenciesLoaded]);

  return (
    <>
      {/* We use afterInteractive for everything. 
        Each script updates the state when finished. 
      */}
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenMax.min.js" 
        strategy="afterInteractive"
        onLoad={() => setDependenciesLoaded(prev => ({ ...prev, gsap: true }))}
      />
      <Script 
        src="https://unpkg.com/imagesloaded@4/imagesloaded.pkgd.min.js" 
        strategy="afterInteractive"
        onLoad={() => setDependenciesLoaded(prev => ({ ...prev, imagesLoaded: true }))}
      />
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.1.3/pixi.min.js" 
        strategy="afterInteractive"
        onLoad={() => setDependenciesLoaded(prev => ({ ...prev, pixi: true }))}
      />
      <Script 
        src="https://cdn.jsdelivr.net/gh/hmongouachon/rgbKineticSlider/js/libs/pixi-filters.min.js" 
        strategy="afterInteractive"
        onLoad={() => setDependenciesLoaded(prev => ({ ...prev, pixiFilters: true }))}
      />
      <Script 
        src="https://cdn.jsdelivr.net/gh/hmongouachon/rgbKineticSlider/js/rgbKineticSlider.js" 
        strategy="afterInteractive"
        onLoad={() => setDependenciesLoaded(prev => ({ ...prev, slider: true }))}
      />

      <div className="demo-1">
        <main>
          <div className="frame">
            <div className="frame__title-wrap">
              <h1 className="frame__title">rgbKineticSlider</h1>
              <p className="frame__tagline">Demo 1</p>
            </div>
            <div className="frame__links">
              <a href="https://github.com/hmongouachon/rgbKineticSlider" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </div>
          
          <div className="content">
            <div id="rgbKineticSlider" className="rgbKineticSlider"></div>
            <nav>
              <a href="#" className="main-nav prev" data-nav="previous">Prev <span></span></a>
              <a href="#" className="main-nav next" data-nav="next">Next <span></span></a>
            </nav>
            <span className="notice">Scroll or Swipe to explore</span>
          </div>
        </main>
      </div>
    </>
  );
}