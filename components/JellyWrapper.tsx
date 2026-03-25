"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";

interface JellyWrapperProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function JellyWrapper({
  children,
  className = "",
  intensity = 30, // How much the jelly effect distorts
}: JellyWrapperProps) {
  const filterId = React.useId().replace(/:/g, "");
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className={className}>{children}</div>;

  useEffect(() => {
    const container = containerRef.current;
    const filter = filterRef.current;
    if (!container || !filter) return;

    let hoverTween: gsap.core.Tween;

    const handleMouseEnter = () => {
      // Animate the scale of displacement up to the intensity to create the liquid bump
      hoverTween = gsap.to(filter, {
        attr: { scale: intensity },
        duration: 0.8,
        ease: "elastic.out(1, 0.3)",
      });
    };

    const handleMouseLeave = () => {
      // Snap it back down to 0 smoothly
      if (hoverTween) hoverTween.kill();
      gsap.to(filter, {
        attr: { scale: 0 },
        duration: 0.8,
        ease: "power2.out",
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Optional: modify base frequency slightly based on mouse movement to make it look active
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      if (turbulenceRef.current) {
        gsap.to(turbulenceRef.current, {
          attr: { baseFrequency: `${0.01 + x * 0.02} ${0.01 + y * 0.02}` },
          duration: 0.5,
          ease: "power1.out"
        });
      }
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mousemove", handleMouseMove);

    // Continuous subtle wave animation
    const waveAnimation = gsap.to(turbulenceRef.current, {
      attr: { baseFrequency: "0.015 0.02" },
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousemove", handleMouseMove);
      waveAnimation.kill();
    };
  }, [intensity]);

  return (
    <div className={`relative ${className}`} ref={containerRef} style={{ filter: `url(#${filterId})` }}>
      {/* Hidden SVG Filter Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.01 0.01"
              numOctaves="2"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              in="noise"
              result="coloredNoise"
            />
            <feDisplacementMap
              ref={filterRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      
      {/* Wrapped Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
