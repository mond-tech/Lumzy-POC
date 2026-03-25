"use client";

import dynamic from "next/dynamic";
const WaterWrapper = dynamic(() => import("@/components/specific/water/WaterWrapper"), { ssr: false });

export default function WaterPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-20 overflow-hidden">
      <h1 className="text-white text-6xl font-black mb-12 tracking-tighter uppercase italic">
        Water Shader Component
      </h1>
      
      <WaterWrapper className="p-10 border border-white/10 rounded-3xl bg-neutral-900/50 w-full max-w-4xl">
        <div className="flex flex-col items-center text-center gap-6 w-full">
          <h2 className="text-3xl font-bold text-white uppercase italic">Distortable Content</h2>
          <p className="text-neutral-400 leading-relaxed max-w-2xl">
            This entire block is wrapped in the WaterWrapper. Move your mouse over it to see 
            fluid simulation ripples and specular highlights. The children are distorted 
            using an SVG filter driven by the same simulation logic as the original water-cursor effect.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-10 py-3 bg-white text-black font-bold rounded-full hover:scale-110 transition-transform">
              Explore
            </button>
            <button className="px-10 py-3 bg-transparent border border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition-all">
              Details
            </button>
          </div>
          <div className="mt-4 p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl max-w-lg">
            <p className="text-indigo-300 text-sm italic">
              "Water is the driving force of all nature." — Leonardo da Vinci
            </p>
          </div>
        </div>
      </WaterWrapper>

      <div className="mt-20 grid grid-cols-2 gap-8 w-full max-w-7xl">
         <WaterWrapper className="rounded-3xl overflow-hidden aspect-[16/10]">
            <img 
               src="/ocean.jpg" 
               alt="Water" 
               className="w-full h-full object-cover"
            />
         </WaterWrapper>
         <WaterWrapper className="rounded-3xl overflow-hidden aspect-[16/10] bg-blue-900 flex items-center justify-center">
            <div className="text-white text-6xl font-black italic">
               SLOW WATER
            </div>
         </WaterWrapper>
      </div>
    </main>
  );
}
