"use client";

import LabBackground from "@/components/LabBackground";
import PocCard from "@/components/PocCard";

const POC_LIST = [
  {
    title: "Market Mirror POC 1",
    desc: "Market Mirror POC with dynamic reflections and refractions.",
    path: "/square",
    color: "from-pink-500/20 to-transparent",
    status: "Stable",
  },
  {
    title: "Market Mirror POC 2",
    desc: "Market Mirror POC with dynamic reflections and refractions.",
    path: "/marketpoc",
    color: "from-violet-500/20 to-transparent",
    status: "Active",
  },
  {
    title: "Water Shader",
    desc: "Interactive fluid simulation overlay for any content.",
    path: "/water",
    color: "from-blue-500/20 to-transparent",
    status: "Beta",
  },
  {
    title: "Clip Hover",
    desc: "Geometric slice transitions with character scramble.",
    path: "/sliced",
    color: "from-purple-500/20 to-transparent",
    status: "Optimized",
  },
  {
    title: "Parallax Space",
    desc: "Horizontal depth layers with smooth momentum scroll.",
    path: "/scroll",
    color: "from-emerald-500/20 to-transparent",
    status: "Draft",
  },
  {
    title: "On-Scroll Gallery",
    desc: "Infinite smooth scrolling image gallery with perspective.",
    path: "/gallery",
    color: "from-rose-500/20 to-transparent",
    status: "Stable",
  },
  {
    title: "Liquid Slider",
    desc: "RGB Kinetic displacement with fluid transitions.",
    path: "/slider",
    color: "from-orange-500/20 to-transparent",
    status: "Core",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#000000] text-white selection:bg-white selection:text-black font-sans relative">
      <LabBackground />

      {/* Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-grain z-50 px-8" />

      <div className="min-h-screen flex flex-col items-center py-24 px-8 overflow-hidden relative z-10">
        {/* Header */}
        <header className="relative z-10 text-center mb-20 pointer-events-none">
          <h1 className="text-8xl md:text-[180px] font-black italic tracking-tighter uppercase mb-4 opacity-5 blur-[2px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
            POC HUB
          </h1>
          <div className="relative">
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-2">
              Lumzy Lab
            </h1>
            <p className="text-neutral-500 font-mono text-sm tracking-[0.3em] uppercase flex items-center justify-center gap-3">
              <span className="w-2 h-px bg-neutral-800" />
              Experimental Web Interfaces & Shaders
              <span className="w-2 h-px bg-neutral-800" />
            </p>
          </div>
        </header>

        {/* Nav Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          {POC_LIST.map((poc, i) => (
             <PocCard key={poc.path} poc={poc} index={i} />
          ))}
        </div>

        {/* Footer info */}
        <footer className="mt-24 text-neutral-600 font-mono text-[10px] uppercase tracking-[0.5em] pb-12 text-center max-w-2xl px-6">
          <p className="mb-4">System Initialized // Build 2026.03.31</p>
          <p className="opacity-40">&copy; 2026 Lumzy • Advanced Front-end Exploration Engine • Experimental Lab Module</p>
        </footer>
      </div>
    </main>
  );
}
