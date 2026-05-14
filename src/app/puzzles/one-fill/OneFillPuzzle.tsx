"use client";

import React, { useState, useMemo } from 'react';
import OneFillGame from './OneFillGame';
import levelsData from './one_fill_levels.json'; 

const OneFillPuzzle = () => {
  // 1. Set initial states based on what actually exists in your JSON
  const categories = Object.keys(levelsData); // ["Small", "Medium"]
  const [category, setCategory] = useState(categories[0]);

  // Get available sizes for the current category
  const availableSizes = Object.keys((levelsData as any)[category]);
  const [size, setSize] = useState(availableSizes[0]);
  
  const [levelIdx, setLevelIdx] = useState(0);

  // 2. Memoize currentLevels to prevent crashes if data is missing
  const currentLevels = useMemo(() => {
    return (levelsData as any)[category][size] || [];
  }, [category, size]);

  const currentLevel = currentLevels[levelIdx];

  // 3. Handle Category Change properly
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const newSizes = Object.keys((levelsData as any)[newCat]);
    setSize(newSizes[0]); // Reset size to the first one available in new category
    setLevelIdx(0);      // Reset level to the first one
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
        ONE FILL
      </h1>

      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {/* Category Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 uppercase font-bold">Category</label>
          <select 
            className="bg-slate-800 p-2 rounded border border-slate-600 focus:border-cyan-500 outline-none"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Dynamic Size Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 uppercase font-bold">Grid Size</label>
          <select 
            className="bg-slate-800 p-2 rounded border border-slate-600 focus:border-cyan-500 outline-none"
            value={size}
            onChange={(e) => { setSize(e.target.value); setLevelIdx(0); }}
          >
            {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Level Info */}
        <div className="flex flex-col justify-end pb-2">
          <div className="text-cyan-500 font-bold">
            Level {levelIdx + 1} of {currentLevels.length}
          </div>
        </div>
      </div>

      {currentLevel ? (
        <OneFillGame 
          level={currentLevel} 
          onLevelComplete={() => {
            if (levelIdx < currentLevels.length - 1) setLevelIdx(levelIdx + 1);
          }} 
        />
      ) : (
        <div className="text-red-500">No levels found for this configuration.</div>
      )}
    </div>
  );
};

export default OneFillPuzzle