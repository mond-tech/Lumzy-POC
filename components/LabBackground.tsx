"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import HolographicTerminal from "./HolographicTerminal";

const LabBackground: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorHudRef = useRef<HTMLDivElement>(null);
  const cursorCoordsRef = useRef<HTMLSpanElement>(null);

  // Memoize static random values to prevent re-generation on re-renders
  const bitstreams = React.useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: Math.random().toString(16).substring(2, 6).toUpperCase(),
      right: Math.random().toString(16).substring(2, 6).toUpperCase(),
    }));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    const handleMouseMove = (e: MouseEvent) => {
      // Direct DOM manipulation bypasses the React render cycle
      if (cursorHudRef.current) {
        cursorHudRef.current.style.left = `${e.clientX}px`;
        cursorHudRef.current.style.top = `${e.clientY}px`;
      }
      if (cursorCoordsRef.current) {
        cursorCoordsRef.current.innerText = `X: ${e.clientX.toString().padStart(4, '0')} // Y: ${e.clientY.toString().padStart(4, '0')}`;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0c0b10]">
      {/* Ambient Atmospheric Lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen">
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-cyan-900/10 blur-[100px] opacity-50 animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/10 blur-[120px] opacity-40 animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }} />
      </div>

      {/* Primary Blueprint Grid */}
      <div 
        className="absolute inset-0 opacity-[0.08]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #00ffff 1px, transparent 1px),
            linear-gradient(to bottom, #00ffff 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Sub-grid system */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #00ffff 1px, transparent 1px),
            linear-gradient(to bottom, #00ffff 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Dynamic Cursor Tracking Wrapper */}
      <div 
        ref={cursorHudRef}
        className="absolute w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-[left,top] duration-75 ease-out"
        style={{ left: '-1000px', top: '-1000px' }}
      >
        {/* Soft Tracking Flashlight Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.06)_0%,transparent_50%)] mix-blend-screen" />

        {/* Dynamic Cursor Target HUD */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] opacity-20">
            <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-400" />
            <div className="absolute top-0 left-1/2 w-px h-full bg-cyan-400" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-cyan-400 border-dashed animate-spin-slow" />
            <span 
              ref={cursorCoordsRef} 
              className="absolute top-2 left-6 font-mono text-[9px] text-cyan-400 font-bold whitespace-nowrap"
            >
              X: 0000 // Y: 0000
            </span>
        </div>
      </div>

      {/* Holographic 3D Diagnostic (Fixed Corner) */}
      <div className="absolute bottom-12 left-12 w-[300px] h-[300px] pointer-events-none opacity-60">
        <div className="absolute inset-0 border border-cyan-500/10 rounded-xl bg-cyan-500/[0.01] backdrop-blur-[2px]" />
        
        {/* Diagnostic Canvas Component */}
        <Suspense fallback={<div className="text-cyan-500/20 font-mono text-center pt-24 uppercase tracking-[0.5em]">Loading_Holo...</div>}>
           <HolographicTerminal />
        </Suspense>

        {/* Diagnostic Metadata Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 font-mono text-[8px] text-cyan-500/50 uppercase tracking-widest pointer-events-none border-t border-cyan-500/10 pt-4">
           <div className="flex justify-between font-bold text-cyan-400">
              <span>Diagnostic_Experiment: </span>
              <span>420-SHDR</span>
           </div>
           <div className="flex justify-between">
              <span>Vertex_Count: </span>
              <span>12,042</span>
           </div>
           <div className="flex justify-between">
              <span>Simulation_Time: </span>
              <span>40.2Ms</span>
           </div>
           <div className="mt-4 flex gap-1">
              {[...Array(12)].map((_, i) => (
                 <div key={i} className="h-1 flex-1 bg-cyan-500/20 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
           </div>
        </div>
      </div>

      {/* Coordinate Labels System */}
      <div className="absolute inset-0 opacity-[0.12]">
        {[...Array(5)].map((_, i) => (
          <div key={`row-${i}`} style={{ top: `${(i + 1) * 20}%` }} className="absolute w-full h-px border-t border-cyan-500/10">
            {[...Array(5)].map((_, j) => (
              <span key={`coord-${i}-${j}`} className="absolute font-mono text-[8px] text-cyan-500/50 -translate-y-full ml-1" style={{ left: `${(j + 1) * 20}%` }}>
                [{((j + 1) * 320).toString().padStart(4, '0')}:{((i + 1) * 180).toString().padStart(4, '0')}]
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Scrolling Diagnostic Bitstreams (Lateral) */}
      <div className="absolute right-12 top-0 bottom-0 w-px bg-cyan-500/5 opacity-40 mix-blend-screen overflow-hidden">
        <div className="absolute top-0 w-full flex flex-col gap-8 py-20 font-mono text-[8px] text-cyan-500/30 animate-[diagnostic-scroll_20s_linear_infinite] select-none">
          {bitstreams.map((bitstream, i) => (
            <div key={i} className="whitespace-nowrap flex flex-col items-center">
              <span>{bitstream.left}</span>
              <span>{bitstream.right}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scanning Laser Bar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-[300px] bg-gradient-to-b from-transparent via-cyan-500/[0.04] to-transparent absolute top-0 animate-[blueprint_scan_15s_linear_infinite]" />
        <div className="w-full h-px bg-cyan-400/30 absolute top-0 shadow-[0_0_15px_#00ffff44] animate-[blueprint_scan_15s_linear_infinite]" />
      </div>

      {/* Circuit Connector Pulses */}
      <div className="absolute top-6 left-6 right-6 h-px bg-cyan-500/10">
        <div className="h-full w-20 bg-cyan-400/40 blur-[2px] animate-[circuit_pulse_8s_infinite_linear]" />
      </div>

      {/* Corner Technical Decorative Overlays */}
      <div className="absolute inset-0 p-8 font-mono text-[9px] text-cyan-500/40 uppercase tracking-tighter select-none pointer-events-none">
        {/* Top Left Diagnostic */}
        <div className="absolute top-8 left-8 flex flex-col gap-2 border-l-2 border-t-2 border-cyan-500/20 p-3 pt-2">
          <div className="text-[10px] text-cyan-300 font-bold mb-1">MODULE.DIAGNOSTIC</div>
          <div className="flex justify-between gap-6"><span>SRCE:</span><span className="text-cyan-400 font-bold">LUMZY_HUB_P01</span></div>
          <div className="flex justify-between gap-6"><span>TYPE:</span><span className="text-cyan-400">REACT.V19.2</span></div>
          <div className="flex justify-between gap-6"><span>KERN:</span><span className="text-cyan-400">0x7F-K11</span></div>
        </div>

        {/* Top Right System Status */}
        <div className="absolute top-8 right-8 border-r-2 border-t-2 border-cyan-500/20 p-3 pt-2 text-right">
          <div className="flex gap-2 items-center justify-end mb-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#00ffff]" />
            <span className="text-cyan-300 font-bold tracking-widest">LIVE_STATUS: OK</span>
          </div>
          <div className="flex flex-col gap-1 opacity-60">
            <span>UPTIME: 15.3Ms</span>
            <span>MEM_USAGE: 32%</span>
          </div>
        </div>

        {/* Bottom Right Crypto Code */}
        <div className="absolute bottom-8 right-8 border-r-2 border-b-2 border-cyan-500/20 p-3 pb-2 text-right opacity-30">
          <div className="text-[11px] font-black text-cyan-400 tracking-[0.3em] mb-1">0x7F_SHDR_MODE</div>
          <div className="opacity-40">RES_LOCK: {dimensions.width}x{dimensions.height}</div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blueprint_scan {
          0% { transform: translateY(-30vh); }
          100% { transform: translateY(110vh); }
        }
        @keyframes diagnostic-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes circuit_pulse {
          0% { left: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LabBackground;
