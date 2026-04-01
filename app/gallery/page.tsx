"use client";

import Link from "next/link";
import GsapCarouselGallery from "@/components/specific/carouselOnScroll/GsapCarouselGallery";

// WebGL removed (no more THREE.WebGLRenderer context loss).

// High-quality, clear placeholder images
const DEFAULT_IMAGES = [
  { src: "/tommorowland.png", title: "Tomorrowland", bgColor: "rgb(4, 7, 24)" },
  { src: "/navy-pier.png", title: "Navy Pier", bgColor: "rgb(4, 7, 24)" },
  { src: "/opera.png", title: "Royal Opera Of Wallonia", bgColor: "rgba(0, 0, 0, 0.68)" },
  { src: "/msi-chicago.png", title: "MSI Chicago", bgColor: "rgb(4, 7, 24)" },
  { src: "/phone.png", title: "This Was Louise’s Phone", bgColor: "rgb(4, 7, 24)" },
  { src: "/kikk.png", title: "KIKK Festival 2018", bgColor: "rgba(1, 15, 92, 0.679)" },
  { src: "/kennedy.png", title: "The Kennedy Center", bgColor: "rgb(4, 7, 24)" },
  { src: "/tommorowland.png", title: "Tomorrowland 2", bgColor: "rgb(4, 7, 24)" },
  { src: "/navy-pier.png", title: "Navy Pier 2", bgColor: "rgb(4, 7, 24)" },
  { src: "/msi-chicago.png", title: "MSI Chicago 2", bgColor: "rgb(4, 7, 24)" },
  { src: "/phone.png", title: "This Was Louise’s Phone 2", bgColor: "rgb(4, 7, 24)" },
  { src: "/msi-chicago.png", title: "MSI Chicago", bgColor: "rgb(4, 7, 24)" },
  { src: "/kikk.png", title: "KIKK Festival 2018 2", bgColor: "rgba(1, 15, 92, 0.679)" },
  { src: "/kennedy.png", title: "The Kennedy Center 2", bgColor: "rgb(4, 7, 24)" },
];

export default function GalleryRoute() {
  return (
    <div className="w-full h-[100dvh] relative overflow-hidden bg-black">
      {/* Premium minimal header */}
      <header className="absolute top-0 inset-x-0 z-30 p-8 flex items-center justify-between pointer-events-auto mix-blend-difference">
        <Link href="/" className="text-white text-lg font-medium tracking-wide hover:opacity-70 transition-opacity">
          LUMZY
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
