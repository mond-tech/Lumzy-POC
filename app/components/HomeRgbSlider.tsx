"use client";

import React, { useEffect } from "react";

declare global {
  interface Window {
    rgbKineticSlider?: any;
  }
}

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject();
    document.body.appendChild(script);
  });

const HomeRgbSlider: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("loading");

    const init = async () => {
      try {
        // Load dependencies and plugin from the original repo via CDN
        await loadScript(
          "https://cdn.jsdelivr.net/gh/hmongouachon/rgbKineticSlider/js/libs/pixi.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/gh/hmongouachon/rgbKineticSlider/js/libs/TweenMax.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/gh/hmongouachon/rgbKineticSlider/js/libs/imagesLoaded.pkgd.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/gh/hmongouachon/rgbKineticSlider/js/rgbKineticSlider.js"
        );

        const images = [
          "https://images.unsplash.com/photo-1523643391907-41e69459a06f?auto=format&fit=crop&w=2069&q=80",
          "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=2074&q=80",
          "https://images.unsplash.com/photo-1612892483236-52d32a0e0ac1?auto=format&fit=crop&w=2070&q=80",
        ];

        const texts = [
          ["Earth", "Surface gravity‎: ‎9.807 m/s²"],
          ["Mars", "Surface gravity‎: ‎3.711 m/s²"],
          ["Venus", "Surface gravity‎: ‎8.87 m/s²"],
        ];

        if (window.rgbKineticSlider) {
          // eslint-disable-next-line new-cap
          window.rgbKineticSlider = new window.rgbKineticSlider({
            slideImages: images,
            itemsTitles: texts,
            backgroundDisplacementSprite:
              "https://images.unsplash.com/photo-1558865869-c93f6f8482af?auto=format&fit=crop&w=2081&q=80",
            cursorDisplacementSprite:
              "https://images.unsplash.com/photo-1558865869-c93f6f8482af?auto=format&fit=crop&w=2081&q=80",
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
            navElement: ".main-nav",
            imagesRgbEffect: false,
            imagesRgbIntensity: 0.9,
            navImagesRgbIntensity: 80,
            textsDisplay: true,
            textsSubTitleDisplay: true,
            textsTiltEffect: true,
            googleFonts: ["Playfair Display:700", "Roboto:400"],
            buttonMode: false,
            textsRgbEffect: true,
            textsRgbIntensity: 0.03,
            navTextsRgbIntensity: 15,
            textTitleColor: "white",
            textTitleSize: 125,
            mobileTextTitleSize: 125,
            textTitleLetterspacing: 3,
            textSubTitleColor: "white",
            textSubTitleSize: 21,
            mobileTextSubTitleSize: 21,
            textSubTitleLetterspacing: 2,
            textSubTitleOffsetTop: 90,
            mobileTextSubTitleOffsetTop: 90,
          });
        }
      } finally {
        document.body.classList.remove("loading");
      }
    };

    init();
  }, []);

  return (
    <main className="rgb-slider-main">
      <div className="message">Some message for mobile (if needed).</div>
      <div className="frame">
        <div className="frame__title-wrap">
          <h1 className="frame__title">rgbKineticSlider</h1>
          <p className="frame__tagline">Demo 1</p>
        </div>
        <div className="frame__links">
          <a
            href="https://github.com/hmongouachon/rgbKineticSlider"
            target="_blank"
            rel="noreferrer"
          >
            View this project on GitHub
          </a>
        </div>
        <div className="frame__demos">
          <a
            href="https://codepen.io/hmongouachon/pen/QWbLpzW"
            className="frame__demo frame__demo--current"
            target="_blank"
            rel="noreferrer"
          >
            demo 1
          </a>
          <a
            href="https://codepen.io/hmongouachon/pen/jOPNBdP"
            className="frame__demo"
            target="_blank"
            rel="noreferrer"
          >
            demo 2
          </a>
          <a
            href="https://codepen.io/hmongouachon/pen/eYNOvxB"
            className="frame__demo"
            target="_blank"
            rel="noreferrer"
          >
            demo 3
          </a>
        </div>
      </div>

      <div className="content">
        <div id="rgbKineticSlider" className="rgbKineticSlider" />
        <nav>
          <a href="#" className="main-nav prev" data-nav="previous">
            Prev <span></span>
          </a>
          <a href="#" className="main-nav next" data-nav="next">
            Next <span></span>
          </a>
        </nav>
        <span className="notice">Swipe left... or right</span>
      </div>
    </main>
  );
};

export default HomeRgbSlider;

