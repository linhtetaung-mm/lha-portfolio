"use client";

import React, { useState, useCallback } from 'react';
import { PATH_COLORS } from './colorMap';

interface FlowEditorProps {
  size: number;
  onSolve: (grid: number[]) => void;
}

const FlowEditor: React.FC<FlowEditorProps> = ({ size, onSolve }) => {
  const [grid, setGrid] = useState<number[]>(new Array(size * size).fill(0));
  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [isEraserMode, setIsEraserMode] = useState(false);

  // --- EDITOR ACTIONS ---

  const handleCellClick = (index: number) => {
    const newGrid = [...grid];
    if (isEraserMode) {
      newGrid[index] = 0;
    } else {
      // Logic: A number can only appear TWICE on a board.
      const currentCount = newGrid.filter(val => val === selectedNumber).length;
      
      if (currentCount < 2 || newGrid[index] === selectedNumber) {
        newGrid[index] = selectedNumber;
      } else {
        alert(`Number ${selectedNumber} already has two endpoints. Erase one to move it.`);
        return;
      }
    }
    setGrid(newGrid);
  };

  const clearBoard = () => setGrid(new Array(size * size).fill(0));

  // --- SERIALIZATION (The Level Code) ---

  const generateLevelCode = () => {
    // Converts [0,1,0...] into "0-1-0..." string for sharing
    const code = btoa(grid.join(',')); // Simple Base64 encoding
    navigator.clipboard.writeText(code);
    alert("Level Code copied to clipboard!");
  };

  // --- VALIDATION FOR SOLVER ---

  const validateAndSolve = () => {
    // Check if every placed number has exactly a pair
    const uniqueNumbers = Array.from(new Set(grid.filter(n => n !== 0)));
    const isValid = uniqueNumbers.every(n => grid.filter(val => val === n).length === 2);

    if (uniqueNumbers.length === 0) {
      alert("Place some numbers first!");
      return;
    }

    if (!isValid) {
      alert("Each number must have exactly two endpoints (a start and an end).");
      return;
    }

    onSolve(grid);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start justify-center p-8 bg-slate-950 text-slate-200 min-h-screen font-mono">
      
      {/* Sidebar: Tools & Numbers */}
      <div className="w-full md:w-48 space-y-6 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
        <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Neural Toolkit</h2>
        
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: size - 1 }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => { setSelectedNumber(num); setIsEraserMode(false); }}
              className={`h-10 rounded border transition-all ${selectedNumber === num && !isEraserMode ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
              style={{ backgroundColor: PATH_COLORS[num] }}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => setIsEraserMode(true)}
            className={`w-full py-2 text-xs rounded border ${isEraserMode ? 'bg-red-900/20 border-red-500' : 'bg-slate-800 border-transparent text-slate-400'}`}
          >
            Eraser Tool
          </button>
          <button onClick={clearBoard} className="w-full py-2 text-xs bg-slate-800 rounded text-slate-400 hover:text-white">
            Clear Matrix
          </button>
        </div>
      </div>

      {/* Main Grid Editor */}
      <div className="flex flex-col items-center gap-6">
        <div 
          className="grid bg-slate-900 p-2 rounded-xl border-4 border-slate-800 shadow-2xl"
          style={{ 
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            width: 'min(80vw, 500px)',
            aspectRatio: '1/1'
          }}
        >
          {grid.map((val, i) => (
            <div
              key={i}
              onClick={() => handleCellClick(i)}
              className="border border-slate-800/30 flex items-center justify-center cursor-crosshair hover:bg-slate-800/50 transition-colors"
            >
              {val !== 0 && (
                <div 
                  className="w-3/4 h-3/4 rounded-full flex items-center justify-center text-slate-950 font-black animate-in fade-in zoom-in duration-300"
                  style={{ backgroundColor: PATH_COLORS[val] }}
                >
                  {val}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex gap-4 w-full">
          <button 
            onClick={generateLevelCode}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest border border-slate-700 transition-all"
          >
            Export Hash
          </button>
          <button 
            onClick={validateAndSolve}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 transition-all"
          >
            Initialize AI Solver
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowEditor;