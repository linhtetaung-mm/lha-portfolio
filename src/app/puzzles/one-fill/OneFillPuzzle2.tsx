"use client";

import React, { useState, useMemo } from 'react';
import OneFillGame from './OneFillGame2';
import levelsData from './one_fill_levels.json'; // Your Python-generated JSON
import { OneFillLevel } from './types';

const OneFillPuzzle2: React.FC = () => {
  // 1. Extract Categories from JSON (e.g., ["Small", "Medium"])
  const categories = Object.keys(levelsData);
  const [category, setCategory] = useState(categories[0]);

  // 2. Extract Sizes for the current category (e.g., ["4x4", "5x5"])
  const availableSizes = Object.keys((levelsData as any)[category]);
  const [size, setSize] = useState(availableSizes[0]);
  
  const [levelIdx, setLevelIdx] = useState(0);

  // 3. Get the array of levels for the current selection
  const currentLevels = useMemo(() => {
    return (levelsData as any)[category][size] || [];
  }, [category, size]);

  const currentLevel: OneFillLevel = currentLevels[levelIdx];

  // 4. CRITICAL: Handle Category Change properly
  // This prevents the app from crashing by resetting size and index immediately
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const newSizes = Object.keys((levelsData as any)[newCat]);
    setSize(newSizes[0]); // Default to first size of the new category
    setLevelIdx(0);      // Reset to level 1
  };

  const handleLevelComplete = () => {
    if (levelIdx < currentLevels.length - 1) {
      setLevelIdx(prev => prev + 1);
    } else {
      alert("You've cleared all levels in this set!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-12 px-4 font-sans">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          ONE FILL
        </h1>
        <p className="text-slate-500 mt-2 text-xs uppercase tracking-[0.3em]">
          Connect every cell • Solve the path
        </p>
      </div>

      {/* Control Panel */}
      <div className="flex flex-wrap gap-6 mb-12 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
        {/* Category Select */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Difficulty</label>
          <select 
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all cursor-pointer"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Size Select */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Grid Size</label>
          <select 
            value={size}
            onChange={(e) => { setSize(e.target.value); setLevelIdx(0); }}
            className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all cursor-pointer"
          >
            {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Level Stats */}
        <div className="flex flex-col justify-end pb-1 px-4">
          <div className="text-cyan-400 font-mono text-lg font-bold">
            LEVEL {levelIdx + 1}<span className="text-slate-600 mx-1">/</span>{currentLevels.length}
          </div>
        </div>
      </div>

      {/* The Game Component */}
      {currentLevel ? (
        <div className="relative group">
          {/* Subtle background glow behind the game */}
          <div className="absolute -inset-4 bg-cyan-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <OneFillGame 
            level={currentLevel} 
            onWin={handleLevelComplete} 
          />
        </div>
      ) : (
        <div className="text-slate-500 italic">No levels found for this size...</div>
      )}

      {/* Footer / Instructions */}
      <div className="mt-16 text-slate-600 text-[11px] uppercase tracking-widest max-w-xs text-center leading-loose">
        Drag from <span className="text-cyan-400 font-bold">S</span> to fill the board. 
        <br />
        Every cell must be filled to finish.
      </div>
    </div>
  );
};

export default OneFillPuzzle2;