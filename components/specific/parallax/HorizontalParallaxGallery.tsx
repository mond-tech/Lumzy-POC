"use client";
 
import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import imagesLoaded from "imagesloaded";
import gsap from "gsap";
 
const vertexShader = `
precision highp float;
varying vec2 vUv;
uniform float uSpeed;
uniform float uFocusScale;
 
void main() {
  vUv = uv;
  vec3 pos = position;
 
  float distortion = sin(uv.x * 3.1415) * uSpeed * 3.0;
  pos.z += distortion;
 
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;
 
const fragmentShader = `
precision highp float;
 
varying vec2 vUv;
 
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform float uParallax;
uniform float uUvScale;
uniform float uShaderMultiplier;
uniform float uHover;
uniform float uSpeed;
uniform float uBlur;
uniform float uFocus;
 
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
  uv.x += uParallax * uShaderMultiplier;
 
  float zoom = mix(uUvScale, uUvScale * 0.95, uHover);
  uv -= 0.5;
  uv *= zoom;
  uv += 0.5;
 
  float blurAmount = uBlur * 0.015;
  vec3 col = vec3(0.0);
  float shift = abs(uSpeed) * 0.15;
 
  if(blurAmount > 0.001) {
    col.r = texture2D(uTexture, uv + vec2(shift + blurAmount, blurAmount)).r;
    col.g = texture2D(uTexture, uv + vec2(0.0, 0.0)).g;
    col.b = texture2D(uTexture, uv - vec2(shift + blurAmount, blurAmount)).b;
    col += texture2D(uTexture, uv + vec2(-blurAmount, -blurAmount)).rgb;
    col += texture2D(uTexture, uv + vec2(blurAmount, -blurAmount)).rgb;
    col += texture2D(uTexture, uv + vec2(-blurAmount, blurAmount)).rgb;
    col /= 4.0;
  } else {
    col.r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
    col.g = texture2D(uTexture, uv).g;
    col.b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;
  }
 
  float brightness = mix(0.4, 1.15, uFocus);
  col *= brightness;
  col = mix(col, col * 1.15, uHover);
 
  gl_FragColor = vec4(col, 1.);
}
`;
 
const reflectionFragmentShader = `
precision highp float;
 
varying vec2 vUv;
 
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform float uParallax;
uniform float uUvScale;
uniform float uShaderMultiplier;
uniform float uSpeed;
uniform float uFocus;
uniform float uTime;
 
float random(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
 
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
  float roughness = 0.003;
  float distortion = (random(vUv * 50.0 + uTime * 0.5) - 0.5) * roughness;
 
  vec2 uv = coverUv(vec2(vUv.x + distortion, 1.0 - vUv.y + distortion), uResolution, uImageResolution);
  uv.x += uParallax * uShaderMultiplier;
  uv -= 0.5;
  uv *= uUvScale;
  uv += 0.5;
 
  float blurAmount = 0.005 + (1.0 - vUv.y) * 0.015;
  vec3 col = vec3(0.0);
  col += texture2D(uTexture, uv + vec2(blurAmount, blurAmount)).rgb;
  col += texture2D(uTexture, uv + vec2(-blurAmount, blurAmount)).rgb;
  col += texture2D(uTexture, uv + vec2(blurAmount, -blurAmount)).rgb;
  col += texture2D(uTexture, uv + vec2(-blurAmount, -blurAmount)).rgb;
  col /= 4.0;
 
  col *= vec3(0.8, 0.85, 1.0);
  float fade = pow(vUv.y, 4.0) * 0.4 * uFocus;
 
  gl_FragColor = vec4(col, fade);
}
`;
 
const backgroundVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;
 
const backgroundFragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
 
float random(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
 
void main() {
  vec2 uv = vUv;
  vec2 p1 = vec2(0.5 + 0.3 * cos(uTime * 0.2), 0.5 + 0.3 * sin(uTime * 0.3));
  vec2 p2 = vec2(0.5 + 0.4 * sin(uTime * 0.5), 0.5 + 0.2 * cos(uTime * 0.4));
 
  float d1 = 1.0 - smoothstep(0.0, 0.9, distance(uv, p1));
  float d2 = 1.0 - smoothstep(0.0, 0.8, distance(uv, p2));
 
  vec3 col = vec3(0.03, 0.03, 0.035);
  col += uColor * (d1 * 0.12 + d2 * 0.08);
 
  float grain = random(uv * uTime) * 0.04;
  col += grain;
 
  gl_FragColor = vec4(col, 1.0);
}
`;
 
const constellationVertexShader = `
uniform float uTime;
uniform vec2 uMouse;
attribute float aOffset;
varying float vAlpha;
 
void main() {
  vec3 pos = position;
  pos.x += sin(uTime * 0.5 + aOffset) * 2.0;
  pos.y += cos(uTime * 0.7 + aOffset) * 2.0;
 
  float dist = distance(pos.xy, uMouse);
  float attraction = 1.0 - smoothstep(0.0, 200.0, dist);
  vAlpha = 0.2 + attraction * 0.8;
 
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (2.0 + attraction * 3.0) * (50.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;
 
const constellationFragmentShader = `
precision highp float;
varying float vAlpha;
uniform vec3 uColor;
 
void main() {
  float r = distance(gl_PointCoord, vec2(0.5));
  if (r > 0.5) discard;
 
  float glow = 1.0 - smoothstep(0.0, 0.5, r);
  gl_FragColor = vec4(uColor, vAlpha * glow);
}
`;
 
const clamp = (min: number, max: number, value: number) => Math.max(min, Math.min(max, value));
const lerp = (start: number, end: number, t: number) => start + (end - start) * t;
 
export default function HorizontalParallaxGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
 
  const projects = useMemo(() => [
    {
      title: "ERP SYSTEM",
      desc: "OPERATIONS CORE",
      features: "OPERATE • OPTIMIZE • ADVANCE",
      src: "/HorizontalParallaxGallery/erp_v2.png",
      color: "#00D1FF",
      titleColor: "#E6F1FF",
      descColor: "rgba(230, 241, 255, 0.65)",
      ctaColor: "#00D1FF",
      hasGlow: true
    },
    {
      title: "NEURAL NETWORK",
      desc: "AI CHATBOT V2",
      features: "CONVERSE • LEARN • ASSIST",
      src: "/HorizontalParallaxGallery/ai_v2.png",
      color: "#0ea5e9",
      titleColor: "#E0F2FE",
      descColor: "rgba(224, 242, 254, 0.65)",
      ctaColor: "#0ea5e9",
      hasGlow: true
    },
    {
      title: "E-COM ENGINE",
      desc: "GLOBAL SALES HUB",
      features: "SCALE • SELL • SUCCEED",
      src: "/HorizontalParallaxGallery/ecommerce_v2.jpg",
      color: "#8b5cf6",
      titleColor: "#F5F3FF",
      descColor: "rgba(245, 243, 255, 0.65)",
      ctaColor: "#a855f7",
      hasGlow: true
    },
    {
      title: "HEALTH PORTAL",
      desc: "MED-RECORDS SYSTEM",
      features: "COLLECT • DIAGNOSE • HEAL",
      src: "/HorizontalParallaxGallery/health_v2.png",
      color: "#10b981",
      titleColor: "#ECFDF5",
      descColor: "rgba(236, 253, 245, 0.65)",
      ctaColor: "#10b981",
      hasGlow: true
    },
    {
      title: "REAL ESTATE VR",
      desc: "VIRTUAL LISTING HUB",
      features: "BROWSE • TOUR • INVEST",
      src: "/HorizontalParallaxGallery/real_v2.png",
      color: "#fca311",
      titleColor: "#FFFBEB",
      descColor: "rgba(255, 251, 235, 0.65)",
      ctaColor: "#fca311",
      hasGlow: true
    },
    {
      title: "FINTECH DASH",
      desc: "SECURE ASSET PANEL",
      features: "MANAGE • SECURE • GROW",
      src: "/HorizontalParallaxGallery/fintech_v2.png",
      color: "#3b82f6",
      titleColor: "#EFF6FF",
      descColor: "rgba(239, 246, 255, 0.65)",
      ctaColor: "#3b82f6",
      hasGlow: true
    },
    {
      title: "LOGISTICS HUB",
      desc: "FLEET CONTROL SYS",
      features: "TRACK • ROUTE • DELIVER",
      src: "/HorizontalParallaxGallery/logistics_v2.jpg",
      color: "#64748b",
      titleColor: "#F8FAFC",
      descColor: "rgba(248, 250, 252, 0.65)",
      ctaColor: "#94a3b8",
      hasGlow: true
    },
    {
      title: "LMS PLATFORM",
      desc: "ED-LEARNING PORTAL",
      features: "STUDY • TEACH • MASTER",
      src: "/HorizontalParallaxGallery/lms_v2.jpg",
      color: "#0891b2",
      titleColor: "#F0FDFA",
      descColor: "rgba(240, 253, 250, 0.65)",
      ctaColor: "#0891b2",
      hasGlow: true
    },
    {
      title: "SAAS CRM CORE",
      desc: "CLIENT RELATION SYS",
      features: "RETAIN • ENGAGE • CONVERT",
      src: "/HorizontalParallaxGallery/crm_v2.jpg",
      color: "#a855f7",
      titleColor: "#FAF5FF",
      descColor: "rgba(250, 245, 255, 0.65)",
      ctaColor: "#a855f7",
      hasGlow: true
    },
    {
      title: "SMART BOOKING",
      desc: "EVENT SCHEDULER",
      features: "PLAN • BOOK • ENJOY",
      src: "/HorizontalParallaxGallery/booking_v2.jpg",
      color: "#0ea5e9",
      titleColor: "#F0F9FF",
      descColor: "rgba(240, 249, 255, 0.65)",
      ctaColor: "#0ea5e9",
      hasGlow: true
    },
  ], []);
 
  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    const main = mainRef.current;
    const root = rootRef.current;
    if (!container || !wrapper || !main || !root) return;
 
    let destroyed = false;
    let animId: number;
 
    const domImages = Array.from(container.querySelectorAll<HTMLImageElement>(".gallery__media__image__gl"));
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "1";
    renderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(renderer.domElement);
 
    const scene = new THREE.Scene();
    const fov = 2 * Math.atan(window.innerHeight / 2 / 100) * (180 / Math.PI);
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0, 0, 100);
 
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.Camera();
 
    const group = new THREE.Group();
    const reflectionGroup = new THREE.Group();
    scene.add(group); scene.add(reflectionGroup);
 
    const count = 180;
    const posArray = new Float32Array(count * 3);
    const offsetArray = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * window.innerWidth * 1.5;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * window.innerHeight * 1.5;
      posArray[i * 3 + 2] = -50 - Math.random() * 100;
      offsetArray[i] = Math.random() * 1000;
    }
 
    const constellationGeo = new THREE.BufferGeometry();
    const posBuffer = new THREE.BufferAttribute(posArray, 3);
    const offsetBuffer = new THREE.BufferAttribute(offsetArray, 1);
 
    const constellationUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color("#64748b") }
    };
 
    const constellationMat = new THREE.ShaderMaterial({
      uniforms: constellationUniforms,
      vertexShader: constellationVertexShader,
      fragmentShader: constellationFragmentShader,
      transparent: true,
      depthTest: false,
    });
 
    const points = new THREE.Points(constellationGeo, constellationMat);
    constellationGeo.setAttribute('position', posBuffer);
    constellationGeo.setAttribute('aOffset', offsetBuffer);
    scene.add(points);
 
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#64748b") },
      },
      vertexShader: backgroundVertexShader,
      fragmentShader: backgroundFragmentShader,
      depthTest: false,
    });
    bgScene.add(new THREE.Mesh(bgGeometry, bgMaterial));
 
    const geometry = new THREE.PlaneGeometry(1, 1, 64, 64);
    const scroll = { current: 0, target: 0, ease: 0.05, limit: 0, offset: 0, speed: 0 };
    const params = { parallaxIntensity: 0.35, uvScale: 0.85, shaderMultiplier: 1.0 };
 
    const glMedias = domImages.map((el, i) => {
      const texture = new THREE.TextureLoader().load(el.src, (tex) => {
        material.uniforms.uImageResolution.value.set(tex.image.width, tex.image.height);
        reflectionMaterial.uniforms.uImageResolution.value.set(tex.image.width, tex.image.height);
      });
 
      const commonUniforms = {
        uTexture: { value: texture },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uImageResolution: { value: new THREE.Vector2(1, 1) },
        uParallax: { value: 0 },
        uUvScale: { value: params.uvScale },
        uShaderMultiplier: { value: params.shaderMultiplier },
        uSpeed: { value: 0 },
        uTime: { value: 0 },
        uFocus: { value: 0 },
        uFocusScale: { value: 1 },
        uBlur: { value: 0 }
      };
 
      const material = new THREE.ShaderMaterial({
        uniforms: { ...commonUniforms, uHover: { value: 0 } },
        vertexShader, fragmentShader,
      });
 
      const reflectionMaterial = new THREE.ShaderMaterial({
        uniforms: { ...commonUniforms },
        vertexShader: vertexShader.replace('pos.xy *= uFocusScale;', 'pos.xy *= uFocusScale;'),
        fragmentShader: reflectionFragmentShader,
        transparent: true,
      });
 
      const mesh = new THREE.Mesh(geometry, material);
      const reflectionMesh = new THREE.Mesh(geometry, reflectionMaterial);
      group.add(mesh); reflectionGroup.add(reflectionMesh);
 
      const item = el.closest('.gallery__item__gl');
      if (item) {
        item.addEventListener('mouseenter', () => {
          gsap.to(material.uniforms.uHover, { value: 1, duration: 0.8, ease: "power2.out" });
        });
        item.addEventListener('mouseleave', () => {
          gsap.to(material.uniforms.uHover, { value: 0, duration: 0.8, ease: "power2.out" });
        });
      }
 
      return {
        el, mesh, reflectionMesh, material, reflectionMaterial, texture, bounds: el.getBoundingClientRect(), distance: 0, id: i,
        updateScale: function () {
          const trans = container.style.transform; container.style.transform = "none";
          this.bounds = this.el.getBoundingClientRect(); container.style.transform = trans;
          this.mesh.scale.set(this.bounds.width, this.bounds.height, 1);
          this.reflectionMesh.scale.set(this.bounds.width, this.bounds.height, 1);
          this.material.uniforms.uResolution.value.set(this.bounds.width, this.bounds.height);
          this.reflectionMaterial.uniforms.uResolution.value.set(this.bounds.width, this.bounds.height);
        },
        updatePosition: function (sc: number, offset: number) {
          const x = this.bounds.left - sc + offset - window.innerWidth / 2 + this.bounds.width / 2;
          const y = -this.bounds.top + window.innerHeight / 2 - this.bounds.height / 2;
          this.mesh.position.set(x, y, 0);
          this.reflectionMesh.position.set(x, y - this.bounds.height - 2, 0);
          this.distance = x / window.innerWidth;
        },
        updateParallax: function (sc: number, speed: number, time: number) {
          const absDist = Math.abs(this.distance);
          const blur = clamp(absDist * 2.0, 0, 1.0);
          const focus = 1.0 - clamp(absDist * 1.5, 0, 1.0);
 
          this.material.uniforms.uBlur.value = blur;
          this.material.uniforms.uFocus.value = focus;
          this.reflectionMaterial.uniforms.uFocus.value = focus;
          this.material.uniforms.uParallax.value = this.distance * params.parallaxIntensity;
          this.reflectionMaterial.uniforms.uParallax.value = this.distance * params.parallaxIntensity;
          this.material.uniforms.uSpeed.value = speed;
          this.reflectionMaterial.uniforms.uSpeed.value = speed;
          this.material.uniforms.uTime.value = time;
          this.reflectionMaterial.uniforms.uTime.value = time;
        }
      };
    });
 
    const setLimit = () => {
      const trans = container.style.transform; container.style.transform = "none";
      const first = glMedias[0].el.getBoundingClientRect();
      const last = glMedias[glMedias.length - 1].el.getBoundingClientRect();
      container.style.transform = trans;
      scroll.offset = window.innerWidth / 2 - first.width / 2 - first.left;
      scroll.limit = last.left - first.left;
    };
 
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.fov = 2 * Math.atan(window.innerHeight / 2 / 100) * (180 / Math.PI);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      glMedias.forEach(m => m.updateScale());
      setLimit();
    };
    const onWheel = (e: WheelEvent) => { scroll.target += e.deltaY * 0.8; };
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2);
      const y = -(e.clientY - window.innerHeight / 2);
      gsap.to(constellationUniforms.uMouse.value, { x, y, duration: 0.8, ease: "power2.out" });
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("mousemove", onMouseMove);
 
    imagesLoaded(container, () => {
      main.classList.remove("loading");
      document.body.classList.remove("loading");
      onResize();
      gsap.fromTo(container.querySelectorAll('.gallery__item__gl'),
        { opacity: 0, x: 80, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 2.0, stagger: 0.15, ease: "expo.out", delay: 0.6 }
      );
    });
 
    const renderLoop = (time: number) => {
      if (destroyed) return;
      const t = time * 0.001;
      bgMaterial.uniforms.uTime.value = t;
      constellationUniforms.uTime.value = t;
 
      scroll.target = clamp(0, scroll.limit, scroll.target);
      const prev = scroll.current;
      scroll.current = lerp(scroll.current, scroll.target, scroll.ease);
      const instantVelocity = (scroll.current - prev) / window.innerWidth;
      scroll.speed = lerp(scroll.speed, instantVelocity, 0.1);
 
      container.style.transform = `translateX(${-scroll.current + scroll.offset}px)`;
 
      let closestIdx = -1;
      let minDistance = 999;
      glMedias.forEach((m, i) => {
        m.updatePosition(scroll.current, scroll.offset);
        m.updateParallax(scroll.current, scroll.speed, t);
        const d = Math.abs(m.distance);
        if (d < minDistance) { minDistance = d; closestIdx = i; }
 
        const titleOverlay = m.el.parentElement?.querySelector('.image__title__overlay');
        if (titleOverlay) {
          const distFromCenter = Math.abs(m.distance);
          const opacity = 1.0 - clamp(distFromCenter * 2.5, 0, 1);
          const scale = 1.0 - clamp(distFromCenter * 0.4, 0, 0.2);
          const parallaxX = m.distance * 60;
          const slideY = clamp(distFromCenter * 50, 0, 50);
 
          gsap.set(titleOverlay, {
            opacity: opacity,
            scale: scale,
            x: parallaxX,
            y: slideY,
            overwrite: true,
            display: opacity > 0.01 ? 'flex' : 'none'
          });
        }
      });
 
      if (closestIdx !== -1 && projects[closestIdx]) {
        const targetColor = projects[closestIdx].color;
        const c = new THREE.Color(targetColor);
        gsap.to(bgMaterial.uniforms.uColor.value, { r: c.r, g: c.g, b: c.b, duration: 1.5 });
        gsap.to(constellationMat.uniforms.uColor.value, { r: c.r, g: c.g, b: c.b, duration: 1.5 });
        gsap.to('.scroll__indicator__bar', { backgroundColor: targetColor, duration: 1 });
        root.style.setProperty('--accent-color', targetColor);
      }
 
      const progress = scroll.current / scroll.limit;
      gsap.set('.scroll__indicator__bar', { scaleX: progress });
 
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(bgScene, bgCamera);
      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };
    renderLoop(0);
 
    return () => {
      destroyed = true; cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize); window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousemove", onMouseMove);
      glMedias.forEach(m => {
        m.texture.dispose(); m.material.dispose(); m.reflectionMaterial.dispose();
      });
      constellationGeo.dispose(); constellationMat.dispose();
      bgGeometry.dispose(); bgMaterial.dispose();
      geometry.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [projects]);
 
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');
        :root {
          font-size: 13px; --color-text: #fff; --color-bg: #09090b;
          --page-padding: clamp(2rem, 5vw, 6rem); --font-main: 'Outfit', sans-serif;
          --font-mono: ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas;
          --accent-color: #7c3aed;
        }
        body { margin: 0; color: var(--color-text); background-color: var(--color-bg); font-family: var(--font-main); -webkit-font-smoothing: antialiased; overflow: hidden; }
        .loading::before { content: ''; position: fixed; z-index: 10000; top: 0; left: 0; width: 100%; height: 100%; background: var(--color-bg); }
        .loading::after { content: ''; position: fixed; z-index: 10000; top: 50%; left: 50%; width: 120px; height: 1px; margin: 0 0 0 -60px; background: rgba(255,255,255,0.2); }
        .header { position: fixed; top: 0; left: 0; width: 100%; padding: var(--page-padding); display: flex; justify-content: space-between; align-items: flex-start; z-index: 100; pointer-events: none; }
        .header__title { font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2rem; margin: 0; pointer-events: auto; }
       
        .content { width: 100vw; height: 100vh; display: flex; align-items: center; position: relative; z-index: 10; }
        .gallery__wrapper__gl { position: relative; width: 100%; overflow: visible; user-select: none; }
        .gallery__image__container__gl { display: flex; gap: 20vw; height: 100%; align-items: center; padding: 0; transform-style: preserve-3d; }
        .gallery__item__gl { flex-shrink: 0; width: clamp(300px, 45vw, 750px); position: relative; z-index: 5; perspective: 1000px; }
        .gallery__media__gl { aspect-ratio: 16 / 10; width: 100%; overflow: hidden; position: relative; display: block; background: transparent; transition: transform 0.6s cubic-bezier(0.2, 0, 0.2, 1); }
        .glass__vignette { position: absolute; inset: 0; z-index: 15; border: 1px solid rgba(255,255,255,0.1); box-shadow: inset 0 0 100px rgba(0,0,0,0.5); pointer-events: none; background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent 40%, transparent 60%, rgba(255,255,255,0.05)); }
        .gallery__media__image__gl { position: absolute; opacity: 0; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
       
        .image__title__overlay {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 100%; height: 100%; padding: 0 5%; text-align: center; pointer-events: none; z-index: 20;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          box-sizing: border-box; opacity: 0;
          background: transparent;
        }
        .image__title__text {
          font-size: clamp(2.5rem, 10vw, 7.5rem); font-weight: 900; text-transform: uppercase; letter-spacing: -0.15rem;
          margin: 0; line-height: 0.8; color: var(--project-title);
          text-shadow: var(--project-glow, none);
          position: relative;
        }
        .image__desc__text {
          font-size: 1.5rem; font-weight: 700; opacity: 1; margin: 1.5rem 0 0.5rem; letter-spacing: 0.15rem; text-transform: uppercase;
          color: var(--project-desc); font-family: var(--font-main);
          text-align: center;
        }
        .image__features__text {
          font-size: 1.1rem; font-weight: 500; opacity: 0.8; margin-bottom: 2rem; letter-spacing: 0.3rem; text-transform: uppercase;
          color: var(--project-desc); font-family: var(--font-main);
          text-align: center;
          margin-right: -0.3rem;
        }
 
        .image__text__box {
          background: rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(30px) saturate(180%);
          padding: 4rem 5rem;
          border-radius: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 95%;
          box-shadow: inset 0 0 20px rgba(255,255,255,0.02);
          transform-style: preserve-3d;
        }
 
        .view__project__btn {
          margin-top: 1rem; padding: 14px 32px; background: rgba(255,255,255,0.08);
          border: 1px solid var(--project-cta, rgba(255,255,255,0.25));
          color: #fff; font-family: var(--font-main); font-size: 0.85rem; letter-spacing: 0.12rem; text-transform: uppercase;
          cursor: pointer; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 12px; transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          font-weight: 700;
          border-radius: 100px;
        }
        .view__project__btn:hover {
          background: var(--project-cta, #fff);
          color: #000;
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }
 
        .scroll__indicator { position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); width: 200px; height: 2px; background: rgba(255,255,255,0.1); z-index: 100; overflow: hidden; }
        .scroll__indicator__bar { width: 100%; height: 100%; transform-origin: left; transform: scaleX(0); background: #fff; }
      `}} />
 
      <div ref={rootRef}>
        <header className="header">
          <h2 className="header__title">Lumzy // Archive</h2>
        </header>
 
        <main className="loading" ref={mainRef}>
          <div className="content">
            <div className="gallery__wrapper__gl" ref={wrapperRef}>
              <div className="gallery__image__container__gl" ref={containerRef}>
                {projects.map((p, i) => (
                  <div
                    className="gallery__item__gl"
                    key={i}
                    style={{
                      '--project-title': (p as any).titleColor || '#fff',
                      '--project-desc': (p as any).descColor || 'rgba(255,255,255,0.7)',
                      '--project-cta': (p as any).ctaColor || '#fff',
                      '--project-accent': (p as any).accentColor || (p as any).color,
                      '--project-glow': (p as any).hasGlow ? `0 0 50px ${(p as any).ctaColor || (p as any).color}` : 'none'
                    } as React.CSSProperties}
                  >
                    <div className="gallery__media__gl">
                      <div className="glass__vignette" />
                      <img
                        src={p.src}
                        alt={p.title}
                        className="gallery__media__image__gl"
                        draggable="false"
                      />
                      <div className="image__title__overlay">
                        <div className="image__text__box">
                          <div className="image__title__text">{p.title}</div>
                          {p.desc && <div className="image__desc__text">{p.desc}</div>}
                          {(p as any).features && (
                            <div className="image__features__text">{(p as any).features}</div>
                          )}
                          <button className="view__project__btn">
                            View Project →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="scroll__indicator">
            <div className="scroll__indicator__bar"></div>
          </div>
        </main>
      </div>
    </>
  );
}
 
 