"use client";

import React, { useState } from "react";
import Link from "next/link";
import ScrambleText from "./ScrambleText";

interface PocCardProps {
  poc: {
    title: string;
    desc: string;
    path: string;
    color: string;
    status: string;
  };
  index: number;
}

const PocCard: React.FC<PocCardProps> = ({ poc, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={poc.path}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 overflow-hidden backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${poc.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
      
      {/* Tech Grain Card Overlay */}
      <div className="absolute inset-0 bg-grain opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700 pointer-events-none" />

      <div className="relative flex flex-col h-full">
        <div className="flex justify-between items-start mb-8">
          <span className="text-cyan-600 font-mono text-xs">
             <ScrambleText text={`INDEX_${String(index + 1).padStart(2, '0')}`} isHovered={isHovered} />
          </span>
          <div className="flex items-center gap-2 px-2 py-1 bg-cyan-900/10 border border-cyan-500/20 rounded-full">
            <span className={`w-1 h-1 rounded-full ${poc.status === 'Active' ? 'bg-cyan-300' : 'bg-cyan-500'} animate-pulse`} />
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
               <ScrambleText text={poc.status} isHovered={isHovered} />
            </span>
          </div>
        </div>

        <h2 className="text-4xl font-bold italic tracking-tight mb-3 group-hover:translate-x-2 transition-transform duration-500 text-white">
          <ScrambleText text={poc.title} isHovered={isHovered} />
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed max-w-[26ch] group-hover:text-cyan-100 transition-colors duration-500">
          {poc.desc}
        </p>

        <div className="mt-12 flex items-center gap-4">
           <div className="h-px shrink-0 w-8 bg-cyan-900 group-hover:bg-cyan-400 transition-all duration-500 group-hover:w-16" />
           <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-600 group-hover:text-cyan-300 transition-colors duration-500">
            <ScrambleText text="Execute Script" isHovered={isHovered} />
          </div>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform opacity-30 group-hover:opacity-100 text-cyan-400">
            <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default PocCard;
