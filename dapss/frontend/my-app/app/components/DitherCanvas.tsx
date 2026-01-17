"use client";

import { useEffect, useRef } from "react";

export default function DitherCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = {
      waveColor: [36, 255, 80],  
      pixelSize: 5, 
      waveAmplitude: 0.3,
      waveFrequency: 5,
      waveSpeed: 0.01,
      mouseRadius: 400,
      easeFactor: 0.08,
      colorNum: 4,
      vignetteStrength: 1.8,
    };

    let time = 0;
    
    // Animation state
    let targetMouse = { x: -1000, y: -1000 };
    let currentMouse = { x: -1000, y: -1000 };
    let isHovering = false;
    let currentRadius = 0; 

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth / config.pixelSize;
      canvas.height = window.innerHeight / config.pixelSize;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX / config.pixelSize;
      targetMouse.y = e.clientY / config.pixelSize;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    const handleMouseEnter = () => {
      isHovering = true;
    };

    const animate = () => {
      time += config.waveSpeed;

      // Instant mouse movement (no smoothing per user request)
      currentMouse.x = targetMouse.x;
      currentMouse.y = targetMouse.y;

      // Smooth radius interpolation (Ease In / Ease Out)
      const targetRadius = isHovering ? config.mouseRadius : 0;
      currentRadius += (targetRadius - currentRadius) * config.easeFactor;

      // Clear background
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const dx = x - currentMouse.x;
          const dy = y - currentMouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Interaction influence dependent on smoothed radius
          let mouseInfluence = 0;
          if (currentRadius > 0.1) {
             mouseInfluence = Math.exp(-dist / (currentRadius / config.pixelSize)) * 1.5;
          }

          const wave =
            Math.sin(x * 0.05 * config.waveFrequency + time) *
            Math.cos(y * 0.05 * config.waveFrequency + time) *
            config.waveAmplitude;

          let brightness = wave + mouseInfluence;
          brightness =
            Math.floor(brightness * config.colorNum) / config.colorNum;

          const vignetteDx = x - centerX;
          const vignetteDy = y - centerY;
          const vignetteDist = Math.sqrt(
            vignetteDx * vignetteDx + vignetteDy * vignetteDy
          );
          const vignetteRatio = vignetteDist / maxDist;

          const vignette =
            1 - Math.pow(vignetteRatio, 2.5) * config.vignetteStrength;
          const vignetteFactor = Math.max(0, Math.min(1, vignette));

          brightness *= vignetteFactor;

          const index = (y * canvas.width + x) * 4;
          data[index] = config.waveColor[0] * brightness; 
          data[index + 1] = config.waveColor[1] * brightness;
          data[index + 2] = config.waveColor[2] * brightness; 
          data[index + 3] = 255; 
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas id="ditherCanvas" ref={canvasRef} />;
}
