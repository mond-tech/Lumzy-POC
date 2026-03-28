"use client";

import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useGLTF, useTexture, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function DogModel() {
  const model = useGLTF("/models/dog.drc.glb");

  // State-based actions instead of ref to avoid inconsistencies
  const { actions } = useAnimations(model.animations, model.scene);

  useEffect(() => {
    if (actions["Take 001"]) {
      actions["Take 001"].reset().fadeIn(0.5).play();
    }
    return () => {
      actions["Take 001"]?.fadeOut(0.5);
    };
  }, [actions]);

  // Load textures with useMemo to prevent recreation
  const textures = useTexture([
    "/dog_normals.jpg",
    "/branches_diffuse.jpeg",
    "/branches_normals.jpeg",
    "/matcap/mat-2.png",
  ]);

  const [normalMap, branchMap, branchNormalMap, matcap] = useMemo(() => {
    return textures.map((t, i) => {
      t.colorSpace = THREE.SRGBColorSpace;
      if (i === 0) t.flipY = false; // specific for dog_normals
      return t;
    });
  }, [textures]);

  // Persistent Materials
  const dogMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
    normalMap: normalMap,
    matcap: matcap,
  }), [normalMap, matcap]);

  const branchMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
    normalMap: branchNormalMap,
    map: branchMap,
  }), [branchNormalMap, branchMap]);

  // Single traversal to apply materials
  useEffect(() => {
    model.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = mesh.name.includes("DOG") ? dogMaterial : branchMaterial;
        mesh.frustumCulled = false; // Prevent flickering when moving fast
      }
    });
  }, [model.scene, dogMaterial, branchMaterial]);

  // Add subtle rotation to keep it alive
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.PI / 3.9 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={model.scene}
        position={[0, -0.15, 0]}
        scale={0.4}
      />
      <directionalLight position={[0, 5, 5]} intensity={5} />
      <ambientLight intensity={0.5} />
    </group>
  );
}

useGLTF.preload("/models/dog.drc.glb");
