"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import WavesBackground from "@/components/WavesBackground";

const Icon = ({ name, clazz = "" }: { name: string; clazz?: string }) => (
  <span className={`material-symbols-outlined ${clazz}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
    {name}
  </span>
);

const MOCK_PROBLEMS = [
  { id: "two-sum", title: "Two Sum", difficulty: "Easy", time_limit_mins: 15, description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order." },
  { id: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Medium", time_limit_mins: 45, description: "Reverse a singly linked list. A very popular question that tests your understanding of pointer manipulation." },
  { id: "longest-palindromic", title: "Longest Palindromic Substring", difficulty: "Medium", time_limit_mins: 30, description: "Given a string s, return the longest palindromic substring in s. A classic dynamic programming challenge." },
  { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", time_limit_mins: 10, description: "Determine if the input string is valid by checking if brackets are closed in the correct order using a stack." },
  { id: "sudoku-solver", title: "Sudoku Solver", difficulty: "Hard", time_limit_mins: 120, description: "Write a program to solve a Sudoku puzzle by filling the empty cells. Requires recursive backtracking techniques." },
];

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const problemId = resolvedParams.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [problem, setProblem] = useState<any>(null);
  const [language, setLanguage] = useState("cpp");
  
  const defaultCppCode = `#include<iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello world";\n    return 0;\n}`;
  const [code, setCode] = useState(defaultCppCode);
  
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"test" | "console">("console");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const fetchProblemData = async () => {
      const { data, error } = await supabase.from('problems').select('*').eq('id', problemId).single();
      if (data && !error) {
        setProblem(data);
      } else {
        const mock = MOCK_PROBLEMS.find(p => p.id === problemId);
        setProblem(mock || { title: "Custom Problem", difficulty: "Medium", description: `Editing problem ${problemId}` });
      }
    };
    fetchProblemData();
  }, [problemId]);

  const triggerMockVoice = () => {
    setIsListening(true);
    setTimeout(() => {
      setCode((prev) => prev + "\n\n// 🎙️ Voice Dictated: Please help me implement the core logic for this algorithm.\n");
      setIsListening(false);
    }, 2500); 
  };

  const startVoiceDictation = () => {
    try {
      // @ts-expect-error speech api browser mismatch
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => setIsListening(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setCode((prev) => prev + "\n// 🎙️ Voice Dictated: " + transcript + "\n");
        };
        recognition.onerror = () => triggerMockVoice();
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return;
      }
    } catch (e) {
      console.warn("Speech API failed, using Mock Recorder", e);
    }
    triggerMockVoice();
  };

  const handleGetHint = async () => {
    if (!problem) return;
    setIsHintLoading(true);
    setHint(null);
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          problemStatement: problem.description,
          studentCode: code
        })
      });
      const data = await res.json();
      if (data.hint) {
        setHint(data.hint);
      }
    } catch (err) {
      console.error(err);
      setHint("Failed to get hint. Please try again.");
    }
    setIsHintLoading(false);
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setActiveTab("console");
    setConsoleOutput("Requesting Wandbox Cloud Compiler execution...\n");

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: language,
        })
      });
      const data = await res.json();
      
      if (data.error) {
         setConsoleOutput(`Execution Engine Error:\n${data.error}`);
         return;
      }
      
      let out = "";
      if (data.compile_output) { out += `Compile Output:\n${data.compile_output}\n\n`; }
      if (data.stderr) { out += `Standard Error:\n${data.stderr}\n\n`; }
      if (data.stdout) { out += `Standard Output:\n${data.stdout}\n`; }

      setConsoleOutput(out || "Code ran completely, but generated no output.\n(Did you forget to add a print() statement?)");

    } catch (err) {
      console.error(err);
      setConsoleOutput("Failed to connect to execution engine.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="relative bg-transparent text-on-surface font-body selection:bg-primary/30 antialiased overflow-hidden h-screen flex flex-col">
      <WavesBackground opacity={0.15} />

      {/* Top Navigation Bar */}
      <header className="flex-none bg-[#0e0e0e]/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 w-full shadow-[0_4px_24px_rgba(59,130,246,0.08)] border-b border-white/5 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Icon name="terminal" clazz="text-primary text-2xl" />
            <h1 className="font-headline tracking-tight font-bold text-xl text-primary">{problem ? problem.title : "Loading..."}</h1>
          </Link>
          <div className="h-6 w-[1px] bg-outline-variant/30 ml-2"></div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8">
            <Link href="#" className="text-primary border-b-2 border-primary font-medium py-1 text-sm tracking-wide">Editor</Link>
            <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors duration-200 font-medium py-1 text-sm tracking-wide">Problems</Link>
            <Link href="/leaderboard" className="text-zinc-500 hover:text-white transition-colors duration-200 font-medium py-1 text-sm tracking-wide">Leaderboard</Link>
          </nav>
          <div className="h-8 w-8 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary/30 text-primary">
            SJ
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-px bg-outline-variant/10 overflow-hidden relative z-10">
        
        {/* Left Panel: Problem Details */}
        <section className="md:col-span-4 lg:col-span-3 bg-black/40 backdrop-blur-md flex flex-col overflow-y-auto border-r border-white/5">
          <div className="p-6 space-y-6 flex-grow">
            {problem ? (
               <>
                 <div className="flex items-start justify-between">
                   <div>
                     <h2 className="font-headline text-2xl font-bold tracking-tight">{problem.title}</h2>
                     <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        problem.difficulty === 'Easy' ? 'bg-secondary-container text-secondary' :
                        problem.difficulty === 'Medium' ? 'bg-tertiary-container text-on-tertiary-container' :
                        'bg-error-container text-on-error-container'
                      }`}>
                       {problem.difficulty}
                     </div>
                   </div>
                 </div>
                 
                 <div className="prose prose-invert prose-sm max-w-none text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                   {problem.description}
                 </div>
               </>
            ) : (
               <div className="animate-pulse flex flex-col gap-4">
                  <div className="h-8 bg-white/5 rounded w-3/4"></div>
                  <div className="h-32 bg-white/5 rounded w-full"></div>
               </div>
            )}

            <div className="pt-4 space-y-4">
              <button 
                onClick={handleGetHint}
                disabled={isHintLoading || !problem}
                className="w-full py-3 px-4 rounded-xl bg-surface-container-highest border border-primary/20 flex items-center justify-center gap-2 group hover:border-primary/50 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)] disabled:opacity-50"
              >
                {isHintLoading ? (
                   <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                     <Icon name="progress_activity" clazz="text-primary" />
                   </motion.span>
                ) : (
                  <>
                    <Icon name="lightbulb" clazz="text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm tracking-wide text-primary uppercase">Get Hint</span>
                  </>
                )}
              </button>

              {hint && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-sm text-primary-dim"
                >
                  <p className="font-bold mb-1 flex items-center gap-2"><Icon name="robot_2" clazz="text-lg" /> Groq AI Hint</p>
                  <p>{hint}</p>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Code Editor & Terminal */}
        <section className="md:col-span-8 lg:col-span-9 flex flex-col h-full overflow-hidden">
          {/* Editor View */}
          <div className="flex-grow flex flex-col bg-surface-container-lowest relative">
            <div className="h-12 flex items-center justify-between px-4 bg-surface-container border-b border-white/5 flex-none">
              <div className="flex items-center gap-2">
                 <div className="h-full px-4 border-b-2 border-primary flex items-center gap-2 bg-surface-container-highest">
                   <Icon name="code" clazz="text-blue-400 text-sm" />
                   <span className="text-xs font-medium tracking-tight">solution.{language === "python" ? "py" : language === "cpp" ? "cpp" : "js"}</span>
                 </div>
                 
                 {/* Voice Dictation Feature Toggle */}
                 <button 
                    onClick={startVoiceDictation} 
                    className={`ml-4 px-3 py-1 text-xs rounded-full border border-white/10 font-bold flex items-center gap-2 transition-all ${isListening ? 'bg-error text-white shadow-[0_0_15px_rgba(255,113,108,0.5)]' : 'bg-surface-container hover:bg-white/10 text-zinc-400'}`}
                 >
                    <Icon name="mic" clazz="text-sm" /> 
                    {isListening ? "Listening..." : "Dictate"}
                 </button>
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-surface-container-highest border-none text-xs font-semibold rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-on-surface-variant outline-none"
                >
                  <option value="python">Python 3.11</option>
                  <option value="javascript">JavaScript (Node)</option>
                  <option value="cpp">C++ 20</option>
                  <option value="java">Java 17</option>
                </select>
              </div>
            </div>

            <div className="flex-grow relative">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'Inter', monospace",
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                }}
              />
              
              <div className="absolute bottom-4 right-6 flex gap-3 z-10">
                <button 
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className="px-5 py-2 rounded-lg bg-surface-container/80 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-all disabled:opacity-50 shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                >
                  {isExecuting ? "Executing..." : "Run Code"}
                </button>
                <button 
                  onClick={() => {
                     const username = localStorage.getItem("codearena_user") || "Anonymous Student";
                     const submissions = JSON.parse(localStorage.getItem("codearena_submissions") || "[]");
                     submissions.unshift({
                        username,
                        problemTitle: problem?.title || "Unknown Problem",
                        language,
                        code,
                        time: new Date().toLocaleTimeString()
                     });
                     localStorage.setItem("codearena_submissions", JSON.stringify(submissions));
                     alert(`Code successfully submitted to Admin! (User: ${username})`);
                  }}
                  className="px-8 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(133,173,255,0.4)] hover:scale-105 active:scale-95 transition-all"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Panel: Terminal */}
          <div className="h-64 flex-none bg-black/50 backdrop-blur-md border-t border-white/5 flex flex-col">
            <div className="h-10 flex items-center px-6 gap-6 bg-black/40 border-b border-white/5">
              <button 
                onClick={() => setActiveTab("test")}
                className={`text-[10px] font-black uppercase tracking-widest h-full transition-colors ${activeTab === "test" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-white"}`}
              >
                Test Cases
              </button>
              <button 
                onClick={() => setActiveTab("console")}
                className={`text-[10px] font-black uppercase tracking-widest h-full transition-colors ${activeTab === "console" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-white"}`}
              >
                Console
              </button>
            </div>
            
            <div className={`flex-grow p-6 overflow-y-auto font-mono text-sm ${activeTab === "console" ? "block" : "hidden"}`}>
               {isExecuting ? (
                 <div className="flex items-center gap-3 text-primary">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                       <Icon name="progress_activity" />
                    </motion.span>
                    <span>Compiling natively in Wandbox Cloud...</span>
                 </div>
               ) : consoleOutput ? (
                 <pre className="whitespace-pre-wrap text-zinc-300">{consoleOutput}</pre>
               ) : (
                 <div className="text-zinc-500 flex flex-col items-center justify-center h-full">
                    <span>Run the code to see terminal execution results.</span>
                 </div>
               )}
            </div>

            <div className={`flex-grow grid grid-cols-1 md:grid-cols-2 p-6 gap-8 overflow-y-auto ${activeTab === "test" ? "block" : "hidden"}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary-container/10 border border-secondary/20">
                  <div className="flex items-center gap-3">
                    <Icon name="check_circle" clazz="text-secondary" />
                    <span className="text-sm font-semibold">Test Case 1</span>
                  </div>
                  <span className="text-xs font-mono text-secondary">0.02s</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
