"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

interface WaveConfig {
  offset: number;
  amplitude: number;
  frequency: number;
  color: string;
  opacity: number;
}

export default function WavesBackground({ opacity = 1 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const targetMouseRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const themeColors = {
      backgroundTop: "rgba(14, 14, 14, 1)",
      backgroundBottom: "rgba(10, 10, 12, 1)",
      wavePalette: [
        { offset: 0, amplitude: 70, frequency: 0.003, color: "rgba(59, 130, 246, 0.8)", opacity: 0.45 },
        { offset: Math.PI / 2, amplitude: 90, frequency: 0.0026, color: "rgba(139, 92, 246, 0.7)", opacity: 0.35 },
        { offset: Math.PI, amplitude: 60, frequency: 0.0034, color: "rgba(14, 165, 233, 0.65)", opacity: 0.3 },
        { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: "rgba(99, 102, 241, 0.25)", opacity: 0.25 },
        { offset: Math.PI * 2, amplitude: 55, frequency: 0.004, color: "rgba(255, 255, 255, 0.15)", opacity: 0.2 },
      ] satisfies WaveConfig[],
    };

    const mouseInfluence = 70;
    const influenceRadius = 320;
    const smoothing = 0.1;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const recenterMouse = () => {
      mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
      targetMouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", (e) => (targetMouseRef.current = { x: e.clientX, y: e.clientY }));
    window.addEventListener("mouseleave", recenterMouse);

    resizeCanvas();
    recenterMouse();

    const drawWave = (wave: WaveConfig) => {
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 4) {
        const dx = x - mouseRef.current.x;
        const dy = canvas.height / 2 - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / influenceRadius);
        const mouseEffect = influence * mouseInfluence * Math.sin(time * 0.001 + x * 0.01 + wave.offset);

        const y = canvas.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.45) +
          mouseEffect;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = wave.color;
      ctx.globalAlpha = wave.opacity;
      ctx.shadowBlur = 35;
      ctx.shadowColor = wave.color;
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      time += 1;
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * smoothing;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * smoothing;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, themeColors.backgroundTop);
      gradient.addColorStop(1, themeColors.backgroundBottom);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      themeColors.wavePalette.forEach(drawWave);
      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", (e) => (targetMouseRef.current = { x: e.clientX, y: e.clientY }));
      window.removeEventListener("mouseleave", recenterMouse);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div style={{ opacity }} className="pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-transparent">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/[0.05] blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-purple-500/[0.04] blur-[120px]" />
      </div>
      {/* Light overlay to make text readable in certain views */}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]"></div>
    </div>
  );
}
