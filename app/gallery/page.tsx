"use client";

import Link from "next/link";
import GsapCarouselGallery from "@/components/specific/carouselOnScroll/GsapCarouselGallery";

// WebGL removed (no more THREE.WebGLRenderer context loss).

// High-quality, clear placeholder images
const DEFAULT_IMAGES = [
  "/gallery-images/1.png",
  "/gallery-images/2.png",
  "/gallery-images/3.png",
  "/gallery-images/4.png",
  "/gallery-images/5.png",
  "/gallery-images/1.png",
  "/gallery-images/2.png",
  "/gallery-images/3.png",
  "/gallery-images/4.png",
  "/gallery-images/5.png",
  "/gallery-images/1.png",
  "/gallery-images/2.png",
  "/gallery-images/3.png",
  "/gallery-images/4.png",
  "/gallery-images/5.png",
];

export default function GalleryRoute() {
  return (
    <div className="w-full h-[100dvh] relative overflow-hidden bg-black">
      {/* Premium minimal header */}
      <header className="absolute top-0 inset-x-0 z-30 p-8 flex items-center justify-between pointer-events-auto mix-blend-difference">
        <Link href="/" className="text-white text-lg font-medium tracking-wide hover:opacity-70 transition-opacity">
          LUMPZY
        </Link>
        <div className="text-white/60 text-sm tracking-[0.2em] uppercase font-light">
          Immersive Gallery
        </div>
      </header>

      {/* The 3D Scene */}
      <GsapCarouselGallery images={DEFAULT_IMAGES} radius={3.5} />
    </div>
  );
}
