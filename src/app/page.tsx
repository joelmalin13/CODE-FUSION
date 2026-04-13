"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";

type Point = { x: number; y: number };

interface WaveConfig {
  offset: number;
  amplitude: number;
  frequency: number;
  color: string;
  opacity: number;
}

const Icon = ({ name, clazz = "" }: { name: string; clazz?: string }) => (
  <span className={`material-symbols-outlined ${clazz}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
    {name}
  </span>
);

const highlightPills = [
  "AI-Powered Hints",
  "Cloud Sandboxing",
  "Real-time Leaderboard",
] as const;


const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function GlowyLandingPage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [role, setRole] = useState<"student" | "professor">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    // CodeArena Brand Colors for the Waves
    const themeColors = {
      backgroundTop: "rgba(14, 14, 14, 1)",
      backgroundBottom: "rgba(10, 10, 12, 1)",
      wavePalette: [
        { offset: 0, amplitude: 70, frequency: 0.003, color: "rgba(59, 130, 246, 0.8)", opacity: 0.45 }, // Primary Blue
        { offset: Math.PI / 2, amplitude: 90, frequency: 0.0026, color: "rgba(139, 92, 246, 0.7)", opacity: 0.35 }, // Accent Purple
        { offset: Math.PI, amplitude: 60, frequency: 0.0034, color: "rgba(14, 165, 233, 0.65)", opacity: 0.3 }, // Sky Blue
        { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: "rgba(99, 102, 241, 0.25)", opacity: 0.25 }, // Indigo
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
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("codearena_user", email || "Anonymous");
    }
    setTimeout(() => {
      if (role === "student") router.push("/dashboard");
      else router.push("/admin");
    }, 1000);
  };

  return (
    <div className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0e0e0e] text-white">
      {/* Dynamic Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full z-0" />

      {/* Glow Effects */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/[0.05] blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-purple-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:px-8 lg:px-12">
        {!showLogin ? (
           <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
             <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 backdrop-blur-md">
               <Icon name="auto_awesome" clazz="text-primary text-sm" /> Next-Gen Platform
             </motion.div>

             <motion.h1 variants={itemVariants} className="mb-6 text-4xl font-headline font-bold tracking-tighter md:text-6xl lg:text-7xl">
               Welcome to Code<span className="text-primary">Arena</span>
             </motion.h1>

             <motion.p variants={itemVariants} className="mx-auto mb-10 max-w-2xl text-lg text-white/70 md:text-xl font-light leading-relaxed">
               Execute code instantly in the cloud. Get AI-driven hints when you&apos;re stuck. Compete globally on the real-time leaderboard.
             </motion.p>

             <motion.div variants={itemVariants} className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
               <button onClick={() => setShowLogin(true)} className="group flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-white px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95">
                 Launch Arena
                 <Icon name="arrow_forward" clazz="transition-transform group-hover:translate-x-1" />
               </button>
             </motion.div>

             <motion.ul variants={itemVariants} className="mb-12 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
               {highlightPills.map((pill) => (
                 <li key={pill} className="rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md">
                   {pill}
                 </li>
               ))}
             </motion.ul>


           </motion.div>
        ) : (
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-auto">
             <div className="glass-card border border-white/10 rounded-[2rem] p-8 w-full relative z-10 shadow-[0_0_50px_rgba(59,130,246,0.15)] bg-black/60 backdrop-blur-2xl">
               <button onClick={() => setShowLogin(false)} className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors">
                  <Icon name="arrow_back" />
               </button>
               
               <div className="flex flex-col items-center mb-10 mt-2">
                 <Icon name="terminal" clazz="text-primary text-4xl mb-4" />
                 <h2 className="text-2xl font-headline font-bold tracking-tight text-white uppercase">Access Portal</h2>
               </div>

               <div className="flex bg-white/5 rounded-xl p-1 mb-8 relative border border-white/10">
                 <button onClick={() => setRole("student")} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg z-10 transition-colors ${role === "student" ? "text-white" : "text-zinc-500 hover:text-white"}`}>Student</button>
                 <button onClick={() => setRole("professor")} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg z-10 transition-colors ${role === "professor" ? "text-white" : "text-zinc-500 hover:text-white"}`}>Admin</button>
                 <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary/80 backdrop-blur-md rounded-lg transition-transform duration-300 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)] z-0 ${role === "professor" ? "translate-x-[calc(100%+2px)]" : "translate-x-0"}`} />
               </div>

               <form onSubmit={handleLogin} className="flex flex-col gap-5">
                 <div className="relative">
                   <Icon name="person" clazz="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[20px]" />
                   <input required value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder="Enter Username for Auth" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body text-sm" />
                 </div>

                 <div className="relative">
                   <Icon name="lock" clazz="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[20px]" />
                   <input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body text-sm" />
                 </div>

                 <button type="submit" disabled={isLoading} className="w-full bg-white text-black font-bold uppercase tracking-widest rounded-xl py-3.5 mt-4 transition-all active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-70 disabled:active:scale-100">
                   {isLoading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Icon name="progress_activity" /></motion.span> : "Enter Arena"}
                 </button>
               </form>
             </div>
           </motion.div>
        )}
      </div>
    </div>
  );
}
