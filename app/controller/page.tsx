"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Head from "next/head";

const FRAME_COUNT = 240;
const START_FRAME = 1;

const getFrameUrl = (index: number) => {
  return `/Ps5ControllerFrames/ezgif-frame-${index.toString().padStart(3, "0")}.jpg`;
};

export default function ControllerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = START_FRAME; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
      };
      // For any potential errors in image loading, still count it so we don't get stuck forever
      img.onerror = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
      };
      loadedImages.push(img);
    }

    setImages(loadedImages);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // We do window sized canvas for full bleed
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(frameIndex.get());
    };

    const render = (progressValue: number) => {
      const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(progressValue)));
      const img = images[index];

      if (img && img.complete && img.naturalWidth > 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Drawing img keeping aspect ratio and centering it
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        // The prompt says "centered and scaled to fit while preserving aspect ratio", we can use Math.max to behave like object-fit: cover, or object-fit: contain (min)
        // With a black background, scale to contain often works best if background matches, but the prompt says 
        // "centered and scaled to fit while preserving aspect ratio". Let's use `Math.max` for a full bleed / object-cover feel.
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        context.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShift_x,
          centerShift_y,
          img.width * ratio,
          img.height * ratio
        );
      }
    };

    handleResize(); // set initial size
    window.addEventListener("resize", handleResize);

    const unsubscribe = frameIndex.on("change", (latest) => {
      render(latest);
    });

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [images, frameIndex]);

  // Framer motion hooks for storytelling overlays
  // HERO (0 - 15%)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  // ENGINEERING REVEAL (15 - 40%)
  const engineeringOpacity = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.4], [0, 1, 1, 0]);
  const engineeringY = useTransform(scrollYProgress, [0.15, 0.2], [50, 0]);

  // NOISE CANCELLING (40 - 65%)
  const noiseOpacity = useTransform(scrollYProgress, [0.4, 0.45, 0.6, 0.65], [0, 1, 1, 0]);
  const noiseY = useTransform(scrollYProgress, [0.4, 0.45], [50, 0]);

  // SOUND & UPSCALING (65 - 85%)
  const soundOpacity = useTransform(scrollYProgress, [0.65, 0.7, 0.8, 0.85], [0, 1, 1, 0]);
  const soundY = useTransform(scrollYProgress, [0.65, 0.7], [50, 0]);

  // REASSEMBLY & CTA (85 - 100%)
  const ctaOpacity = useTransform(scrollYProgress, [0.85, 0.9, 1], [0, 1, 1]);
  const ctaY = useTransform(scrollYProgress, [0.85, 0.9], [50, 0]);

  const navOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const navBackdrop = useTransform(scrollYProgress, [0, 0.05], ["rgba(5,5,5,0)", "rgba(5,5,5,0.75)"]);

  return (
    <main className="bg-[#050505] text-white min-h-screen font-sans selection:bg-[#00D6FF] selection:text-black">
      <Head>
        <title>Sony WH-1000XM6</title>
        <meta name="description" content="Silence, perfected. The flagship wireless noise cancelling headphones from Sony." />
      </Head>

      {/* NAVBAR */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5 transition-all duration-300"
        style={{
          opacity: navOpacity,
          backgroundColor: navBackdrop,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="text-xl font-medium tracking-tight text-white/90">
          WH‑1000XM6
        </div>
        <div className="hidden md:flex items-center space-x-10 text-[15px] font-medium text-white/60">
          <Link href="#overview" className="hover:text-white transition-colors duration-300">Overview</Link>
          <Link href="#technology" className="hover:text-white transition-colors duration-300">Technology</Link>
          <Link href="#noise-cancelling" className="hover:text-white transition-colors duration-300">Noise Cancelling</Link>
          <Link href="#specs" className="hover:text-white transition-colors duration-300">Specs</Link>
          <Link href="#buy" className="hover:text-white transition-colors duration-300">Buy</Link>
        </div>
        <div>
          <button className="px-5 py-2 text-[15px] font-medium text-white rounded-full bg-gradient-to-r from-[#0050FF]/25 to-[#00D6FF]/25 border border-white/10 hover:border-[#00D6FF]/60 hover:shadow-[0_0_15px_rgba(0,214,255,0.25)] transition-all duration-300">
            Experience WH‑1000XM6
          </button>
        </div>
      </motion.nav>

      {/* STORY CONTAINER */}
      <div ref={containerRef} className="relative h-[400vh]">
        
        {/* STICKY CANVAS CONTAINER */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#050505]">
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ backgroundColor: "#050505" }}
          />

          {/* BACKGROUND GRADIENT GLOWS */}
          <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(0,80,255,0.1)_0%,transparent_60%)]" />
          </div>

          {/* OVERLAYS */}
          
          {/* HERO (0 - 15%) */}
          <motion.div
            className="absolute inset-x-0 bottom-[15vh] flex flex-col items-center justify-end pointer-events-none text-center px-4 z-10 mix-blend-difference"
            style={{ opacity: heroOpacity, y: heroY }}
          >
            <h1 className="text-6xl md:text-[7rem] leading-[1.1] font-bold tracking-tight mb-2 text-white">
              Sony WH‑1000XM6
            </h1>
            <p className="text-2xl md:text-3xl font-medium tracking-tight text-white/90">
              Silence, perfected.
            </p>
          </motion.div>

          {/* ENGINEERING REVEAL (15 - 40%) */}
          <motion.div
            className="absolute inset-y-0 left-0 md:left-[10vw] flex flex-col justify-center pointer-events-none px-6 z-10 mix-blend-difference"
            style={{ opacity: engineeringOpacity, y: engineeringY }}
          >
            <h2 className="text-5xl md:text-[5rem] leading-[1.1] font-bold tracking-tight text-white">
              Precision-<br/>engineered.
            </h2>
          </motion.div>

          {/* NOISE CANCELLING (40 - 65%) */}
          <motion.div
            className="absolute inset-y-0 right-0 md:right-[10vw] flex flex-col justify-center items-start md:items-end pointer-events-none px-6 text-left md:text-right z-10 mix-blend-difference"
            style={{ opacity: noiseOpacity, y: noiseY }}
          >
            <h2 className="text-5xl md:text-[5rem] leading-[1.1] font-bold tracking-tight text-white">
              Adaptive <br/> noise cancelling.
            </h2>
          </motion.div>

          {/* SOUND & UPSCALING (65 - 85%) */}
          <motion.div
            className="absolute inset-y-0 left-0 md:left-[10vw] flex flex-col justify-center pointer-events-none px-6 z-10 mix-blend-difference"
            style={{ opacity: soundOpacity, y: soundY }}
          >
            <h2 className="text-5xl md:text-[5rem] leading-[1.1] font-bold tracking-tight text-white">
              Immersive, <br/> lifelike sound.
            </h2>
          </motion.div>

          {/* REASSEMBLY & CTA (85 - 100%) */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-end pb-[15vh] pointer-events-none z-20"
            style={{ opacity: ctaOpacity, y: ctaY }}
          >
            <h2 className="text-5xl md:text-[6rem] leading-[1.1] font-bold tracking-tight mb-12 text-white text-center px-4 max-w-5xl mix-blend-difference">
              Hear everything. <br/> Feel nothing else.
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-8 pointer-events-auto">
              <button className="px-12 py-5 text-[17px] font-semibold text-black rounded-full bg-white hover:bg-neutral-200 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Experience WH‑1000XM6
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FULL SCREEN LOADING OVERLAY */}
      {imagesLoaded < (FRAME_COUNT * 0.9) && ( // Allow viewing when 90% loaded to not block too long
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center">
          <div className="text-2xl font-light tracking-widest text-white mb-8 opacity-80">SONY</div>
          <div className="w-[200px] md:w-[300px] h-[2px] bg-white/10 overflow-hidden rounded-full">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#0050FF] to-[#00D6FF] shadow-[0_0_10px_#00D6FF]" 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (imagesLoaded / FRAME_COUNT) * 100)}%` }}
              transition={{ ease: "easeOut", duration: 0.1 }}
            />
          </div>
          <div className="mt-6 text-[11px] font-mono text-white/40 uppercase tracking-[0.3em]">
            Loading cinematic experience
          </div>
        </div>
      )}
    </main>
  );
}
