"use client";

import React, { useState } from 'react';
import { Cpu, RotateCcw, Home, Terminal, ShieldCheck, Zap, Activity } from 'lucide-react';

interface Feedback {
  greens: number;
  reds: number;
  nulls: number;
}

interface Step {
  guess: number[];
  feedback: Feedback;
}

const AdvancedSolver: React.FC = () => {
  const [level, setLevel] = useState<number>(4);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentGuess, setCurrentGuess] = useState<number[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [feedback, setFeedback] = useState<Feedback>({ greens: 0, reds: 0, nulls: 0 });
  const [isSolved, setIsSolved] = useState(false);
  const [isComputing, setIsComputing] = useState(false);

  // --- CORE LOGIC: RECURSIVE BACKTRACKING ---

  const isPartialValid = (partial: number[], index: number, history: Step[]): boolean => {
    for (const step of history) {
      let greens = 0;
      // Pruning Rule: If we already have more Greens than the feedback allows, stop
      for (let i = 0; i <= index; i++) {
        if (partial[i] === step.guess[i]) greens++;
      }
      if (greens > step.feedback.greens) return false;
      
      // Lookahead Rule: If there aren't enough remaining slots to reach the required Greens, stop
      const remainingSlots = (level - 1) - index;
      if (greens + remainingSlots < step.feedback.greens) return false;
    }
    return true;
  };

  const solve = (history: Step[]): number[] | null => {
    const result: number[] = new Array(level).fill(0);

    const backtrack = (index: number): boolean => {
      if (index === level) {
        // Final verification of total Reds/Greens
        return verifyFullConstraints(result, history);
      }

      for (let d = 0; d <= 9; d++) {
        result[index] = d;
        if (isPartialValid(result, index, history)) {
          if (backtrack(index + 1)) return true;
        }
      }
      return false;
    };

    return backtrack(0) ? [...result] : null;
  };

  const verifyFullConstraints = (candidate: number[], history: Step[]): boolean => {
    for (const step of history) {
      let greens = 0;
      let nulls = 0;
      
      candidate.forEach((num, i) => { if (num === step.guess[i]) greens++; });

      const candCounts: Record<number, number> = {};
      const stepCounts: Record<number, number> = {};
      candidate.forEach(n => candCounts[n] = (candCounts[n] || 0) + 1);
      step.guess.forEach(n => stepCounts[n] = (stepCounts[n] || 0) + 1);

      Object.keys(candCounts).forEach(key => {
        const num = parseInt(key);
        const countInStep = stepCounts[num] || 0;
        if (candCounts[num] > countInStep) nulls += (candCounts[num] - countInStep);
      });

      const reds = level - greens - nulls;
      if (greens !== step.feedback.greens || reds !== step.feedback.reds) return false;
    }
    return true;
  };

  const handleProcess = () => {
    if (feedback.greens === level) {
      setIsSolved(true);
      return;
    }

    setIsComputing(true);
    // Timeout allows the UI to show "Computing" state before the heavy logic blocks
    setTimeout(() => {
      const newSteps = [{ guess: currentGuess, feedback }, ...steps];
      const nextCode = solve(newSteps);

      if (nextCode) {
        setCurrentGuess(nextCode);
        setSteps(newSteps);
        setFeedback({ greens: 0, reds: 0, nulls: 0 });
      } else {
        alert("Logic Conflict: No sequence exists that satisfies all provided feedback.");
      }
      setIsComputing(false);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Nav Header */}
        <div className="flex justify-between items-center bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
          <button onClick={() => setIsInitialized(false)} className="hover:text-white transition-colors"><Home size={18} /></button>
          <div className="flex items-center gap-3">
            <Activity size={14} className="text-blue-500 animate-pulse" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold">Backtracking Engine</span>
          </div>
          <button onClick={() => { setSteps([]); setIsSolved(false); }} className="hover:text-white transition-colors"><RotateCcw size={18} /></button>
        </div>

        {!isInitialized ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-8">
            <h2 className="text-white text-xs uppercase tracking-[0.4em]">Complexity Selection</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button 
                  key={n} 
                  onClick={() => setLevel(n)}
                  className={`w-12 h-12 rounded-xl border-2 font-black transition-all ${level === n ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-800 text-slate-600'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setCurrentGuess(Array(level).fill(0)); setIsInitialized(true); }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-xs tracking-widest rounded-xl transition-all"
            >
              Start Solver
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Display Card */}
            <div className="bg-slate-900 border-t-2 border-t-blue-500 p-8 rounded-2xl shadow-2xl space-y-8">
              <div className="flex flex-wrap justify-center gap-2">
                {currentGuess.map((num, i) => (
                  <div key={i} className="w-10 h-14 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center text-2xl font-black text-white shadow-inner">
                    {num}
                  </div>
                ))}
              </div>

              {!isSolved ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {(['greens', 'reds', 'nulls'] as const).map(key => (
                      <div key={key} className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-center block text-slate-500">{key}</label>
                        <input 
                          type="number"
                          value={feedback[key]}
                          onChange={(e) => setFeedback({...feedback, [key]: parseInt(e.target.value) || 0})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 text-center text-xl font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleProcess}
                    disabled={isComputing}
                    className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-blue-400 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isComputing ? <><Zap size={14} className="animate-bounce" /> Analyzing Tree...</> : 'Process Feedback'}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl text-center">
                  <ShieldCheck className="text-emerald-500 mx-auto mb-2" size={32} />
                  <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Target Neutralized</p>
                </div>
              )}
            </div>

            {/* Logs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Terminal size={14} className="text-slate-600" />
                <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Execution History</span>
                <div className="flex-1 border-b border-slate-800 border-dotted" />
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
                    <span className="text-xs font-bold text-slate-500 tracking-widest">{step.guess.join('')}</span>
                    <div className="flex gap-1.5">
                      {Array(step.feedback.greens).fill(0).map((_, j) => <div key={j} className="w-2 h-2 rounded-full bg-emerald-500" />)}
                      {Array(step.feedback.reds).fill(0).map((_, j) => <div key={j} className="w-2 h-2 rounded-full bg-rose-500" />)}
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

export default AdvancedSolver;