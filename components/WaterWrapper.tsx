"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import * as THREE from "three";

const simulationVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const simulationFragmentShader = `
uniform sampler2D textureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform int frame;

varying vec2 vUv;

const float delta = 1.4;

void main() {
  vec2 uv = vUv;
  if (frame == 0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec4 data = texture2D(textureA, uv);
  float pressure = data.x;
  float pVel = data.y;

  vec2 texelSize = 1.0 / resolution;

  float p_right = texture2D(textureA, uv + vec2(texelSize.x, 0.0)).x;
  float p_left  = texture2D(textureA, uv + vec2(-texelSize.x, 0.0)).x;
  float p_up    = texture2D(textureA, uv + vec2(0.0, texelSize.y)).x;
  float p_down  = texture2D(textureA, uv + vec2(0.0, -texelSize.y)).x;

  if (uv.x <= texelSize.x) p_left = p_right;
  if (uv.x >= 1.0 - texelSize.x) p_right = p_left;
  if (uv.y <= texelSize.y) p_down = p_up;
  if (uv.y >= 1.0 - texelSize.y) p_up = p_down;

  pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
  pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;

  pressure += delta * pVel;
  pVel -= 0.005 * delta * pressure;
  pVel *= 1.0 - 0.002 * delta;
  pressure *= 0.999;

  vec2 mouseUV = mouse / resolution;

  if (mouse.x > 0.0) {
    float dist = distance(uv, mouseUV);
    if (dist <= 0.02) {
      pressure += 2.0 * (1.0 - dist / 0.02);
    }
  }

  gl_FragColor = vec4(
    pressure,
    pVel,
    (p_right - p_left) / 2.0,
    (p_up - p_down) / 2.0
  );
}
`;

const specularVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const specularFragmentShader = `
uniform sampler2D simulationTexture;
varying vec2 vUv;

void main() {
  vec4 data = texture2D(simulationTexture, vUv);
  
  // High contrast for displacement mapping channel
  // We use Z and W (dx, dy) for displacement
  // But for specular, we use normals
  vec3 normal = normalize(vec3(-data.z * 2.0, 0.5, -data.w * 2.0));
  vec3 lightDir = normalize(vec3(-3.0, 10.0, 3.0));

  float specular = pow(max(0.0, dot(normal, lightDir)), 60.0) * 1.5;
  
  // Output specular on alpha channel or as white on black
  // gl_FragColor = vec4(vec3(1.0), specular * 0.5);
  gl_FragColor = vec4(vec3(1.0), specular);
}
`;

// Shaders for the displacement map canvas
const displacementVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const displacementFragmentShader = `
uniform sampler2D simulationTexture;
varying vec2 vUv;
void main() {
  vec4 data = texture2D(simulationTexture, vUv);
  // Normalize dx, dy (-1 to 1) to (0 to 1) for the displacement texture
  // SVG feDisplacementMap uses 0.5 as neutral
  float dx = data.z * 0.5 + 0.5;
  float dy = data.w * 0.5 + 0.5;
  gl_FragColor = vec4(dx, dy, 0.0, 1.0);
}
`;

interface WaterWrapperProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export default function WaterWrapper({
  children,
  className = "",
  intensity = 40,
}: WaterWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const specCanvasRef = useRef<HTMLCanvasElement>(null);
  const dispCanvasRef = useRef<HTMLCanvasElement>(null); // Hidden canvas for displacement
  const filterId = useId().replace(/:/g, "");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!containerRef.current || !specCanvasRef.current || !dispCanvasRef.current) return;

    const container = containerRef.current;
    const specCanvas = specCanvasRef.current;
    const dispCanvas = dispCanvasRef.current;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);

    // Three.js setup - Use a single renderer for everything to ensure texture sharing
    const renderer = new THREE.WebGLRenderer({
      canvas: specCanvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const simScene = new THREE.Scene();
    const specScene = new THREE.Scene();
    const dispScene = new THREE.Scene();

    const options = {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: false,
    };

    let rtA = new THREE.WebGLRenderTarget(width * dpr, height * dpr, options);
    let rtB = new THREE.WebGLRenderTarget(width * dpr, height * dpr, options);
    // Render target for capturing displacement data to an array
    let rtDisp = new THREE.WebGLRenderTarget(128, 128, {
      ...options,
      type: THREE.UnsignedByteType, // Needed for readPixels
    });

    // Uint8Array for reading pixels - 128x128 is plenty for displacement map
    const pixelBuffer = new Uint8Array(128 * 128 * 4);
    const dispCtx = dispCanvas.getContext("2d");
    dispCanvas.width = 128;
    dispCanvas.height = 128;

    const mouse = new THREE.Vector2(-1, -1);
    let frame = 0;

    const simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        mouse: { value: mouse },
        resolution: { value: new THREE.Vector2(width * dpr, height * dpr) },
        time: { value: 0 },
        frame: { value: 0 },
      },
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
    });

    const specMaterial = new THREE.ShaderMaterial({
      uniforms: {
        simulationTexture: { value: null },
      },
      vertexShader: specularVertexShader,
      fragmentShader: specularFragmentShader,
      transparent: true,
    });

    const dispMaterial = new THREE.ShaderMaterial({
      uniforms: {
        simulationTexture: { value: null },
      },
      vertexShader: displacementVertexShader,
      fragmentShader: displacementFragmentShader,
    });

    const plane = new THREE.PlaneGeometry(2, 2);
    const simQuad = new THREE.Mesh(plane, simMaterial);
    const specQuad = new THREE.Mesh(plane, specMaterial);
    const dispQuad = new THREE.Mesh(plane, dispMaterial);

    simScene.add(simQuad);
    specScene.add(specQuad);
    dispScene.add(dispQuad);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (rect.height - (e.clientY - rect.top)) * dpr;
    };

    const handleMouseLeave = () => {
      mouse.set(-1, -1);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = (touch.clientX - rect.left) * dpr;
      mouse.y = (rect.height - (touch.clientY - rect.top)) * dpr;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchmove", handleTouchMove);

    let animationId: number;
    const animate = () => {
      simMaterial.uniforms.frame.value = frame++;
      simMaterial.uniforms.time.value = performance.now() / 1000;
      simMaterial.uniforms.textureA.value = rtA.texture;

      // Update simulation
      renderer.setRenderTarget(rtB);
      renderer.render(simScene, camera);

      // Render specular to visible canvas
      specMaterial.uniforms.simulationTexture.value = rtB.texture;
      renderer.setRenderTarget(null);
      renderer.render(specScene, camera);

      // Render displacement to small texture for capture
      dispMaterial.uniforms.simulationTexture.value = rtB.texture;
      renderer.setRenderTarget(rtDisp);
      renderer.render(dispScene, camera);

      // Read pixels back to CPU and update SVG filter
      renderer.readRenderTargetPixels(rtDisp, 0, 0, 128, 128, pixelBuffer);

      if (dispCtx) {
        const imageData = new ImageData(new Uint8ClampedArray(pixelBuffer), 128, 128);
        dispCtx.putImageData(imageData, 0, 0);

        const feImage = document.getElementById(`fe-image-${filterId}`);
        if (feImage) {
          feImage.setAttribute("href", dispCanvas.toDataURL("image/webp", 0.3));
        }
      }

      // Swap render targets
      const temp = rtA;
      rtA = rtB;
      rtB = temp;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      renderer.setSize(newWidth, newHeight);
      rtA.setSize(newWidth * dpr, newHeight * dpr);
      rtB.setSize(newWidth * dpr, newHeight * dpr);
      simMaterial.uniforms.resolution.value.set(newWidth * dpr, newHeight * dpr);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      rtA.dispose();
      rtB.dispose();
      rtDisp.dispose();
    };
  }, [intensity]);

  return (
    <div
      className={`relative group ${className}`}
      ref={containerRef}
      style={{ isolation: "isolate" }}
    >
      {/* Hidden displacement map canvas - must not be display:none for WebGL to always work reliably */}
      <canvas
        ref={dispCanvasRef}
        id={`disp-canvas-${filterId}`}
        className="absolute pointer-events-none opacity-0 -translate-x-full"
        style={{ width: "128px", height: "128px" }}
      />

      {/* SVG Filter for displacement */}
      {/* 
        Note: Using a canvas as a source for feImage is tricky. 
        In modern browsers, we can use a CSS variable or a data URL.
        However, for a real-time effect on many items, we'll use a CSS-only 
        approach or a very high performance SVG filter if possible.
        Actually, let's use the 'feImage' trick with a reference to the canvas.
      */}
      <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="-100%" y="-100%" width="300%" height="300%">
            <feImage
              id={`fe-image-${filterId}`}
              href="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
              result="dispMap"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="dispMap"
              scale={intensity}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Visible Content */}
      <div
        className="relative z-10 transition-transform duration-300"
        style={{
          filter: `url(#${filterId})`,
          // We apply the filter to the children
        }}
      >
        {children}
      </div>

      {/* Specular Overlay */}
      <canvas
        ref={specCanvasRef}
        className="absolute inset-0 z-20 pointer-events-none mix-blend-screen opacity-70"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
