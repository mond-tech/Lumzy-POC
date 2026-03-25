"use client";

import React, { useMemo } from "react";
import ClipHoverGrid, { CaseStudy } from "./ClipHoverGrid";

export default function ClipHoverArchivePage() {
  const projects: CaseStudy[] = useMemo(() => [
    { 
      title: "ERP System Revamp", 
      desc: "Streamlining enterprise operations with intelligent data flows.", 
      date: "03/12/2026", 
      src: "/HorizontalParallaxGallery/erp_v2.png", 
      link: "#" 
    },
    { 
      title: "AI Assistant UI", 
      desc: "Futuristic customer experience with neural network interfaces.", 
      date: "03/15/2026", 
      src: "/HorizontalParallaxGallery/ai_v2.png", 
      link: "#" 
    },
    { 
      title: "E-Commerce Core", 
      desc: "Robust marketplace architecture for global brand scaling.", 
      date: "03/18/2026", 
      src: "/HorizontalParallaxGallery/ecommerce_v2.jpg", 
      link: "#" 
    },
    { 
      title: "Healthcare Portal", 
      desc: "Confidential telemedicine bridge between doctors and patients.", 
      date: "03/20/2026", 
      src: "/HorizontalParallaxGallery/health_v2.png", 
      link: "#" 
    },
    { 
      title: "Real Estate VR", 
      desc: "Total spatial immersion for the world's most luxurious property tours.", 
      date: "03/22/2026", 
      src: "/HorizontalParallaxGallery/real_v2.png", 
      link: "#" 
    },
    { 
      title: "FinTech Dashboard", 
      desc: "Absolute security meets high-performance financial analytics.", 
      date: "03/23/2026", 
      src: "/HorizontalParallaxGallery/fintech_v2.png", 
      link: "#" 
    },
    { 
      title: "Logistics Hub", 
      desc: "Mapping the neural network of global freight and supply chain.", 
      date: "03/24/2026", 
      src: "/HorizontalParallaxGallery/logistics_v2.jpg", 
      link: "#" 
    },
    { 
      title: "Smart Booking", 
      desc: "Intelligent scheduling for high-precision event coordination.", 
      date: "03/25/2026", 
      src: "/HorizontalParallaxGallery/booking_v2.jpg", 
      link: "#" 
    },
    { 
      title: "SaaS CRM Pro", 
      desc: "Crystal-clear visibility into high-velocity sales funnels.", 
      date: "03/26/2026", 
      src: "/HorizontalParallaxGallery/crm_v2.jpg", 
      link: "#" 
    },
    { 
      title: "LMS Academy", 
      desc: "Digital learning portals for the next generation of industry leaders.", 
      date: "03/27/2026", 
      src: "/HorizontalParallaxGallery/lms_v2.jpg", 
      link: "#" 
    },
    { 
      title: "Smart City Systems", 
      desc: "Automated traffic and utility grid management for futuristic metropolises.", 
      date: "03/29/2026", 
      src: "/HorizontalParallaxGallery/ecommerce_v2.jpg", 
      link: "#" 
    },
    { 
      title: "Neuro-Link Interface", 
      desc: "Deep-neural connectivity for seamless human-machine interaction.", 
      date: "03/30/2026", 
      src: "/HorizontalParallaxGallery/ai_v2.png", 
      link: "#" 
    },
  ], []);

  return (
    <main className="font-inter">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      <ClipHoverGrid 
        projects={projects}
        header={
          <header className="mb-[12vh] flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative z-10 w-full pt-10">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md">
                Archive 2026
              </div>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-[-0.04em] text-[var(--text-default)] transition-colors duration-500">
                Selected Works
              </h1>
              <p className="text-lg text-[var(--text-muted)] mt-6 leading-relaxed max-w-xl transition-colors duration-500">
                A meticulous collection of solutions designed with purpose. From enterprise architecture to immersive digital experiences.
              </p>
            </div>
            <div className="flex flex-col gap-2 items-start md:items-end">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] transition-colors duration-500">Curated by Lumzy Lab</span>
              <div className="h-[1px] w-24 bg-[var(--line-color)] transition-colors duration-500" />
            </div>
          </header>
        }
        footer={
          <footer className="mt-auto border-t border-[var(--line-color)] pt-[5vh] flex flex-col md:flex-row justify-between gap-6 text-[11px] font-medium tracking-[0.1em] text-[var(--text-muted)] uppercase pb-12 transition-colors duration-500 relative z-10 w-full">
            <div className="flex gap-8">
              <span>2026 © Lumzy Lab</span>
              <span>Privacy Policy</span>
              <span>Terms</span>
            </div>
            <div className="flex gap-4 items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>System Operational // Alpha Stage</span>
            </div>
          </footer>
        }
      />
    </main>
  );
}