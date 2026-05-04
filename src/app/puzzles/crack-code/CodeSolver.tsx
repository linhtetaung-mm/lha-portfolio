"use client";

import React, { useState } from 'react';
import { Cpu, RotateCcw, Home, Terminal, ShieldCheck, ChevronRight } from 'lucide-react';

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
  const [isSolved, setIsSolved] = useState(false);
  const [isComputing, setIsComputing] = useState(false);

  // --- Your Logic: Prior Knowledge Constraint ---
  const checkHeuristic = (candidate: number[], history: Step[]): boolean => {
    for (const step of history) {
      let greens = 0;
      let nulls = 0;
      
      // Calculate what the feedback would be if 'candidate' was the secret code
      candidate.forEach((num, i) => { if (num === step.guess[i]) greens++; });

      const candidateCounts: Record<number, number> = {};
      const guessCounts: Record<number, number> = {};
      candidate.forEach(n => candidateCounts[n] = (candidateCounts[n] || 0) + 1);
      step.guess.forEach(n => guessCounts[n] = (guessCounts[n] || 0) + 1);

      Object.keys(candidateCounts).forEach(key => {
        const num = parseInt(key);
        const countInGuess = guessCounts[num] || 0;
        if (candidateCounts[num] > countInGuess) nulls += (candidateCounts[num] - countInGuess);
      });

      const reds = level - greens - nulls;

      // If it doesn't match the historical feedback, this candidate is invalid
      if (greens !== step.feedback.greens || reds !== step.feedback.reds) return false;
    }
    return true;
  };

  const startSolver = () => {
    const firstGuess = Array(level).fill(0).map((_, i) => i % 10);
    setCurrentGuess(firstGuess);
    setSteps([]);
    setIsSolved(false);
    setIsInitialized(true);
  };

  const processFeedback = () => {
    if (feedback.greens === level) {
      setIsSolved(true);
      return;
    }

    setIsComputing(true);
    
    // Simulate your Python itertools.permutations/logic in a non-blocking way[cite: 7]
    const newSteps = [{ guess: currentGuess, feedback }, ...steps];
    
    // Simple heuristic search: Find the next code that fits all history[cite: 7]
    // For a portfolio, we pick a random-walk search to find a valid candidate quickly
    let found = false;
    let attempts = 0;
    const maxAttempts = 50000; // Prevent infinite loops

    while (!found && attempts < maxAttempts) {
      const candidate = Array.from({ length: level }, () => Math.floor(Math.random() * 10));
      if (checkHeuristic(candidate, newSteps)) {
        setCurrentGuess(candidate);
        found = true;
      }
      attempts++;
    }

    if (!found) {
      alert("Inconsistent data. No valid sequence found in 50,000 iterations.");
    } else {
      setSteps(newSteps);
      setFeedback({ greens: 0, reds: 0, nulls: 0 });
    }
    setIsComputing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <button onClick={() => setIsInitialized(false)} className="text-slate-500 hover:text-white transition-colors">
            <Home size={20} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-[0.3em] uppercase text-blue-500 font-bold">Solver Logic</span>
            <span className="text-xs text-slate-600">Max Complexity: {level} Digits</span>
          </div>
          <button onClick={startSolver} className="text-slate-500 hover:text-white transition-colors">
            <RotateCcw size={20} />
          </button>
        </div>

        {!isInitialized ? (
          <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-3xl text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-white uppercase tracking-widest text-sm">Sequence Length</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button 
                    key={n}
                    onClick={() => setLevel(n)}
                    className={`w-10 h-10 rounded-lg border transition-all text-xs font-bold ${level === n ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-slate-800 text-slate-600'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={startSolver}
              className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-blue-400 transition-all shadow-lg"
            >
              Initialize Heuristics
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* The Computer's Guess Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex flex-wrap justify-center gap-2">
                {currentGuess.map((d, i) => (
                  <div key={i} className="w-10 h-14 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center text-2xl font-black text-white shadow-inner">
                    {d}
                  </div>
                ))}
              </div>

              {!isSolved ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {(['greens', 'reds', 'nulls'] as const).map(key => (
                      <div key={key} className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-center block text-slate-500">{key}</label>
                        <input 
                          type="number"
                          value={feedback[key]}
                          onChange={(e) => setFeedback({...feedback, [key]: parseInt(e.target.value) || 0})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 text-center text-lg font-bold text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={processFeedback}
                    disabled={isComputing}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isComputing ? 'Computing Path...' : 'Process Feedback'} <ChevronRight size={14} />
                  </button>
                </>
              ) : (
                <div className="py-6 border-t border-emerald-500/20 text-center animate-in fade-in zoom-in-95">
                  <ShieldCheck size={40} className="text-emerald-500 mx-auto mb-3" />
                  <h2 className="text-emerald-400 font-black uppercase tracking-widest">Sequence Solved</h2>
                  <p className="text-[10px] text-slate-500 mt-1">TOTAL CYCLES: {steps.length + 1}</p>
                </div>
              )}
            </div>

            {/* Inference Logs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-600 px-2">
                <Terminal size={14} />
                <span className="text-[10px] uppercase tracking-[0.2em]">Heuristic Logs</span>
                <div className="flex-1 border-b border-slate-800 border-dotted" />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900/30 border border-slate-800/40 p-3 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-700">#{steps.length - i}</span>
                    <span className="text-xs font-bold text-slate-500 tracking-widest">{step.guess.join('')}</span>
                    <div className="flex gap-1">
                      {Array(step.feedback.greens).fill(0).map((_, j) => <div key={j} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />)}
                      {Array(step.feedback.reds).fill(0).map((_, j) => <div key={j} className="w-1.5 h-1.5 rounded-full bg-rose-500" />)}
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