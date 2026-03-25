"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const WaterWrapper = dynamic(() => import("@/components/WaterWrapper"), { ssr: false });

const POC_LIST = [
  {
    title: "Liquid Slider",
    desc: "RGB Kinetic displacement with fluid transitions.",
    path: "/slider",
    color: "from-orange-500/20 to-transparent",
  },
  {
    title: "Water Shader",
    desc: "Interactive fluid simulation overlay for any content.",
    path: "/water",
    color: "from-blue-500/20 to-transparent",
  },
  {
    title: "Clip Hover",
    desc: "Geometric slice transitions with character scramble.",
    path: "/sliced",
    color: "from-purple-500/20 to-transparent",
  },
  {
    title: "Parallax Space",
    desc: "Horizontal depth layers with smooth momentum scroll.",
    path: "/scroll",
    color: "from-emerald-500/20 to-transparent",
  },
];

export default function Home() {
  return (
    // bg-[#0c0b10] bg-[#fb7427]
    <main className="min-h-screen bg-[#000000] text-white selection:bg-white selection:text-black">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>
      
      {/* Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-grain" />

      <div className="min-h-screen flex flex-col items-center py-24 px-8 overflow-hidden">
        {/* Header */}
        <header className="relative z-10 text-center mb-20">
          <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter uppercase mb-4 opacity-10 blur-[1px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
            POC HUB
          </h1>
          <div className="relative">
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-2">
              Lumzy Lab
            </h1>
            <p className="text-neutral-500 font-mono text-sm tracking-[0.3em] uppercase">
              Experimental Web Interfaces & Shaders
            </p>
          </div>
        </header>

        {/* Nav Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          {POC_LIST.map((poc, i) => (
            <Link 
              key={poc.path} 
              href={poc.path}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${poc.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              <div className="relative flex flex-col h-full">
                <span className="text-neutral-600 font-mono text-xs mb-8">0{i + 1}</span>
                <h2 className="text-4xl font-bold italic tracking-tight mb-3 group-hover:translate-x-2 transition-transform duration-500">
                  {poc.title}
                </h2>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-[26ch] group-hover:text-neutral-200 transition-colors duration-500">
                  {poc.desc}
                </p>
                
                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors duration-500">
                  Explore POC
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                    <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer info */}
        <footer className="mt-24 text-neutral-600 font-mono text-[10px] uppercase tracking-[0.5em] pb-12">
          &copy; 2026 Lumzy • Advanced Front-end Exploration
        </footer>
      </div>
    </main>
  );
}
