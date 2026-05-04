"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, RotateCcw, ChevronRight, Hash, CheckCircle2 } from 'lucide-react';

// --- Types ---
interface Feedback {
  greens: number;
  reds: number;
  nulls: number;
}

interface Step {
  guess: number[];
  feedback: Feedback;
}

const CodeSolver: React.FC = () => {
  const [level, setLevel] = useState<number>(4);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentGuess, setCurrentGuess] = useState<number[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [feedback, setFeedback] = useState<Feedback>({ greens: 0, reds: 0, nulls: 0 });
  const [possibleCodes, setPossibleCodes] = useState<number[][]>([]);
  const [isSolved, setIsSolved] = useState(false);

  // --- Logic Engine (Refactored from Python itertools.permutations) ---
  
  // 1. Helper to calculate feedback between any two codes[cite: 5, 7]
  const getFeedback = (code: number[], guess: number[]): Feedback => {
    let greens = 0;
    let nulls = 0;
    
    // Greens: Correct number and position
    guess.forEach((num, i) => { if (num === code[i]) greens++; });

    const codeCounts: Record<number, number> = {};
    const guessCounts: Record<number, number> = {};
    code.forEach(n => codeCounts[n] = (codeCounts[n] || 0) + 1);
    guess.forEach(n => guessCounts[n] = (guessCounts[n] || 0) + 1);

    Object.keys(codeCounts).forEach(key => {
      const num = parseInt(key);
      const countInGuess = guessCounts[num] || 0;
      if (codeCounts[num] > countInGuess) nulls += (codeCounts[num] - countInGuess);
    });

    return { greens, reds: code.length - greens - nulls, nulls };
  };

  // 2. Initialize possible pool (limited to 3-5 digits for web performance)
  const initializeSolver = () => {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let pool: number[][] = [[]];

    for (let i = 0; i < level; i++) {
      const nextPool: number[][] = [];
      for (const partial of pool) {
        for (const d of digits) {
          nextPool.push([...partial, d]);
        }
      }
      pool = nextPool;
    }

    setPossibleCodes(pool);
    const firstGuess = Array(level).fill(0).map((_, i) => i % 10); // Standard starting guess
    setCurrentGuess(firstGuess);
    setIsInitialized(true);
    setSteps([]);
    setIsSolved(false);
  };

  // 3. Filter candidates based on feedback
  const generateNextGuess = () => {
    const total = feedback.greens + feedback.reds + feedback.nulls;
    if (total !== level) {
      alert("Feedback totals must match the number of digits.");
      return;
    }

    if (feedback.greens === level) {
      setIsSolved(true);
      return;
    }

    // Filter: Keep only codes that would have given this exact feedback for this guess
    const remaining = possibleCodes.filter(code => {
      const result = getFeedback(code, currentGuess);
      return result.greens === feedback.greens && 
             result.reds === feedback.reds && 
             result.nulls === feedback.nulls;
    });

    if (remaining.length === 0) {
      alert("No possible codes match this feedback. Please check your inputs.");
      return;
    }

    setSteps([{ guess: currentGuess, feedback }, ...steps]);
    setPossibleCodes(remaining);
    setCurrentGuess(remaining[0]); // Simple heuristic: pick the first available candidate
    setFeedback({ greens: 0, reds: 0, nulls: 0 });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-blue-500" size={20} />
            <h1 className="uppercase tracking-[0.2em] text-white text-sm font-bold">Heuristic Solver Engine</h1>
          </div>
          <button onClick={() => setIsInitialized(false)} className="text-slate-600 hover:text-white transition-colors">
            <RotateCcw size={18} />
          </button>
        </div>

        {!isInitialized ? (
          <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-3xl text-center space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-500">Target Complexity</label>
              <div className="flex justify-center gap-4">
                {[3, 4, 5].map(n => (
                  <button 
                    key={n}
                    onClick={() => setLevel(n)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all font-bold ${level === n ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={initializeSolver}
              className="px-10 py-3 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-full hover:bg-slate-200 transition-all"
            >
              Boot Solver
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Current Computer Guess */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <div className="text-center space-y-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-blue-500 font-bold">Computer's Suggestion</span>
                <div className="flex justify-center gap-3">
                  {currentGuess.map((d, i) => (
                    <div key={i} className="w-14 h-20 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-4xl font-black text-white">
                      {d}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Inputs[cite: 7] */}
              {!isSolved ? (
                <div className="mt-10 grid grid-cols-3 gap-4">
                  {(['greens', 'reds', 'nulls'] as const).map(key => (
                    <div key={key} className="space-y-2">
                      <label className={`text-[10px] uppercase font-bold text-center block ${key === 'greens' ? 'text-emerald-500' : key === 'reds' ? 'text-rose-500' : 'text-slate-500'}`}>
                        {key}
                      </label>
                      <input 
                        type="number"
                        min={0} max={level}
                        value={feedback[key]}
                        onChange={(e) => setFeedback({...feedback, [key]: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 text-center text-xl font-bold focus:border-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
                  <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Target Decrypted
                  </p>
                </div>
              )}

              {!isSolved && (
                <button 
                  onClick={generateNextGuess}
                  className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Process Feedback <ChevronRight size={14} />
                </button>
              )}
            </div>

            {/* Analysis Logs[cite: 7] */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-600 px-2">
                <Terminal size={14} />
                <span className="text-[10px] uppercase tracking-widest">Inference Logs</span>
                <div className="flex-1 border-b border-slate-800 border-dotted" />
                <span className="text-[10px]">{possibleCodes.length} Candidates Left</span>
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900/30 border border-slate-800/40 p-3 rounded-lg text-xs">
                    <div className="flex gap-2 font-bold text-slate-500">
                      <span className="text-slate-700">#{steps.length - i}</span>
                      {step.guess.join('')}
                    </div>
                    <div className="flex gap-1">
                      {Array(step.feedback.greens).fill(0).map((_, j) => <div key={j} className="w-2 h-2 rounded-full bg-emerald-500" />)}
                      {Array(step.feedback.reds).fill(0).map((_, j) => <div key={j} className="w-2 h-2 rounded-full bg-rose-500" />)}
                      {Array(step.feedback.nulls).fill(0).map((_, j) => <div key={j} className="w-2 h-2 rounded-full bg-slate-700" />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CodeSolver;