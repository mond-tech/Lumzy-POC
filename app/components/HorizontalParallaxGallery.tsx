"use client";
 
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import imagesLoaded from "imagesloaded";
 
// --- SHADERS ---
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
  vec2 uv = coverUv(vUv, uResolution, uImageResolution);
  uv.x += uParallax;
  uv -= 0.5;
  uv *= uUvScale;
  uv += 0.5;
  vec3 col = texture2D(uTexture, uv).rgb;
  gl_FragColor = vec4(col, 1.);
}
`;
 
class GLMedia {
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  bounds: DOMRect;
  private initialX: number = 0;
  parallaxIntensity: number = 0.4;
 
  constructor(
    private element: HTMLElement,
    private scene: THREE.Group,
    private viewport: { width: number; height: number },
    geometry: THREE.BufferGeometry
  ) {
    this.bounds = this.element.getBoundingClientRect();
    this.initialX = this.bounds.left;
 
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2(this.bounds.width, this.bounds.height) },
        uImageResolution: { value: new THREE.Vector2(1, 1) },
        uParallax: { value: 0 },
        uUvScale: { value: 0.75 }, // Premium deep parallax zoom
      },
      vertexShader: mediaVertexShader,
      fragmentShader: mediaFragmentShader,
    });
 
    const loader = new THREE.TextureLoader();
    loader.load(this.element.getAttribute("src") || "", (text) => {
      this.material.uniforms.uTexture.value = text;
      this.material.uniforms.uImageResolution.value.set(text.image.width, text.image.height);
    });
 
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.scale.set(this.bounds.width, this.bounds.height, 1);
    this.scene.add(this.mesh);
  }
 
  dispose() {
    const texture = this.material.uniforms.uTexture.value as THREE.Texture | null;
    if (texture) {
      texture.dispose();
    }
    this.material.dispose();
  }
 
  updateScale(currentScroll: number = 0) {
    const rect = this.element.getBoundingClientRect();
    this.bounds = rect;
    this.initialX = rect.left + currentScroll;
    this.mesh.scale.set(rect.width, rect.height, 1);
    this.material.uniforms.uResolution.value.set(rect.width, rect.height);
  }
 
  render(scroll: number) {
    const currentX = this.initialX - scroll;
    const x = currentX - this.viewport.width / 2 + this.bounds.width / 2;
    const y = -this.bounds.top + this.viewport.height / 2 - this.bounds.height / 2;
    this.mesh.position.set(x, y, 0);
 
    const elementLeft = currentX;
    const elementRight = elementLeft + this.bounds.width;
    const { innerWidth } = window;
 
    if (elementRight >= 0 && elementLeft <= innerWidth) {
      const elementCenter = elementLeft + this.bounds.width / 2;
      const viewportCenter = innerWidth / 2;
      const distance = (elementCenter - viewportCenter) / innerWidth;
      this.material.uniforms.uParallax.value = distance * this.parallaxIntensity;
    }
  }
 
  onResize(viewport: { width: number; height: number }, currentScroll: number) {
    this.viewport = viewport;
    this.updateScale(currentScroll);
  }
}
 
export default function HorizontalParallaxGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef({ value: 0, target: 0, ease: 0.05, limit: 0 });
  const images = Array.from({ length: 10 }, (_, i) => `/HorizontalParallaxGallery/${i + 1}.png`);
 
  useEffect(() => {
    if (!glRef.current || !containerRef.current) return;
 
    document.documentElement.classList.add("js");
    document.body.classList.add("loading");
    document.body.style.overflow = "hidden";
 
    const width = window.innerWidth;
    const height = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    glRef.current.appendChild(renderer.domElement);
 
    const scene = new THREE.Scene();
    const fov = 2 * Math.atan(height / 2 / 100) * (180 / Math.PI);
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.01, 1000);
    camera.position.set(0, 0, 100);
 
    const group = new THREE.Group();
    scene.add(group);
 
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const imgElements = Array.from(containerRef.current.querySelectorAll("img"));
    const glMedias = imgElements.map(el => new GLMedia(el, group, { width, height }, geometry));
 
    const clamp = (min: number, max: number, value: number) => Math.min(Math.max(value, min), max);
    const lerp = (start: number, end: number, t: number) => start + (end - start) * t;
 
    const updateLimit = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        scrollRef.current.limit = containerRef.current.scrollWidth - containerRef.current.parentElement.clientWidth;
      }
    };
 
    const handleWheel = (e: WheelEvent) => {
      scrollRef.current.target += e.deltaY;
    };
 
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.fov = 2 * Math.atan(h / 2 / 100) * (180 / Math.PI);
      camera.updateProjectionMatrix();
      updateLimit();
      glMedias.forEach(m => m.onResize({ width: w, height: h }, scrollRef.current.value));
    };
 
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("resize", handleResize);
 
    imagesLoaded(containerRef.current, () => {
      document.body.classList.remove("loading");
      updateLimit();
      glMedias.forEach(m => m.updateScale(scrollRef.current.value));
    });
 
    const update = () => {
      const s = scrollRef.current;
      s.target = clamp(0, s.limit, s.target);
      s.value = lerp(s.value, s.target, s.ease);
 
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${-s.value}px, 0, 0)`;
      }
 
      glMedias.forEach(m => m.render(s.value));
      renderer.render(scene, camera);
    };
 
    gsap.ticker.add(update);
 
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(update);
      glMedias.forEach(m => m.dispose());
      geometry.dispose();
      renderer.dispose();
      if (glRef.current) glRef.current.innerHTML = "";
      document.body.classList.remove("loading");
      document.body.style.overflow = "";
    };
  }, []);
 
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap');
        :root {
          font-size: 15px;
          --color-text: #fff;
          --color-bg: #000;
          --color-link: #fff;
          --color-link-hover: #fff;
          --page-padding: 1.5rem;
        }
        body { margin: 0; background-color: var(--color-bg); color: var(--color-text); font-family: 'Syne', sans-serif; overflow: hidden; -webkit-font-smoothing: antialiased; }
        canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; }
        .frame {
          padding: 2.5rem;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          display: flex;
          justify-content: center;
          pointer-events: none;
          text-transform: uppercase;
        }
        .frame__title { font-size: 1.5rem; margin: 0; font-weight: 700; letter-spacing: 0.3rem; }
        .content { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .gallery__wrapper__gl { width: 100%; overflow: hidden; }
        .gallery__image__container__gl { display: flex; align-items: center; gap: 2vw; padding: 0 5vw; will-change: transform; }
        .gallery__media__gl { flex-shrink: 0; width: 60vh; height: 45vh; position: relative; overflow: hidden; }
        @media screen and (min-width: 53em) {
           .gallery__media__gl { width: 70vh; height: 55vh; }
        }
        .gallery__media__image__gl { width: 100%; height: 100%; object-fit: cover; opacity: 0; }
        body.loading .content { opacity: 0; }
        .loading::before { content: ''; position: fixed; z-index: 2000; top: 0; left: 0; width: 100%; height: 100%; background: var(--color-bg); }
      `}} />
 
      <div ref={glRef} />
 
      <header className="frame">
        <h1 className="frame__title">Lumzy Gallery</h1>
      </header>
 
      <main className="content">
        <div className="gallery__wrapper__gl">
          <div className="gallery__image__container__gl" ref={containerRef}>
            {images.map((src, i) => (
              <picture key={i} className="gallery__media__gl">
                <img src={src} alt={`Image ${i + 1}`} className="gallery__media__image__gl" draggable="false" />
              </picture>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
 
 