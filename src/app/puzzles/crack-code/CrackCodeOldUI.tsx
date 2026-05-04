"use client";

import React, { useState, useEffect } from 'react';
import { Home, RotateCcw, Lock, Unlock } from 'lucide-react';

// --- Types & Interfaces ---
interface GuessResult {
  greens: number;
  reds: number;
  nulls: number;
}

interface GuessEntry {
  digits: number[];
  result: GuessResult;
}

type ViewState = 'home' | 'ingame';

const CrackCode: React.FC = () => {
  // --- State with TypeScript Generics ---
  const [view, setView] = useState<ViewState>('home');
  const [level, setLevel] = useState<number>(3);
  const [secretCode, setSecretCode] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [currentInput, setCurrentInput] = useState<number[]>([]);
//   const [bestRecord, setBestRecord] = useState<string | number>(
//     localStorage.getItem(`bestrecord${level}`) || "???"//[cite: 4, 5]
//   );

  // --- Game Logic ---
  const startNewGame = (selectedLevel: number): void => {
    const newCode = Array.from({ length: selectedLevel }, () => Math.floor(Math.random() * 10));
    setSecretCode(newCode);
    setCurrentInput(Array(selectedLevel).fill(0));
    setGuesses([]);
    setView('ingame');
    // const savedBest = localStorage.getItem(`bestrecord${selectedLevel}`);//[cite: 5]
    // setBestRecord(savedBest || "???");
  };

  const checkGuess = (): void => {
    let greens = 0;
    let nulls = 0;

    // 1. Calculate Greens (Correct number and place)[cite: 1, 5]
    currentInput.forEach((digit, i) => {
      if (digit === secretCode[i]) greens++;
    });

    // 2. Logic for Invalid/Nulls (refactored from code.js algorithm)[cite: 5]
    const codeCounts: Record<number, number> = {};
    const guessCounts: Record<number, number> = {};
    secretCode.forEach(n => codeCounts[n] = (codeCounts[n] || 0) + 1);
    currentInput.forEach(n => guessCounts[n] = (guessCounts[n] || 0) + 1);

    Object.keys(codeCounts).forEach(key => {
      const num = parseInt(key);
      const countInGuess = guessCounts[num] || 0;
      if (codeCounts[num] > countInGuess) {
        nulls += (codeCounts[num] - countInGuess);
      }
    });

    // 3. Calculate Reds (Correct number, wrong place)[cite: 1, 5]
    const reds = level - greens - nulls;

    const newGuess: GuessEntry = {
      digits: [...currentInput],
      result: { greens, reds, nulls }
    };

    setGuesses([newGuess, ...guesses]);

    if (greens === level) {
      handleWin(guesses.length + 1);
    }
  };

  const handleWin = (steps: number): void => {
    const currentBest = localStorage.getItem(`bestrecord${level}`);//[cite: 3, 5]
    if (!currentBest || steps < parseInt(currentBest)) {
    //   localStorage.setItem(`bestrecord${level}`, steps.toString());//[cite: 5]
    //   localStorage.setItem(`datetime${level}`, new Date().toLocaleString());//[cite: 5]
    //   setBestRecord(steps);
    }
    alert(`Success! Code cracked in ${steps} steps.`);
  };

  // --- Sub-Components ---
  const HomeScreen = () => (
    <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 text-slate-300 max-w-md text-center shadow-xl">
        <p className="text-sm leading-relaxed mb-4">
          This game is inspired by <span className="text-yellow-500 font-bold">"Brain Training Logic Puzzle"</span> by CL-Games.
        </p>
        <div className="grid grid-cols-1 gap-2 text-xs uppercase tracking-widest font-bold">
          <div className="flex items-center justify-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /> Right Position[cite: 1]</div>
          <div className="flex items-center justify-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /> Wrong Position[cite: 1]</div>
          <div className="flex items-center justify-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full" /> Invalid Digit[cite: 1]</div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <label className="text-slate-400 uppercase text-xs tracking-widest">Select Digits (3-20)[cite: 1]</label>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={level}
            min={2} max={20}
            onChange={(e) => setLevel(Math.min(20, Math.max(2, parseInt(e.target.value) || 2)))}
            className="w-24 bg-slate-900 border-2 border-yellow-500/50 rounded-xl text-center text-3xl font-black text-yellow-500 py-2 focus:ring-2 ring-yellow-500/20 outline-none"
          />
          <button 
            onClick={() => startNewGame(level)}
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-8 py-2 rounded-xl font-black uppercase tracking-tighter transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
          >
            Play[cite: 1]
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#164C7E] bg-gradient-to-b from-[#164C7E] to-[#20124d] text-white flex flex-col items-center p-6 font-sans select-none">
      <header className="text-center py-10">
        <h1 className="text-5xl font-black italic tracking-tighter text-[#ffd966] drop-shadow-md">
          GUESS THE PASSCODE[cite: 1]
        </h1>
      </header>

      {view === 'home' ? (
        <HomeScreen />
      ) : (
        <div className="w-full max-w-2xl space-y-6 animate-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
            <button onClick={() => setView('home')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Home size={24}/></button>
            {/* <div className="text-xs font-bold uppercase tracking-widest text-green-400">
              Best: {bestRecord} Steps[cite: 4, 5]
            </div> */}
            <button onClick={() => startNewGame(level)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><RotateCcw size={24}/></button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 p-8 bg-black/30 rounded-3xl border border-white/10 shadow-2xl">
            {currentInput.map((digit, i) => (
              <input
                key={i}
                type="number"
                value={digit}
                onChange={(e) => {
                  const val = parseInt(e.target.value.slice(-1)) || 0;
                  const newIn = [...currentInput];
                  newIn[i] = val;
                  setCurrentInput(newIn);
                }}
                className="w-12 h-16 bg-slate-900 border-b-4 border-blue-500 rounded-lg text-center text-3xl font-black text-white focus:bg-slate-800 outline-none transition-all"
              />
            ))}
          </div>

          <button 
            onClick={checkGuess}
            className="w-full py-5 bg-green-600 hover:bg-green-500 rounded-2xl font-black uppercase text-xl tracking-widest shadow-xl shadow-green-900/40 transition-all active:scale-[0.98]"
          >
            Check Passcode[cite: 4]
          </button>

          <div className="h-64 overflow-y-auto bg-black/40 rounded-2xl border-4 border-slate-900/50 p-4 space-y-3 custom-scrollbar">[cite: 6]
            {guesses.map((g, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-white/5">
                <div className="flex gap-2">
                  {g.digits.map((d, i) => (
                    <span key={i} className="text-lg font-bold text-slate-400">{d}</span>
                  ))}
                </div>
                <div className="flex gap-1">
                  {Array(g.result.greens).fill(0).map((_, i) => <div key={i} className="w-3 h-3 bg-green-500 rounded-full shadow-sm shadow-green-500/50" />)}
                  {Array(g.result.reds).fill(0).map((_, i) => <div key={i} className="w-3 h-3 bg-red-500 rounded-full shadow-sm shadow-red-500/50" />)}
                  {Array(g.result.nulls).fill(0).map((_, i) => <div key={i} className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm shadow-yellow-500/50" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-auto pt-10 text-[10px] uppercase tracking-[0.2em] opacity-40">
        Lin Htet Aung | Refactored May 2026[cite: 1]
      </footer>
    </div>
  );
};

export default CrackCode;