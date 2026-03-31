"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const WireframeShape: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.3;
      meshRef.current.rotation.y = time * 0.4;
    }
    if (outerRef.current) {
      outerRef.current.rotation.x = -time * 0.2;
      outerRef.current.rotation.y = -time * 0.25;
    }
  });

  return (
    <group>
      {/* Inner Core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.4} />
      </mesh>
      
      {/* Outer Shell */}
      <mesh ref={outerRef} scale={1.5}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.1} />
      </mesh>

      {/* Glow Sparkles (Subtle) */}
      {[...Array(6)].map((_, i) => (
         <mesh key={i} position={[Math.sin(i) * 1.2, Math.cos(i) * 1.2, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
         </mesh>
      ))}
    </group>
  );
};

const HolographicTerminal: React.FC = () => {
  return (
    <div className="w-[200px] h-[200px] absolute -right-4 -top-4 opacity-40 mix-blend-screen pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={10} />
        <WireframeShape />
      </Canvas>
      
      {/* HUD Scanner HUD labels around the holo */}
      <div className="absolute inset-0 flex flex-col justify-between items-start font-mono text-[8px] text-cyan-500/50 uppercase tracking-tighter p-4 border border-cyan-500/10 rounded-full animate-pulse">
         <div className="w-full flex justify-between">
            <span>Scan_V7_01</span>
            <span>0x7F_K</span>
         </div>
         <div className="w-full flex justify-between">
            <span>CORE_SYNC</span>
            <span>84.2%</span>
         </div>
      </div>
    </div>
  );
};

export default HolographicTerminal;
