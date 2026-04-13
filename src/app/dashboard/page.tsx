"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import WavesBackground from "@/components/WavesBackground";
import { GlowCard } from "@/components/GlowCard";

const Icon = ({ name, clazz = "" }: { name: string; clazz?: string }) => (
  <span className={`material-symbols-outlined ${clazz}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
    {name}
  </span>
);



export default function Dashboard() {
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [problems, setProblems] = useState<any[]>([]);
  
  const languages = ["All", "Python", "C++", "Java", "JavaScript"];

  useEffect(() => {
    const fetchProblems = async () => {
      // Attempt to fetch live problems from Supabase
      const { data } = await supabase.from('problems').select('*').order('created_at', { ascending: false });
      
      if (data && data.length > 0) {
        const parsedData = data.map(p => {
           const langMatch = p.description?.match(/\[LANG:(.*?)\]/);
           return {
              ...p,
              language: p.language || (langMatch ? langMatch[1] : "All"),
              description: p.description?.replace(/\[LANG:.*?\]/, '').trim()
           };
        });
        setProblems(parsedData);
      } else {
        // Fallback populated state if no admin problems are uploaded yet
        setProblems([
          { id: "two-sum", title: "Two Sum", difficulty: "Easy", time_limit_mins: 15, language: "All", description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", category: "Data Structures" },
          { id: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Medium", time_limit_mins: 45, language: "Python", description: "Reverse a singly linked list. A very popular question that tests your understanding of pointer manipulation.", category: "Data Structures" },
          { id: "longest-palindromic", title: "Longest Palindromic Substring", difficulty: "Medium", time_limit_mins: 30, language: "C++", description: "Given a string s, return the longest palindromic substring in s. A classic dynamic programming challenge.", category: "Dynamic Programming" },
          { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", time_limit_mins: 10, language: "All", description: "Determine if the input string is valid by checking if brackets are closed in the correct order using a stack.", category: "Data Structures" },
          { id: "sudoku-solver", title: "Sudoku Solver", difficulty: "Hard", time_limit_mins: 120, language: "Java", description: "Write a program to solve a Sudoku puzzle by filling the empty cells. Requires recursive backtracking techniques.", category: "Math" },
        ]);
      }
    };

    fetchProblems();
  }, []);

  const filteredProblems = problems.filter((prob) => {
    const matchesSearch = prob.title.toLowerCase().includes(searchQuery.toLowerCase()) || prob.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = activeLanguage === "All" || prob.language === activeLanguage || prob.language === "All";
    return matchesSearch && matchesLang;
  });

  return (
    <div className="relative min-h-screen bg-transparent text-foreground font-body selection:bg-primary/30 pb-32">
      {/* Interactive Waves Environment globally applied! */}
      <WavesBackground opacity={0.5} />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
              <Icon name="terminal" clazz="text-primary text-2xl" />
              <span className="text-2xl font-headline font-bold tracking-tighter text-white uppercase flex items-center gap-2">
                CodeArena
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-primary font-bold font-label text-sm tracking-wide">Problems</Link>
              <Link href="/leaderboard" className="text-zinc-500 hover:text-white transition-colors font-label text-sm tracking-wide">Leaderboard</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Icon name="search" clazz="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-container-low/50 backdrop-blur-md border border-white/5 focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-4 py-2 text-sm w-64 placeholder:text-zinc-500 transition-all outline-none text-white shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
                placeholder="Search problems..."
                type="text"
              />
            </div>
            <button className="p-2 rounded-xl hover:bg-zinc-800/50 transition-colors text-zinc-400">
              <Icon name="notifications" />
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-surface-container-high flex items-center justify-center text-primary font-bold">
              SJ
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24 px-6 max-w-[1440px] mx-auto">
        <header className="mb-12">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="font-headline text-5xl font-bold tracking-tight mb-4">
            Algorithm <span className="text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Arena</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-zinc-400 max-w-2xl text-lg leading-relaxed font-light">
            Master the world&apos;s most challenging technical problems with real-time feedback and detailed performance metrics.
          </motion.p>
        </header>

        {/* Filters Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-4 mb-12">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLanguage(lang)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all border ${
                  activeLanguage === lang
                    ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                    : "bg-surface-container/30 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                }`}
              >
                <Icon name="terminal" clazz="text-sm" />
                {lang}
              </button>
            ))}
        </motion.div>

        {/* Problem Grid with beautiful GlowCard Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.length === 0 ? (
            <div className="col-span-full py-20 text-center text-zinc-500 glass-card rounded-3xl border border-white/5">
               <Icon name="search_off" clazz="text-4xl mb-4 text-zinc-600" />
               <p className="text-lg">No problems found matching your criteria</p>
            </div>
          ) : (
            filteredProblems.map((prob) => (
              <Link href={`/editor/${prob.id}`} key={prob.id} className="block w-full h-full group active:scale-[0.98] transition-all">
                <GlowCard 
                  glowColor="blue" 
                  className="w-full h-full flex flex-col p-6 bg-surface-container-low/40 border border-white/10"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                        prob.difficulty === 'Easy' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                        prob.difficulty === 'Medium' ? 'bg-tertiary/20 text-tertiary border border-tertiary/30' :
                        'bg-error/20 text-error border border-error/30'
                      }`}>
                        {prob.difficulty}
                      </span>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                        <Icon name="schedule" clazz="text-sm text-primary" /> 
                        {prob.time_limit_mins || 30}m
                      </div>
                      {prob.language && prob.language !== "All" && (
                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-widest bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20 text-secondary">
                          <Icon name="terminal" clazz="text-sm" /> 
                          {prob.language}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-headline text-2xl font-bold mb-3 text-white group-hover:text-primary transition-colors flex items-center justify-between">
                    {prob.title}
                    <Icon name="arrow_forward" clazz="text-zinc-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </h3>
                  
                  <p className="text-zinc-400 text-sm line-clamp-2 font-light mb-8 flex-grow leading-relaxed">
                    {prob.description}
                  </p>

                  <div className="flex items-center justify-end mt-auto pt-4 border-t border-white/5">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full border-2 border-surface-container bg-surface-variant shadow-md" />
                      <div className="w-7 h-7 rounded-full border-2 border-surface-container bg-surface-bright shadow-md" />
                      <div className="w-7 h-7 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary shadow-md">
                        +10k
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
