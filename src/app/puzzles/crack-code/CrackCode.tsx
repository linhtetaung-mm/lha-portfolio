"use client";

import React, { useState } from 'react';
import { RotateCcw, Home, Hash, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';

interface GuessResult {
  greens: number;
  reds: number;
  nulls: number;
}

interface GuessEntry {
  digits: number[];
  result: GuessResult;
}

const CrackCode: React.FC = () => {
  const [view, setView] = useState<'home' | 'ingame'>('home');
  const [level, setLevel] = useState<number>(4);
  const [secretCode, setSecretCode] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [currentInput, setCurrentInput] = useState<number[]>([]);
  const [isWon, setIsWon] = useState<boolean>(false);

  const startNewGame = (selectedLevel: number): void => {
    const newCode = Array.from({ length: selectedLevel }, () => Math.floor(Math.random() * 10));//[cite: 5]
    setSecretCode(newCode);
    setCurrentInput(Array(selectedLevel).fill(0));
    setGuesses([]);
    setIsWon(false);
    setView('ingame');
  };

  const checkGuess = (): void => {
    if (isWon) return;

    let greens = 0;
    let nulls = 0;

    currentInput.forEach((digit, i) => {
      if (digit === secretCode[i]) greens++;//[cite: 5]
    });

    const codeCounts: Record<number, number> = {};
    const guessCounts: Record<number, number> = {};
    secretCode.forEach(n => codeCounts[n] = (codeCounts[n] || 0) + 1);//[cite: 5]
    currentInput.forEach(n => guessCounts[n] = (guessCounts[n] || 0) + 1);//[cite: 5]

    Object.keys(codeCounts).forEach(key => {
      const num = parseInt(key);
      const countInGuess = guessCounts[num] || 0;
      if (codeCounts[num] > countInGuess) {
        nulls += (codeCounts[num] - countInGuess);//[cite: 5]
      }
    });

    const reds = level - greens - nulls;//[cite: 5]
    const newEntry: GuessEntry = {
      digits: [...currentInput],
      result: { greens, reds, nulls }
    };

    setGuesses([newEntry, ...guesses]);

    if (greens === level) {
      setIsWon(true);
    }
  };

  if (view === 'home') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200 p-6">
        <div className="max-w-md w-full space-y-12 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-[0.2em] uppercase text-white">Passcode</h1>
            <p className="text-slate-500 text-sm tracking-widest uppercase">Logic Sequencing Protocol</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter text-center block">Complexity</label>
              <div className="flex items-center justify-center gap-4 pt-2">
                <button onClick={() => setLevel(Math.max(3, level - 1))} className="p-2 hover:text-white transition-colors"><Hash size={18}/></button>
                <span className="text-4xl font-mono font-bold text-blue-500">{level}</span>
                <button onClick={() => setLevel(Math.min(10, level + 1))} className="p-2 hover:text-white transition-colors"><Hash size={18}/></button>
              </div>
            </div>

            <button 
              onClick={() => startNewGame(level)}
              className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-slate-200 transition-all rounded-lg"
            >
              Initialize Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-950 text-slate-200 p-4 md:p-12 font-mono">
      <div className="w-full max-w-xl space-y-8">
        {/* Header Navigation */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <button onClick={() => setView('home')} className="text-slate-500 hover:text-white transition-colors">
            <Home size={20} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-[0.3em] uppercase text-slate-500">Attempt Count</span>
            <span className="text-xl font-bold text-blue-400 leading-none">{guesses.length}</span>
          </div>
          <button onClick={() => startNewGame(level)} className="text-slate-500 hover:text-white transition-colors">
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Input & Success Area */}
        <div className="flex flex-col items-center space-y-6 py-4">
          {!isWon ? (
            <>
              <div className="flex gap-2">
                {currentInput.map((val, i) => (
                  <input
                    key={i}
                    type="number"
                    value={val}
                    onChange={(e) => {
                      const newIn = [...currentInput];
                      newIn[i] = parseInt(e.target.value.slice(-1)) || 0;
                      setCurrentInput(newIn);
                    }}
                    className="w-12 h-16 bg-slate-900 border border-slate-700 rounded-lg text-center text-2xl font-bold text-white focus:border-blue-500 outline-none transition-all"
                  />
                ))}
              </div>
              <button 
                onClick={checkGuess}
                className="group flex items-center gap-2 px-8 py-3 border border-slate-700 hover:border-blue-500 hover:text-blue-400 transition-all rounded-full text-xs uppercase tracking-widest font-bold"
              >
                <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" />
                Check Sequence
              </button>
            </>
          ) : (
            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl flex flex-col items-center space-y-3 animate-in zoom-in-95">
              <ShieldCheck size={48} className="text-emerald-500" />
              <div className="text-center">
                <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-widest">Access Granted</h2>
                <p className="text-xs text-emerald-600 mt-1 uppercase tracking-tighter">Sequence Decrypted in {guesses.length} Cycles</p>
              </div>
              <button 
                onClick={() => startNewGame(level)}
                className="mt-2 text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-500/30 px-4 py-1 rounded hover:bg-emerald-500/20 transition-all"
              >
                Reset Terminal
              </button>
            </div>
          )}
        </div>

        {/* History Board */}
        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {guesses.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl">
              <div className="flex gap-3">
                <Terminal size={14} className="text-slate-700" />
                {entry.digits.map((d, i) => (
                  <span key={i} className={`text-lg font-bold ${isWon && idx === 0 ? 'text-emerald-400' : 'text-slate-400'}`}>{d}</span>
                ))}
              </div>
              <div className="flex gap-1.5">
                {Array(entry.result.greens).fill(0).map((_, i) => (
                  <div key={`g-${i}`} className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                ))}
                {Array(entry.result.reds).fill(0).map((_, i) => (
                  <div key={`r-${i}`} className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                ))}
                {Array(entry.result.nulls).fill(0).map((_, i) => (
                  <div key={`n-${i}`} className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                ))}
              </div>
            </div>
          ))}
          {guesses.length === 0 && (
            <div className="text-center py-10 text-slate-700 text-xs uppercase tracking-widest">
              Ready for Input
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrackCode;