'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import imagesLoaded from 'imagesloaded';
import './WebGLSlider.css';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1734361469806-690540d68edc',
    year: '2018',
    subtitle: 'The Beginning',
    title: 'An Idea Was Born',
    desc: 'A small team with a big vision to redefine digital experiences.',
  },
  {
    image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=2560&h=1440&auto=format&fit=crop',
    subtitle: 'First Breakthrough',
    title: 'Building the First Product',
    desc: 'Our first solution reached 10,000+ users.',
  },
  {
    image: 'https://images.unsplash.com/photo-1745393686155-71f7a911c0cc?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0',
    year: '2022',
    subtitle: 'Scaling Up',
    title: 'From Startup to Company',
    desc: 'We expanded globally and built enterprise solutions.',
  },
  {
    image: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e',
    year: '2025',
    subtitle: 'Future Vision',
    title: 'Shaping Tomorrow',
    desc: 'Innovating with AI and immersive tech.',
  },
];

export default function WebGLSlider() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;           // guard against stale imagesLoaded callback
    let destroySlider: (() => void) | null = null;

    const wrapper = wrapperRef.current!;
    const el = sliderRef.current!;
    const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];

    const imgLoader = imagesLoaded(imgs);
    imgLoader.on('always', () => {
      if (!active) return;       // effect was already cleaned up — bail out
      wrapper.classList.remove('test4-loading');
      destroySlider = initSlider(el, imgs);
    });

    return () => {
      active = false;            // prevent stale callback from running
      destroySlider?.();         // remove listeners + dispose WebGL renderer
    };
  }, []);

  return (
    <div ref={wrapperRef} className="test4-wrapper test4-loading">
      {/* Header */}
      <header className="test4-header" id="main-header">
        <div className="inner">
          <div className="logo" style={{ flex: 1 }}>
            <img src="/logo.png" alt="Company Logo" style={{ height: '32px', width: 'auto' }} />
          </div>
          <div className="burger" />
          <nav>
            <a href="#">About</a>
            <a href="#">Case Studies</a>
            <a href="#">Capabilities</a>
            <a href="#">Journal</a>
          </nav>
          <div className="header-action">
            <a href="#" className="contact-btn">Let's Talk</a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="test4-main">
        <div id="slider" ref={sliderRef} className="test4-slider">
          <div className="slider-inner">
            <div id="slider-content">
              <div id="slide-year" className="slide-year">{slides[0].year}</div>
              {slides.map((s, i) => (
                <span key={`year-${i}`} data-slide-year={String(i)}>
                  {s.year}
                </span>
              ))}

              <div id="slide-subtitle" className="slide-subtitle">{slides[0].subtitle}</div>
              {slides.map((s, i) => (
                <span key={`subtitle-${i}`} data-slide-subtitle={String(i)}>
                  {s.subtitle}
                </span>
              ))}

              <h2
                id="slide-title"
                dangerouslySetInnerHTML={{ __html: slides[0].title }}
              />
              {slides.map((s, i) => (
                <span
                  key={`title-${i}`}
                  data-slide-title={String(i)}
                  dangerouslySetInnerHTML={{ __html: s.title }}
                />
              ))}

              <div id="slide-desc" className="slide-desc">{slides[0].desc}</div>
              {slides.map((s, i) => (
                <span key={`desc-${i}`} data-slide-desc={String(i)}>
                  {s.desc}
                </span>
              ))}
            </div>
          </div>

          {/* Images – hidden behind WebGL canvas */}
          {slides.map((s, i) => (
            <img
              key={i}
              src={s.image}
              alt={`slide-${i}`}
              crossOrigin="anonymous"
            />
          ))}

          {/* Pagination */}
          <div id="pagination">
            {slides.map((_, i) => (
              <button
                key={i}
                className={i === 0 ? 'active' : ''}
                data-slide={String(i)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Three.js displacement slider logic ────────────────────────────────────

function initSlider(parent: HTMLElement, images: HTMLImageElement[]): () => void {
  const vertex = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragment = /* glsl */ `
    varying vec2 vUv;
    uniform sampler2D currentImage;
    uniform sampler2D nextImage;
    uniform float dispFactor;
    uniform vec2 uMouse;

    void main() {
      // Apply mouse parallax opposite to mouse direction
      vec2 uv = vUv - (uMouse * 0.015);

      float intensity = 0.3;

      // Sample both images to mix their luminosity natively (100% reliable)
      vec4 orig1 = texture2D(currentImage, uv);
      vec4 orig2 = texture2D(nextImage, uv);

      // Algorithmically generate a beautiful ripple phase matrix without external maps
      float waveX = sin((uv.x * 12.0) + dispFactor * 4.0);
      float waveY = cos((uv.y * 12.0) + dispFactor * 4.0);
      float organicDisp = (waveX * waveY) * 0.5 + 0.5;

      // Combine original image luminosity with the wave math for a flawless liquid feel
      float displaceForce = mix(orig2.r, organicDisp, 0.4);

      vec2 distortedPosition1 = vec2(uv.x, uv.y + dispFactor * (displaceForce * intensity));
      vec2 distortedPosition2 = vec2(uv.x, uv.y - (1.0 - dispFactor) * (displaceForce * intensity));

      vec4 _currentImage = texture2D(currentImage, distortedPosition1);
      vec4 _nextImage    = texture2D(nextImage, distortedPosition2);

      gl_FragColor = mix(_currentImage, _nextImage, dispFactor);
    }
  `;

  const renderWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const renderHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x23272a, 1.0);
  renderer.setSize(renderWidth, renderHeight);
  parent.appendChild(renderer.domElement);

  // Textures
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';
  const sliderImages = images.map((img) => {
    const tex = loader.load(img.getAttribute('src') + '?v=' + Date.now());
    tex.magFilter = tex.minFilter = THREE.LinearFilter;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  });

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x23272a);

  const camera = new THREE.OrthographicCamera(
    renderWidth / -2, renderWidth / 2,
    renderHeight / 2, renderHeight / -2,
    1, 1000,
  );
  camera.position.z = 1;

  // Shader material
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      dispFactor: { value: 0.0 },
      currentImage: { value: sliderImages[0] },
      nextImage: { value: sliderImages[1] },
      uMouse: { value: new THREE.Vector2(0, 0) }
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    opacity: 1.0,
  });

  // Object-fit: cover logic for the PlaneGeometry
  const imgWidth = images[0].naturalWidth || renderWidth;
  const imgHeight = images[0].naturalHeight || renderHeight;
  const imgAspect = imgWidth / imgHeight;

  // Scale up by 5% to support the mouse parallax panning gracefully
  const SAFE_OVERFLOW = 1.05;
  const targetW = renderWidth * SAFE_OVERFLOW;
  const targetH = renderHeight * SAFE_OVERFLOW;
  const targetAspect = targetW / targetH;

  let geomW = targetW;
  let geomH = targetW / imgAspect;

  if (targetAspect < imgAspect) {
    geomH = targetH;
    geomW = targetH * imgAspect;
  }

  // Plane
  const geometry = new THREE.PlaneGeometry(geomW, geomH, 1);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(0, 0, 0);
  scene.add(mesh);

  // ── Shared transition logic ─────────────────────────────────────────────────
  const pagButtons = Array.from(
    document.getElementById('pagination')!.querySelectorAll('button'),
  ) as HTMLButtonElement[];

  let currentSlide = 0;
  let isAnimating = false;

  function goToSlide(slideId: number) {
    if (isAnimating || slideId === currentSlide) return;
    isAnimating = true;

    // Update active dot
    pagButtons[currentSlide].className = '';
    pagButtons[slideId].className = 'active';
    currentSlide = slideId;

    // Toggle glassmorphism header magically on first scroll
    const headerEl = document.getElementById('main-header');
    if (headerEl) {
      if (slideId > 0) headerEl.classList.add('scrolled');
      else headerEl.classList.remove('scrolled');
    }

    mat.uniforms.nextImage.value = sliderImages[slideId];

    gsap.to(mat.uniforms.dispFactor, {
      duration: 1,
      value: 1,
      ease: 'expo.inOut',
      onComplete() {
        mat.uniforms.currentImage.value = sliderImages[slideId];
        mat.uniforms.dispFactor.value = 0.0;
        // Reset scroll accumulation and unlock AFTER animation finishes
        scrollAccum = 0;
        isAnimating = false;
      },
    });

    const slideYearEl = document.getElementById('slide-year')!;
    const slideSubtitleEl = document.getElementById('slide-subtitle')!;
    const slideTitleEl = document.getElementById('slide-title')!;
    const slideDescEl = document.getElementById('slide-desc')!;

    const nextYear = document.querySelector(`[data-slide-year="${slideId}"]`)!.innerHTML;
    const nextSubtitle = document.querySelector(`[data-slide-subtitle="${slideId}"]`)!.innerHTML;
    const nextTitle = document.querySelector(`[data-slide-title="${slideId}"]`)!.innerHTML;
    const nextDesc = document.querySelector(`[data-slide-desc="${slideId}"]`)!.innerHTML;

    const animItems = [
      { el: slideYearEl, nextHTML: nextYear, delay: 0 },
      { el: slideSubtitleEl, nextHTML: nextSubtitle, delay: 0.05 },
      { el: slideTitleEl, nextHTML: nextTitle, delay: 0.1 },
      { el: slideDescEl, nextHTML: nextDesc, delay: 0.15 }
    ];

    animItems.forEach((item) => {
      // Exit animation (moves up)
      gsap.fromTo(
        item.el,
        { autoAlpha: 1, filter: 'blur(0px)', y: 0 },
        {
          duration: 0.5,
          autoAlpha: 0,
          filter: 'blur(20px)',
          y: -30,
          ease: 'power3.in',
          delay: item.delay,
          onComplete() {
            item.el.innerHTML = item.nextHTML;
            // Entrance animation (slides in from below)
            gsap.fromTo(
              item.el,
              { autoAlpha: 0, filter: 'blur(20px)', y: 40 },
              {
                duration: 0.9,
                autoAlpha: 1,
                filter: 'blur(0px)',
                y: 0,
                ease: 'power4.out',
                delay: 0.05
              }
            );
          },
        },
      );
    });
  }

  // ── Scroll (wheel) navigation ────────────────────────────────────────────────
  // Smooth approach:
  //  - Accumulate deltaY to distinguish intentional scrolls from trackpad
  //    inertia/micro-movements. A threshold must be crossed before advancing.
  //  - Once triggered, `isAnimating` blocks further triggers for the exact
  //    duration of the GSAP animation (reset in goToSlide's onComplete).
  //  - This avoids the choppy 1-second silence-timer while still being
  //    immune to trackpad momentum inertia events.

  const SCROLL_THRESHOLD = 60; // px of accumulated delta required to trigger
  let scrollAccum = 0;
  let accumRafId: number | null = null;

  const decayAccum = () => {
    // Gradually decay accumulation so a slow trickle never triggers
    scrollAccum *= 0.85;
    if (Math.abs(scrollAccum) > 1) {
      accumRafId = requestAnimationFrame(decayAccum);
    } else {
      scrollAccum = 0;
      accumRafId = null;
    }
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (isAnimating) return; // hard lock while GSAP is running

    // Cancel any passive decay and accumulate
    if (accumRafId !== null) {
      cancelAnimationFrame(accumRafId);
      accumRafId = null;
    }

    scrollAccum += e.deltaY;

    if (Math.abs(scrollAccum) >= SCROLL_THRESHOLD) {
      const dir = scrollAccum > 0 ? 1 : -1;
      scrollAccum = 0; // reset immediately so it won't double-fire
      if (dir > 0) {
        goToSlide(Math.min(currentSlide + 1, sliderImages.length - 1));
      } else {
        goToSlide(Math.max(currentSlide - 1, 0));
      }
    } else {
      // Start decaying so lingering inertia doesn't build up
      accumRafId = requestAnimationFrame(decayAccum);
    }
  };
  window.addEventListener('wheel', onWheel, { passive: false });

  // ── Touch swipe navigation ───────────────────────────────────────────────────
  let touchStartY = 0;
  const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
  const onTouchEnd = (e: TouchEvent) => {
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) goToSlide(Math.min(currentSlide + 1, sliderImages.length - 1));
    else goToSlide(Math.max(currentSlide - 1, 0));
  };
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });

  // ── Resize ───────────────────────────────────────────────────────────────────
  const onResize = () => {
    const rw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const rh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    renderer.setSize(rw, rh);
    camera.left = rw / -2;
    camera.right = rw / 2;
    camera.top = rh / 2;
    camera.bottom = rh / -2;
    camera.updateProjectionMatrix();

    // Recompute object-fit cover geometry
    const SAFE_OVERFLOW = 1.01;
    const tW = rw * SAFE_OVERFLOW;
    const tH = rh * SAFE_OVERFLOW;
    const tAsp = tW / tH;
    let gW = tW;
    let gH = tW / imgAspect;
    if (tAsp < imgAspect) {
      gH = tH;
      gW = tH * imgAspect;
    }
    mesh.geometry.dispose();
    mesh.geometry = new THREE.PlaneGeometry(gW, gH, 1);
  };
  window.addEventListener('resize', onResize);

  // ── Mouse Tracking Parallax ──────────────────────────────────────────────────
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  const onMouseMove = (e: MouseEvent) => {
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  };
  window.addEventListener('mousemove', onMouseMove);

  // ── Render loop ──────────────────────────────────────────────────────────────
  let rafId: number;
  const animate = () => {
    rafId = requestAnimationFrame(animate);

    // Lerp mouse for buttery smooth parallax
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    mat.uniforms.uMouse.value.set(mouseX, mouseY);

    renderer.render(scene, camera);
  };
  animate();

  // ── Cleanup (returned to useEffect) ─────────────────────────────────────────
  return () => {
    if (accumRafId !== null) cancelAnimationFrame(accumRafId);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMouseMove);
    cancelAnimationFrame(rafId);
    renderer.dispose();
    renderer.domElement.remove();
  };
}
