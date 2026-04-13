"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import WavesBackground from "@/components/WavesBackground";
import { GlowCard } from "@/components/GlowCard";

const Icon = ({ name, clazz = "" }: { name: string; clazz?: string }) => (
  <span className={`material-symbols-outlined ${clazz}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
    {name}
  </span>
);

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [language, setLanguage] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [problems, setProblems] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchProblems = async () => {
      const { data } = await supabase.from('problems').select('*').order('created_at', { ascending: false });
      if (data) {
        const parsedData = data.map(p => {
           const langMatch = p.description?.match(/\[LANG:(.*?)\]/);
           return {
              ...p,
              language: langMatch ? langMatch[1] : "All",
              description: p.description?.replace(/\[LANG:.*?\]/, '').trim()
           };
        });
        setProblems(parsedData);
      }
    };
    fetchProblems();
    
    // Load student submissions automatically from Hackathon Storage
    const saved = localStorage.getItem("codearena_submissions");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubmissions(JSON.parse(saved));
    }
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.from('problems').insert([
      { title, description: `${description}\n\n[LANG:${language}]`, difficulty, time_limit_mins: 30 }
    ]);

    if (error) {
       console.error(error);
       setMessage("Failed to create problem.");
    } else {
       setMessage("Problem successfully created!");
       setTitle("");
       setDescription("");
       // Would be better to extract fetchProblems out, but reloading page handles it for hackathon
       window.location.reload();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen bg-transparent text-foreground font-body selection:bg-primary/30 pb-32">
      <WavesBackground opacity={0.4} />

      <nav className="fixed top-0 z-50 w-full bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Icon name="terminal" clazz="text-primary text-2xl" />
              <span className="text-2xl font-headline font-bold tracking-tighter text-white uppercase">
                CodeArena Admin
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                PR
             </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24 px-6 max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
         <section>
            <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-2"><Icon name="add_circle" clazz="text-primary"/> Upload Problem</h2>
            <GlowCard glowColor="purple" className="w-full bg-surface-container-low/40 border border-white/5 space-y-4">
            <form onSubmit={handleUpload}>
               <div className="mb-4">
                 <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Problem Title</label>
                 <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full mt-2 bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="e.g. Two Sum" />
               </div>
               <div className="mb-4">
                 <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Difficulty</label>
                 <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full mt-2 bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-sm">
                   <option>Easy</option>
                   <option>Medium</option>
                   <option>Hard</option>
                 </select>
               </div>
               <div className="mb-4">
                 <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Language Focus</label>
                 <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full mt-2 bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-sm">
                   <option>All</option>
                   <option>Python</option>
                   <option>C++</option>
                   <option>Java</option>
                   <option>JavaScript</option>
                 </select>
               </div>
               <div className="mb-4">
                 <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Description</label>
                 <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="w-full mt-2 bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="Explain the problem statement and examples here..." />
               </div>
               
               <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl mt-4 hover:opacity-90 transition-opacity">
                 {isSubmitting ? "Uploading..." : "Upload Problem to Arena"}
               </button>
               {message && <p className="text-sm mt-4 text-secondary">{message}</p>}
            </form>
            </GlowCard>
         </section>

         <section>
             <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-2"><Icon name="database" clazz="text-primary"/> Live Problems</h2>
             <div className="space-y-4">
               {problems.length === 0 ? (
                 <div className="text-zinc-500 glass-card p-6 rounded-2xl border border-white/5">No problems uploaded yet.</div>
               ) : (
                 problems.map((prob) => (
                   <GlowCard key={prob.id} glowColor="blue" className="w-full bg-surface-container-low/60 border border-white/5 flex justify-between items-center group">
                      <div className="flex-grow w-full">
                         <h3 className="font-bold text-primary">{prob.title}</h3>
                         <div className="flex gap-2 text-xs text-on-surface-variant mt-1">
                            <span className="uppercase">{prob.difficulty}</span>
                            <span>•</span>
                            <span className="text-secondary">{prob.language || "All"}</span>
                            <span>•</span>
                            <span>30 mins limit</span>
                         </div>
                      </div>
                      <Link href={`/editor/${prob.id}`} className="absolute right-6 p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors z-20">
                        <Icon name="edit" clazz="text-sm text-white relative z-10" />
                      </Link>
                   </GlowCard>
                 ))
               )}
             </div>
         </section>

         {/* Hackathon Demo: Live Submissions Section */}
         <section className="md:col-span-2 mt-8">
             <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-2">
                 <Icon name="code_blocks" clazz="text-tertiary drop-shadow-[0_0_10px_rgba(20,184,166,0.6)]"/> Live Student Submissions
             </h2>
             <div className="space-y-4">
               {submissions.length === 0 ? (
                 <div className="text-zinc-500 glass-card p-6 rounded-2xl border border-white/5 text-center py-12">
                     <Icon name="hourglass_empty" clazz="text-4xl text-zinc-600 mb-2" />
                     <p>No code submissions received yet.</p>
                     <p className="text-xs">Waiting for a student to hit &quot;Submit&quot; in their Editor...</p>
                 </div>
               ) : (
                 submissions.map((sub, idx) => (
                   <GlowCard key={idx} glowColor="green" className="w-full bg-black/40 border border-tertiary/20 flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-tertiary to-primary"></div>
                      
                      <div className="flex justify-between items-center border-b border-white/5 pb-4 pl-2">
                         <div>
                            <h3 className="font-bold text-tertiary text-xl flex items-center gap-2">
                               <Icon name="person" clazz="text-sm" /> Student: {sub.username}
                            </h3>
                            <div className="flex gap-2 text-xs text-zinc-400 mt-2 uppercase font-bold tracking-widest">
                               <span className="text-primary">{sub.problemTitle}</span>
                               <span>•</span>
                               <span>Language: {sub.language}</span>
                               <span>•</span>
                               <span>Submitted at {sub.time}</span>
                            </div>
                         </div>
                         <div className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full text-xs font-bold border border-tertiary/20 flex items-center gap-2 shadow-[0_0_10px_rgba(20,184,166,0.2)]">
                           <Icon name="check_circle" clazz="text-sm" /> Validated
                         </div>
                      </div>
                      <div className="pl-2 relative z-10">
                         <div className="flex items-center gap-2 mb-2 text-xs uppercase font-bold tracking-widest text-zinc-500">
                             <Icon name="code" clazz="text-sm" /> Source Code
                         </div>
                         <pre className="p-4 bg-surface-container-lowest/80 rounded-lg overflow-x-auto text-sm font-mono text-zinc-300 border border-white/5 whitespace-pre-wrap">{sub.code}</pre>
                      </div>
                   </GlowCard>
                 ))
               )}
             </div>
         </section>
      </main>
    </div>
  );
}
