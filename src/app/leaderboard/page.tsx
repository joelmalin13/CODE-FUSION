"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import WavesBackground from "@/components/WavesBackground";
import { GlowCard } from "@/components/GlowCard";

const Icon = ({ name, clazz = "" }: { name: string; clazz?: string }) => (
  <span className={`material-symbols-outlined ${clazz}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
    {name}
  </span>
);

const LEADERBOARD_DATA = [
  { rank: 1, name: "Alexandra Chen", score: 14250, solved: 342, badge: "Grandmaster" },
  { rank: 2, name: "Marcus Johnson", score: 13800, solved: 310, badge: "Master" },
  { rank: 3, name: "Joel Malin", score: 12550, solved: 298, badge: "Master" },
  { rank: 4, name: "Sarah Williams", score: 11200, solved: 245, badge: "Expert" },
  { rank: 5, name: "David Kim", score: 10800, solved: 210, badge: "Expert" },
  { rank: 6, name: "Elena Rodriguez", score: 9500, solved: 180, badge: "Advanced" },
  { rank: 7, name: "Michael Chang", score: 8900, solved: 156, badge: "Advanced" },
];

export default function Leaderboard() {
  return (
    <div className="relative min-h-screen bg-transparent text-foreground font-body selection:bg-primary/30 pb-32">
      <WavesBackground opacity={0.6} />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Icon name="terminal" clazz="text-primary text-2xl" />
              <span className="text-2xl font-headline font-bold tracking-tighter text-white uppercase">CodeArena</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors font-label text-sm tracking-wide">Problems</Link>
              <Link href="#" className="text-zinc-500 hover:text-white transition-colors font-label text-sm tracking-wide">Contests</Link>
              <Link href="/leaderboard" className="text-primary font-bold font-label text-sm tracking-wide">Leaderboard</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl hover:bg-zinc-800/50 transition-colors text-zinc-400">
              <Icon name="notifications" />
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-surface-container-high flex items-center justify-center text-primary font-bold">
              SJ
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24 px-6 max-w-[1200px] mx-auto">
        <header className="mb-12 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="font-headline text-5xl font-bold tracking-tight mb-4 drop-shadow-md">
            Global <span className="text-tertiary">Leaderboard</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Real-time rankings of top developers across the globe. Solve problems, optimize your code, and climb the Arena ranks.
          </motion.p>
        </header>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-16 items-end max-w-4xl mx-auto mt-20">
           {/* Rank 2 */}
           <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest border-4 border-slate-300 flex items-center justify-center text-xl font-bold mb-4 z-10 shadow-[0_0_20px_rgba(203,213,225,0.3)] text-slate-300">
                2
              </div>
              <GlowCard glowColor="blue" className="w-full bg-black/40 h-40 flex flex-col items-center justify-start pt-6 text-center px-2">
                 <p className="font-bold text-white line-clamp-1">{LEADERBOARD_DATA[1].name}</p>
                 <p className="text-tertiary font-bold mt-2">{LEADERBOARD_DATA[1].score.toLocaleString()} XP</p>
                 <p className="text-xs text-zinc-500">{LEADERBOARD_DATA[1].solved} Solved</p>
              </GlowCard>
           </motion.div>
           
           {/* Rank 1 */}
           <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest border-4 border-yellow-400 flex items-center justify-center text-3xl font-bold mb-4 z-10 shadow-[0_0_30px_rgba(250,204,21,0.5)] text-yellow-400">
                <Icon name="social_leaderboard" clazz="text-3xl" />
              </div>
              <GlowCard glowColor="orange" className="w-full bg-black/50 h-56 flex flex-col items-center justify-start pt-8 text-center px-2">
                 <p className="font-bold text-lg text-white line-clamp-1">{LEADERBOARD_DATA[0].name}</p>
                 <p className="text-yellow-400 font-black text-xl mt-2 tracking-widest">{LEADERBOARD_DATA[0].score.toLocaleString()} XP</p>
                 <p className="text-xs text-zinc-400 mt-1 uppercase font-bold">{LEADERBOARD_DATA[0].badge}</p>
                 <p className="text-xs text-zinc-500 mt-2">{LEADERBOARD_DATA[0].solved} Problems Solved</p>
              </GlowCard>
           </motion.div>

           {/* Rank 3 */}
           <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest border-4 border-amber-600 flex items-center justify-center text-xl font-bold mb-4 z-10 shadow-[0_0_20px_rgba(217,119,6,0.2)] text-amber-600">
                3
              </div>
              <GlowCard glowColor="purple" className="w-full bg-black/40 h-32 flex flex-col items-center justify-start pt-4 text-center px-2">
                 <p className="font-bold text-white line-clamp-1">{LEADERBOARD_DATA[2].name}</p>
                 <p className="text-tertiary font-bold mt-2">{LEADERBOARD_DATA[2].score.toLocaleString()} XP</p>
                 <p className="text-xs text-zinc-500">{LEADERBOARD_DATA[2].solved} Solved</p>
              </GlowCard>
           </motion.div>
        </div>

        {/* Leaderboard Table List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full max-w-4xl mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <GlowCard glowColor="blue" className="bg-black/40/20 backdrop-blur-md overflow-hidden p-0 w-full">
          <div className="grid grid-cols-12 gap-4 p-6 bg-white/5 border-b border-white/5 text-xs font-bold uppercase tracking-widest text-zinc-500">
             <div className="col-span-2 text-center">Rank</div>
             <div className="col-span-4">Developer</div>
             <div className="col-span-3 text-right">Problems Solved</div>
             <div className="col-span-3 text-right pr-4">Total Score</div>
          </div>
          <div className="divide-y divide-white/5">
             {LEADERBOARD_DATA.slice(3).map((user) => (
                <div key={user.rank} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/5 transition-colors group">
                   <div className="col-span-2 text-center font-bold text-zinc-400 group-hover:text-white transition-colors">#{user.rank}</div>
                   <div className="col-span-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                         {user.name.charAt(0)}
                      </div>
                      <div>
                         <p className="font-bold text-white">{user.name}</p>
                         <p className="text-xs text-zinc-500">{user.badge}</p>
                      </div>
                   </div>
                   <div className="col-span-3 text-right text-zinc-400 font-mono text-sm">{user.solved}</div>
                   <div className="col-span-3 text-right pr-4 font-black text-primary font-mono tracking-wider">{user.score.toLocaleString()} XP</div>
                </div>
             ))}
          </div>
          </GlowCard>
        </motion.div>
      </main>
    </div>
  );
}
