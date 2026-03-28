"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

const DogModel = dynamic(() => import("./Dog"), { ssr: false });

export type GalleryItem = {
  src: string;
  title: string;
  bgColor: string;
};

type GsapCarouselGalleryProps = {
  images: (string | GalleryItem)[];
  radius?: number;
  spiralStep?: number;
  imagesPerTurn?: number;
  imageAspect?: number; // width/height
  momentum?: number;
  scrollAdvanceSpeed?: number;
  autoRotateSpeed?: number;
  scrollRotateForce?: number;
  maxRotationSpeed?: number;
  rotationSmoothing?: number;
};

// DOM-based spiral carousel (no WebGL), scroll-driven via GSAP ticker.
export default function GsapCarouselGallery({
  images,
  radius = 6,
  spiralStep = 0.8,
  imagesPerTurn = 7,
  imageAspect = 1.85, // ~ (width / height) for your planes
  momentum = 0.87,
  scrollAdvanceSpeed = 0.17,
  autoRotateSpeed = 0.002,
  scrollRotateForce = 1.75,
  maxRotationSpeed = 0.15,
  rotationSmoothing = 0.09,
}: GsapCarouselGalleryProps) {
  const items: GalleryItem[] = useMemo(() => {
    return images.map(item =>
      typeof item === "string"
        ? { src: item, title: "Temporal Echo", bgColor: "black" }
        : item
    );
  }, [images]);

  const count = items.length;
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [linePoints, setLinePoints] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // Mutable simulation state (avoid rerenders on every frame).
  const sim = useRef({
    scrollOffsetWorld: 0,
    scrollVelocityWorld: 0,
    pendingDelta: 0,
    friction: momentum,
    lastScrollDirection: 1,
    rotation: 0,
    rotationSpeed: 0.001,
    lastTouchY: null as number | null,
  });

  const totalHeightWorld = useMemo(() => count * spiralStep, [count, spiralStep]);
  const angleStep = useMemo(() => (Math.PI * 2) / imagesPerTurn, [imagesPerTurn]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const st = sim.current;
    st.friction = momentum;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Wheel/touch handlers update pendingDelta; the ticker does the actual simulation.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Clamp and scale for consistent feel across devices.
      const raw = Math.max(-120, Math.min(120, e.deltaY));
      st.pendingDelta += raw * 0.0025;
    };

    const onTouchStart = (e: TouchEvent) => {
      st.scrollVelocityWorld = 0;
      st.lastTouchY = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const currentY = e.touches[0]?.clientY ?? null;
      if (currentY === null || st.lastTouchY === null) return;
      const delta = st.lastTouchY - currentY;
      st.lastTouchY = currentY;
      st.pendingDelta += delta * 0.01;
    };

    const onTouchEnd = () => {
      st.lastTouchY = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true, capture: true });

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const wrapSigned = (v: number, range: number) => {
      // Wrap v to [-range/2, range/2)
      const half = range / 2;
      const wrapped = ((v + half) % range + range) % range;
      return wrapped - half;
    };

    const tick = (_time: number, deltaTime: number) => {
      if (prefersReduced) return;
      if (!rootRef.current) return;

      // Pause simulation if hovering
      const isPaused = hoveredIndex !== null;

      // GSAP ticker passes deltaTime in milliseconds in some builds/environments.
      // Normalize to seconds.
      const dt = deltaTime > 1 ? deltaTime / 1000 : deltaTime;

      const rect = rootRef.current.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);

      const pixelsPerWorld = (h * 0.1) / Math.max(0.1, spiralStep); // further zoomed-out calibration
      // Tighten vertical spacing so more "layers" are visible.
      const yPxPerWorld = pixelsPerWorld * 0.72;

      // Tune image size to the viewport.
      const tileW = clamp(w * 0.14, 120, 220);
      const tileH = tileW / imageAspect;

      // 1) Scroll simulation (same feel as your VirtualScroll hook)
      st.scrollVelocityWorld += st.pendingDelta;
      st.pendingDelta = 0;
      if (!isPaused) {
        st.scrollVelocityWorld *= st.friction;
      } else {
        st.scrollVelocityWorld *= 0.5; // stop faster when hovering
      }

      if (Math.abs(st.scrollVelocityWorld) < 0.0001) st.scrollVelocityWorld = 0;
      if (!isPaused) {
        st.scrollOffsetWorld += st.scrollVelocityWorld;
      }

      const vel = st.scrollVelocityWorld;
      if (Math.abs(vel) > 0.001) st.lastScrollDirection = vel > 0 ? 1 : -1;

      // 2) Rotation simulation
      const scrollContribution = vel * scrollRotateForce;
      const idleSpeed = autoRotateSpeed * st.lastScrollDirection;
      const targetSpeed = idleSpeed + scrollContribution;
      const clampedSpeed = clamp(targetSpeed, -maxRotationSpeed, maxRotationSpeed);

      st.rotationSpeed += (clampedSpeed - st.rotationSpeed) * rotationSmoothing;
      if (!isPaused) {
        st.rotation += st.rotationSpeed * dt * 60;
      }

      // 3) Apply transforms
      const rangeWorld = totalHeightWorld;
      const yStartWorld = -rangeWorld / 2;

      for (let i = 0; i < count; i++) {
        const node = itemRefs.current[i];
        if (!node) continue;

        const baseAngle = i * angleStep;
        const angle = baseAngle + st.rotation;

        const xWorld = Math.sin(angle) * radius;
        const zWorld = Math.cos(angle) * radius;
        const xPx = xWorld * pixelsPerWorld;
        const zPx = zWorld * pixelsPerWorld;

        // Scroll advances vertical movement in the same way shader does.
        const yRawWorld = yStartWorld + i * spiralStep + st.scrollOffsetWorld * scrollAdvanceSpeed;
        const yWorld = wrapSigned(yRawWorld, rangeWorld);
        const yPx = yWorld * yPxPerWorld;

        // Basic depth fade similar to shader depth fade.
        const t = (zWorld + radius) / (radius * 1.5); // normalize to ~[0..1]
        const depth = clamp(t, 0, 1);
        const baseOpacity = 0.25 + depth * 0.75;
        const opacity = hoveredIndex === i ? 1.0 : baseOpacity;
        const baseScale = 0.92 + depth * 0.08;
        const scale = hoveredIndex === i ? baseScale * 1.15 : baseScale;

        // Keep cards facing the camera so they don't disappear when moving to the back.
        node.style.opacity = String(opacity);
        node.style.transform = `translate3d(${xPx}px, ${yPx}px, ${zPx}px) scale(${scale})`;
        const parent = node.parentElement;
        if (parent) {
          const baseZ = Math.round(1000 + zPx);
          // Bring hovered item to front of the 3D stack (but below UI like line/card)
          parent.style.zIndex = String(hoveredIndex === i ? 3000 : baseZ);
        }
        node.style.width = `${tileW}px`;
        node.style.height = `${tileH}px`;

        // If this is the hovered item, update line points
        if (hoveredIndex === i && cardRef.current && rootRef.current) {
          const rootRect = rootRef.current.getBoundingClientRect();
          const cardRect = cardRef.current.getBoundingClientRect();
          const itemRect = node.getBoundingClientRect();

          // Connect from card (left center) to item (right center) or vice versa
          // For 'L' line, we'll go from card center (x1, y1) to item center (x2, y2)
          setLinePoints({
            x1: cardRect.left + cardRect.width / 2 - rootRect.left,
            y1: cardRect.top + cardRect.height / 2 - rootRect.top,
            x2: itemRect.left + itemRect.width / 2 - rootRect.left,
            y2: itemRect.top + itemRect.height / 2 - rootRect.top,
          });
        }
      }
    };

    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("touchcancel", onTouchEnd, { capture: true });
      gsap.ticker.remove(tick);
    };
  }, [
    angleStep,
    count,
    imageAspect,
    autoRotateSpeed,
    imagesPerTurn,
    maxRotationSpeed,
    momentum,
    rotationSmoothing,
    radius,
    scrollAdvanceSpeed,
    scrollRotateForce,
    spiralStep,
    totalHeightWorld,
    hoveredIndex,
  ]);

  // Fallback to ensure line is cleared when not hovering
  useEffect(() => {
    if (hoveredIndex === null) {
      setLinePoints(null);
    }
  }, [hoveredIndex]);

  return (
    <div
      ref={rootRef}
      onMouseLeave={() => {
        setHoveredIndex(null);
        setLinePoints(null);
      }}
      className="w-full h-full absolute inset-0 overflow-hidden"
      style={{
        perspective: "4600px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Background Ambience exactly like sheriyans */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          zIndex: -1,
          backgroundImage: "url(/background-l.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundColor: "black",
          opacity: hoveredIndex !== null ? 0 : 1
        }}
      />

      {/* Hover Backgrounds */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {items.map((item, i) => (
          <div
            key={`bg-${i}`}
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: hoveredIndex === i ? 1 : 0,
              backgroundColor: item.bgColor,
            }}
          >
            <img
              src={item.src}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Integrated Center 3D Wolf Canvas */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
        style={{ zIndex: 1000 }}
      >
        <Canvas
          camera={{ position: [0, 0, 0.55], fov: 50 }}
          gl={{
            toneMapping: THREE.ReinhardToneMapping,
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false
          }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <DogModel />
        </Canvas>
      </div>

      {items.map((item, i) => (
        <div
          key={`${item.src}-${i}`}
          className="absolute left-1/2 top-1/2"
          style={{
            transform: "translate(-50%, -50%)",
            transformStyle: "preserve-3d",
            width: 260,
            height: 140,
            pointerEvents: "auto", // Enable hover
          }}
          onPointerEnter={() => setHoveredIndex(i)}
          onPointerLeave={() => {
            setHoveredIndex(null);
            setLinePoints(null);
          }}
        >
          <div
            ref={(node) => {
              itemRefs.current[i] = node;
            }}
            className="group cursor-pointer bg-black/20"
            style={{
              backfaceVisibility: "visible",
              willChange: "transform, opacity",
              borderRadius: 12,
              overflow: "hidden",
              border: hoveredIndex === i ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
              transition: "border 0.3s ease",
            }}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-500 z-10" />
            <img
              src={item.src}
              alt={item.title}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: hoveredIndex !== null && hoveredIndex !== i ? "grayscale(0.8) brightness(0.4)" : "none",
                transition: "filter 0.5s ease",
              }}
            />
          </div>
        </div>
      ))}

      {/* SVG Line Layer */}
      {linePoints && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-[4000]"
          style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))" }}
        >
          <path
            d={`M ${linePoints.x1} ${linePoints.y1} L ${linePoints.x1} ${linePoints.y2} L ${linePoints.x2} ${linePoints.y2}`}
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="1000"
            strokeDashoffset="0"
            opacity="0.6"
            strokeLinecap="round"
            style={{
              transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          />
          <circle cx={linePoints.x1} cy={linePoints.y1} r="3" fill="white" />
          <circle cx={linePoints.x2} cy={linePoints.y2} r="3" fill="white" />
        </svg>
      )}

      {/* Details Card */}
      <div
        ref={cardRef}
        className={`absolute bottom-12 left-12 z-[5000] transition-all duration-700 ease-out ${hoveredIndex !== null ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"
          }`}
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] w-80 shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/40">Item Details</span>
              <span className="text-[10px] font-mono text-white/60">0{(hoveredIndex ?? 0) + 1}</span>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />

            <div>
              <h3 className="text-2xl font-bold italic tracking-tight text-white mb-2 uppercase">
                {hoveredIndex !== null ? items[hoveredIndex].title : "Temporal Echo"}
              </h3>
              <p className="text-white/50 text-xs leading-relaxed font-light tracking-wide">
                A capture of light and shadow, frozen within the spiral of time. This fragment represents the intersection of digital craft and artistic intent.
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <div className="px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[8px] uppercase tracking-widest text-white/80">Perspective</div>
              <div className="px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[8px] uppercase tracking-widest text-white/80">3D Space</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

