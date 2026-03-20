"use client";
 
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import imagesLoaded from "imagesloaded";
 
const mediaVertexShader = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
 
const mediaFragmentShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform float uParallax;
uniform float uUvScale;
uniform float uShaderMultiplier;
uniform float uHover;
uniform float uInView;
uniform float uSpeed;
 
vec2 coverUv(vec2 uv, vec2 resolution, vec2 imageResolution) {
  vec2 ratio = vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );
 
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}
 
void main() {
  // Use vUv directly to avoid any internal 'cover' cropping
  vec2 uv = vUv;
  uv.x += uParallax * uShaderMultiplier;
 
  // Combined interactions: scroll focus + hover
  float combined = max(uHover, uInView);
 
  // NO inner zoom - show full image in its placeholder
  float zoom = uUvScale;
  uv -= 0.5;
  uv *= zoom;
  uv += 0.5;
 
  // Multi-sampling for Chromatic Aberration remains as a stylistic choice
  float shift = uSpeed * 0.045;
  float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;
  vec3 col = vec3(r, g, b);
 
  // Grayscale and Color transition logic remains
  float gray = dot(col, vec3(0.299, 0.587, 0.114));
  float contrast = 1.15;
  gray = clamp((gray - 0.5) * contrast + 0.5, 0.0, 1.0);
  vec3 grayscaleCol = vec3(gray);
 
  float hoverT = smoothstep(0.0, 1.0, combined);
  vec3 vibrantCol = col * 1.08;
  col = mix(grayscaleCol, vibrantCol, hoverT);
 
  gl_FragColor = vec4(col, 1.0);
}
`;
 
interface IBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}
 
interface GLMediaOptions {
  scene: THREE.Group;
  element: HTMLImageElement;
  geometry: THREE.BufferGeometry;
  viewport: { width: number; height: number };
  scroll: number;
}
 
type Project = {
  title: string;
  description: string;
  src: string;
  bgColor: string;
  textColor: string;
};
 
class GLMedia {
  scene: THREE.Group;
  element: HTMLImageElement;
  geometry: THREE.BufferGeometry;
  viewport: { width: number; height: number };
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  bounds: IBounds;
  parallaxIntensity: number;
  currentDistance: number = 0;
 
  constructor({ scene, element, geometry, viewport, scroll }: GLMediaOptions) {
    this.scene = scene;
    this.element = element;
    this.geometry = geometry;
    this.viewport = viewport;
    this.parallaxIntensity = 0.4;
 
    this.bounds = { left: 0, top: 0, width: 0, height: 0 };
    this.mesh = new THREE.Mesh(); // dummy initially
 
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uImageResolution: { value: new THREE.Vector2(1, 1) },
        uParallax: { value: 0 },
        uUvScale: { value: 0.85 },
        uShaderMultiplier: { value: 1.0 },
        uHover: { value: 0 },
        uInView: { value: 0 },
        uSpeed: { value: 0 },
      },
      vertexShader: mediaVertexShader,
      fragmentShader: mediaFragmentShader,
      transparent: true,
    });
 
    const loader = new THREE.TextureLoader();
    loader.load(element.getAttribute("src") || "", (tex) => {
      tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
      this.material.uniforms.uTexture.value = tex;
      this.material.uniforms.uImageResolution.value.set(tex.image.width, tex.image.height);
    });
 
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.updateFromElement(element, scroll);
    scene.add(this.mesh);
  }
 
  dispose() {
    const texture = this.material.uniforms.uTexture.value as THREE.Texture | null;
    if (texture) texture.dispose();
    this.material.dispose();
  }
 
  updateFromElement(element: HTMLImageElement, scroll: number = 0) {
    const rect = element.getBoundingClientRect();
    this.bounds = {
      left: rect.left + scroll,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
    this.mesh.scale.set(this.bounds.width, this.bounds.height, 1);
    this.material.uniforms.uResolution.value.set(this.bounds.width, this.bounds.height);
  }
 
  render(scroll: number, speed: number) {
    const elementLeft = this.bounds.left - scroll;
    const viewportWidth = this.viewport.width;
    const elementCenter = elementLeft + this.bounds.width / 2;
    const viewportCenter = viewportWidth / 2;
    const distance = (elementCenter - viewportCenter) / viewportWidth;
 
    this.currentDistance = distance; // Track distance for background logic
 
 
    // Ferris Wheel / Circular Path
    // Calibrated to keep items on-screen for longer
    const arcAngle = distance * 1.1;
    const arcRadius = viewportWidth * 1.0;
 
    // Base Circular Arc Position
    const arcX = Math.sin(arcAngle) * arcRadius;
    const arcY = (Math.cos(arcAngle) - 1.0) * arcRadius;
    const tiltOffset = distance * -140;
 
    this.mesh.position.set(arcX, arcY + tiltOffset, 0);
    this.mesh.rotation.z = -arcAngle * 0.45;
 
    // Update uniforms
    this.material.uniforms.uSpeed.value = speed;
 
    const combinedFactor = Math.max(
      this.material.uniforms.uHover.value,
      this.material.uniforms.uInView.value
    );
    const scaleFactor = 1 + combinedFactor * 0.25;
    this.mesh.scale.set(this.bounds.width * scaleFactor, this.bounds.height * scaleFactor, 1);
 
    // Parallax & Scroll Popping visibility check (widened for arc)
    const elementRight = elementLeft + this.bounds.width;
    if (elementRight >= -viewportWidth * 0.5 && elementLeft <= viewportWidth * 1.5) {
      this.material.uniforms.uParallax.value = distance * this.parallaxIntensity;
 
      // Scroll focus factor: widened so first/last items have more presence
      const scrollFocus = Math.pow(Math.max(0, 1.2 - Math.abs(distance * 1.6)), 1.2);
      this.material.uniforms.uInView.value = scrollFocus;
    } else {
      this.material.uniforms.uInView.value = 0;
    }
  }
 
  onResize(viewport: { width: number; height: number }, element: HTMLImageElement, scroll: number = 0) {
    this.viewport = viewport;
    this.updateFromElement(element, scroll);
  }
 
  setControls(parallaxIntensity: number, uvScale: number, shaderMultiplier: number) {
    this.parallaxIntensity = parallaxIntensity;
    this.material.uniforms.uUvScale.value = uvScale;
    this.material.uniforms.uShaderMultiplier.value = shaderMultiplier;
  }
 
  onMouseEnter() {
    gsap.to(this.material.uniforms.uHover, {
      value: 1,
      duration: 0.8,
      ease: "power2.out",
    });
  }
 
  onMouseLeave() {
    gsap.to(this.material.uniforms.uHover, {
      value: 0,
      duration: 0.8,
      ease: "power2.out",
    });
  }
}
 
export default function HorizontalParallaxGallery() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const shaderControls = useMemo(
    () => ({
      parallaxIntensity: 0.0, // Disabled to show full image without edge bleed
      uvScale: 1.0, // Set to 1.0 to show the entire original artwork
      shaderMultiplier: 1.0,
    }),
    []
  );
 
  const projects: Project[] = useMemo(
    () => [
      {
        title: "Enterprise Resource Planning (ERP) System",
        description: "Custom ERP solution to streamline operations, finance, and HR for enterprises.",
        src: "/HorizontalParallaxGallery/1.jpg",
        bgColor: "#F0F4F8", // Soft cool gray-blue
        textColor: "#1A202C",
      },
      {
        title: "AI Customer Support Chatbot",
        description: "Automated chatbot that handles queries, bookings, and support using AI.",
        src: "/HorizontalParallaxGallery/ai_chatbot.jpg",
        bgColor: "#0F172A", // Brighter navy for better atmospheric visibility
        textColor: "#00F2FF",
      },
      {
        title: "E-Commerce Platform Development",
        description: "Scalable online store with payment integration, admin panel, and analytics.",
        src: "/HorizontalParallaxGallery/ecommerce.jpg",
        bgColor: "#0F1629", // More colorful deep blue
        textColor: "#FFAB00",
      },
      {
        title: "Healthcare Management System",
        description: "Digital platform for patient records, appointments, and telemedicine.",
        src: "/HorizontalParallaxGallery/healthcare.jpg",
        bgColor: "#0E1E3F", // Brighter blue
        textColor: "#4FD1C5",
      },
      {
        title: "Real Estate Listing Platform",
        description: "Property listing system with filters, virtual tours, and agent dashboards.",
        src: "/HorizontalParallaxGallery/realestate.jpg",
        bgColor: "#290F29", // Brighter purple
        textColor: "#E9D8FD",
      },
      {
        title: "FinTech Dashboard & Analytics",
        description: "Secure financial dashboard with transaction tracking and insights.",
        src: "/HorizontalParallaxGallery/6.jpg",
        bgColor: "#1E1B4B", // Brighter indigo
        textColor: "#F6AD55",
      },
      {
        title: "Logistics & Fleet Management System",
        description: "Track shipments, optimize routes, and manage fleet operations in real-time.",
        src: "/HorizontalParallaxGallery/7.jpg",
        bgColor: "#111827",
        textColor: "#CBD5E0",
      },
      {
        title: "Learning Management System (LMS)",
        description: "Online education platform with courses, assessments, and progress tracking.",
        src: "/HorizontalParallaxGallery/8.jpg",
        bgColor: "#0F172A",
        textColor: "#81E6D9",
      },
      {
        title: "SaaS CRM Platform",
        description: "Customer relationship management tool for sales tracking and automation.",
        src: "/HorizontalParallaxGallery/9.jpg",
        bgColor: "#064E3B", // Forest green
        textColor: "#90CDF4",
      },
      {
        title: "Smart Booking & Reservation System",
        description: "Booking engine for hotels, events, and services with real-time availability.",
        src: "/HorizontalParallaxGallery/10.jpg",
        bgColor: "#111827",
        textColor: "#63B3ED",
      },
    ],
    []
  );
 
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    const canvasHost = canvasHostRef.current;
    if (!wrapper || !container || !canvasHost) return;
 
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
 
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(viewport.width, viewport.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasHost.appendChild(renderer.domElement);
 
    const scene = new THREE.Scene();
    const group = new THREE.Group();
    scene.add(group);
 
    // Smooth scroll state
    const scrollRef = { value: 0, target: 0, ease: 0.025, limit: 0 };
    const clamp = (min: number, max: number, value: number) => Math.min(Math.max(value, min), max);
    const lerp = (start: number, end: number, t: number) => start + (end - start) * t;
 
    // DOM images exist for layout + measuring. WebGL overlays them.
    const imgElements = Array.from(
      container.querySelectorAll<HTMLImageElement>(".gallery__media__image__dom")
    );
 
    const glMedias = imgElements.map((el) => {
      const media = new GLMedia({
        scene: group,
        element: el,
        geometry,
        viewport,
        scroll: scrollRef.value,
      });
      // Ensure initial scale matches current layout.
      media.onResize(viewport, el);
      media.setControls(
        shaderControls.parallaxIntensity,
        shaderControls.uvScale,
        shaderControls.shaderMultiplier
      );
 
      // Add hover listeners to the parent container
      const parent = el.closest(".gallery__item__gl");
      if (parent) {
        const onEnter = () => media.onMouseEnter();
        const onLeave = () => media.onMouseLeave();
        parent.addEventListener("mouseenter", onEnter);
        parent.addEventListener("mouseleave", onLeave);
 
        // Store listeners for cleanup if needed, but since we recreate on shaderControls change
        // we should really clean them up.
        (parent as any)._onEnter = onEnter;
        (parent as any)._onLeave = onLeave;
      }
 
      return media;
    });
 
 
 
    let oneSetWidth = 0;
    const updateLimit = () => {
      const gap = parseFloat(getComputedStyle(container).gap) || 0;
      oneSetWidth = (container.scrollWidth + gap) / 3;
      scrollRef.limit = container.scrollWidth;
      // Start at the beginning of the middle set for infinite feel
      if (scrollRef.target === 0) {
        scrollRef.target = scrollRef.value = oneSetWidth;
      }
    };
 
    const updateScales = () => {
      glMedias.forEach((m, i) =>
        m.onResize({ width: window.innerWidth, height: window.innerHeight }, imgElements[i], scrollRef.value)
      );
    };
 
    const handleWheel = (e: WheelEvent) => {
      // High-precision scroll normalization for premium feel
      const modeFactor = e.deltaMode === 1 ? 25 : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta = e.deltaY * modeFactor * 0.7;
      scrollRef.target += delta;
    };
 
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      viewport.width = w;
      viewport.height = h;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.fov = 2 * Math.atan(h / 2 / 100) * (180 / Math.PI);
      camera.updateProjectionMatrix();
      updateLimit();
      updateScales();
    };
 
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("resize", handleResize);
 
    // Wait for images before first measurements.
    imagesLoaded(container, () => {
      updateLimit();
      updateScales();
      if (wrapperRef.current) wrapperRef.current.style.opacity = "1";
      document.body.classList.remove("loading");
 
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          updateLimit();
          updateScales();
        });
      }
 
      // Restore and animate the main heading
      const heading = document.querySelector(".galleryHeading");
      if (heading) {
        gsap.fromTo(
          heading,
          { autoAlpha: 0, y: 24, filter: "blur(8px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "expo.out",
            delay: 0.6,
          }
        );
      }
    });
 
    let lastSentProjectIndex = -1;
    const update = () => {
      scrollRef.value = lerp(scrollRef.value, scrollRef.target, scrollRef.ease);
      if (Math.abs(scrollRef.target - scrollRef.value) < 0.05) {
        scrollRef.value = scrollRef.target;
      }
 
      // Seamless Infinite Loop Snapping
      if (scrollRef.target > oneSetWidth * 2) {
        scrollRef.target -= oneSetWidth;
        scrollRef.value -= oneSetWidth;
      } else if (scrollRef.target < oneSetWidth) {
        scrollRef.target += oneSetWidth;
        scrollRef.value += oneSetWidth;
      }
 
      // Smooth horizontal scroll
      container.style.transform = `translate3d(${-scrollRef.value}px, 0, 0)`;
 
      // Velocity for Chromatic Aberration
      const velocity = (scrollRef.target - scrollRef.value) / window.innerWidth;
 
      // WebGL overlay render
      glMedias.forEach((m) => m.render(scrollRef.value, velocity));
 
      // Dynamic Background color logic: find the closest item to center
      let closestMediaIndex = -1;
      let minDistance = 9999;
      glMedias.forEach((m, i) => {
        const d = Math.abs(m.currentDistance);
        if (d < minDistance) {
          minDistance = d;
          closestMediaIndex = i;
        }
      });
 
      if (closestMediaIndex !== -1) {
        const projectIndex = closestMediaIndex % projects.length;
        if (projectIndex !== lastSentProjectIndex) {
          lastSentProjectIndex = projectIndex;
          const targetColor = projects[projectIndex].bgColor;
          const targetTextColor = projects[projectIndex].textColor;
 
          gsap.to([document.body, rootRef.current], {
            backgroundColor: targetColor,
            duration: 1.2,
            ease: "sine.inOut",
            overwrite: "auto",
          });
 
          // Sync the main heading color with the project theme
          const headingEl = document.querySelector(".galleryHeading");
          if (headingEl) {
            gsap.to(headingEl, {
              color: targetTextColor,
              duration: 1.0,
              overwrite: "auto",
            });
          }
        }
      }
 
      renderer.render(scene, camera);
    };
 
    // NOTE: camera must be defined before update() closure; define it now.
    const camera = new THREE.PerspectiveCamera(
      2 * Math.atan(viewport.height / 2 / 100) * (180 / Math.PI),
      viewport.width / viewport.height,
      0.01,
      1000
    );
    camera.position.set(0, 0, 100);
 
    // Start loop
    gsap.ticker.add(update);
 
    const layoutObserver = new ResizeObserver(() => {
      updateLimit();
      updateScales();
    });
    layoutObserver.observe(wrapper);
    layoutObserver.observe(container);
 
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(update);
 
      layoutObserver.disconnect();
 
      glMedias.forEach((m) => {
        const parent = m.bounds.height > 0 ? imgElements[glMedias.indexOf(m)]?.closest(".gallery__item__gl") : null;
        if (parent) {
          if ((parent as any)._onEnter) parent.removeEventListener("mouseenter", (parent as any)._onEnter);
          if ((parent as any)._onLeave) parent.removeEventListener("mouseleave", (parent as any)._onLeave);
        }
        m.dispose();
      });
      geometry.dispose();
      renderer.dispose();
 
      container.style.transform = "";
      if (canvasHost.firstChild) canvasHost.removeChild(canvasHost.firstChild);
    };
  }, [shaderControls]);
 
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          :root {
            --color-text: #fff;
            --color-bg: #000;
            --page-padding: clamp(0.75rem, 1.5vw, 1.5rem);
          }
          body { margin: 0; background-color: var(--color-bg); color: var(--color-text); font-family: 'Space Grotesk', sans-serif; overflow: hidden; -webkit-font-smoothing: antialiased; }
          canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; }
 
          .content {
            width: 100vw;
            height: 100dvh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            padding: var(--page-padding);
            z-index: 20;
          }
 
          .galleryHeading {
            position: absolute;
            top: clamp(1.5rem, 5vh, 4rem);
            left: 0;
            width: 100%;
            margin: 0;
            font-size: clamp(1.75rem, 4vw, 3.2rem);
            font-weight: 700; /* Maximum bold weight for Space Grotesk */
            letter-spacing: 0.06rem;
            text-align: center;
            line-height: 1.05;
            opacity: 0;
            will-change: transform, opacity, filter;
            z-index: 100; /* Ensure it stays above all content and canvas */
          }
 
          .gallery__wrapper__gl {
            position: relative;
            width: 100%;
            height: auto;
            overflow: hidden;
            user-select: none;
          }
 
 
          .gallery__image__container__gl {
            display: flex;
            align-items: center;
            gap: 12vw; /* Reduced whitespace for a more cohesive grid flow */
            will-change: transform;
            height: 100%;
          }
 
          .gallery__item__gl {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            width: clamp(220px, 45vw, 440px);
            cursor: pointer;
            position: relative; /* Anchor for the bleeding text info */
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
 
          .gallery__item__gl:hover {
            transform: translateY(-8px);
          }
 
          /* Codrops-style card media sizing */
          .gallery__media__gl {
            flex-shrink: 0;
            aspect-ratio: 16 / 9;
            width: 100%;
            height: auto;
            position: relative;
            overflow: hidden;
            display: block;
          }
 
          /* DOM image is used for measuring/layout only; WebGL overlays it */
          .gallery__media__image__dom {
            position: absolute;
            opacity: 0;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
 
          .gallery__item__info {
            position: absolute;
            top: -2.5rem; /* Bleed over the top edge */
            left: -3rem;  /* Bleed over the left edge */
            width: calc(100% + 6rem);
            height: calc(100% + 5rem);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: clamp(1.5rem, 3.5vw, 3rem);
            text-align: center;
            background: transparent;
            pointer-events: none;
            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 5;
          }
 
          .gallery__item__gl:hover .gallery__item__info {
            transform: scale(1.05) translate(10px, -10px);
          }
 
          .gallery__item__title {
            margin: 0;
            font-size: clamp(1.2rem, 1.8vw, 1.6rem);
            font-weight: 700;
            letter-spacing: clamp(0.02rem, 0.1vw, 0.08rem);
            text-transform: uppercase;
            line-height: 1.1;
            word-break: break-word;
            text-shadow: 0 2px 10px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.6);
          }
 
          .gallery__item__description {
            margin: 0.85rem 0 0;
            font-size: clamp(0.85rem, 1vw, 0.95rem);
            opacity: 0;
            transform: translateY(12px);
            transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
            line-height: 1.5;
            word-break: break-word;
            max-width: 400px;
            color: #000;
          }
 
          .gallery__item__gl:hover .gallery__item__description {
             opacity: 1; /* Maximum readability */
             transform: translateY(0);
          }
 
          .gallery__item__button {
            margin-top: 1.5rem;
            padding: 0.75rem 1.75rem;
            font-family: "Space Grotesk", sans-serif;
            font-size: clamp(0.7rem, 0.8vw, 0.8rem);
            font-weight: 800;
            letter-spacing: 0.12rem;
            text-transform: uppercase;
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.4);
            cursor: pointer;
            opacity: 0;
            transform: translateY(15px);
            transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
            pointer-events: auto;
            backdrop-filter: blur(4px);
          }
 
          .gallery__item__gl:hover .gallery__item__button {
            opacity: 1;
            transform: translateY(0);
          }
 
          .gallery__item__button:hover {
            background: #fff;
            color: #000;
            border-color: #fff;
          }
        `,
        }}
      />
 
      <div className="gallery__root" ref={rootRef} style={{ width: '100vw', minHeight: '100dvh', transition: 'background-color 1s ease' }}>
        <div ref={canvasHostRef} />
 
        <h2 className="galleryHeading">Lumzy Project Gallery</h2>
 
        <main className="content">
          <div className="gallery__wrapper__gl" ref={wrapperRef}>
            <div className="gallery__image__container__gl" ref={containerRef}>
              {/* Loop projects 3 times to create a seamless infinite scroll buffer */}
              {[...projects, ...projects, ...projects].map((p, i) => (
                <div className="gallery__item__gl" key={`${p.src}-${i}`}>
                  <div className="gallery__media__gl">
                    <img
                      src={p.src}
                      alt={p.title}
                      className="gallery__media__image__dom"
                      draggable={false}
                    />
                  </div>
                  {/* Info is now a sibling to media inside the card to allow edge bleeding */}
                  <div className="gallery__item__info">
                    <h3 className="gallery__item__title" style={{ color: p.textColor }}>{p.title}</h3>
                    <p className="gallery__item__description" style={{ color: p.textColor }}>{p.description}</p>
                    <button className="gallery__item__button">View Project</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
 
 