"use client";

import React, { useState } from 'react';
import FlowGame from './FlowGame';
import FlowEditor from './FlowEditor';
import { VisualFlowSolver } from './FlowSolverEngine';
import { PATH_COLORS } from './colorMap';

const App = () => {
  const [view, setView] = useState<'play' | 'solve'>('play');
  const [solverState, setSolverState] = useState<number[][]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [solverSize, setSolverSize] = useState<number>(5); // NEW: Controls the AI Grid Size

  const runAISolver = async (userGrid: number[]) => {
    setSolverState([]); // Clear old paths
    setIsSolving(true);
    
    // AI is now initialized with the dynamic solverSize
    const engine = new VisualFlowSolver(
        solverSize, 
        userGrid, 
        (currentPaths) => setSolverState([...currentPaths]) 
    );

    const success = await engine.solve();
    setIsSolving(false);
    
    if (success) {
        alert("AI successfully solved the board!");
    } else {
        alert("No valid 100% filled solution found.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="flex justify-center gap-4 p-6 bg-slate-900 border-b border-slate-800">
        <button onClick={() => setView('play')} className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest ${view === 'play' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
          Mission Mode
        </button>
        <button onClick={() => setView('solve')} className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest ${view === 'solve' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>
          AI Solver Lab
        </button>
      </nav>

      <main className="container mx-auto py-8 relative">
        {view === 'play' ? (
          <FlowGame /> 
        ) : (
          <div className="flex flex-col items-center w-full">
            
            {/* NEW: AI Grid Size Selector */}
            <div className="mb-6 flex gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest self-center px-4">Matrix Size:</span>
                {[5, 6, 7, 8, 9, 10, 11].map(size => (
                    <button 
                        key={size}
                        onClick={() => {
                            setSolverSize(size);
                            setSolverState([]); // Reset visual lines on size change
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors ${solverSize === size ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        {size}x{size}
                    </button>
                ))}
            </div>

            {/* Pass dynamic size to Editor */}
            <div className="relative inline-block w-full">
              <FlowEditor 
                size={solverSize} 
                onSolve={(grid) => runAISolver(grid)} 
              />
              
              <div className="absolute top-0 pointer-events-none flex justify-center w-full mt-[88px]">
                 {/* The margin-left offsets the sidebar width (approx 192px + 32px gap) */}
                 <div style={{ width: 'min(80vw, 500px)', aspectRatio: '1/1', marginLeft: '224px' }}>
                    <svg className="w-full h-full" viewBox="0 0 1000 1000">
                      {solverState.map((path, i) => (
                        <PolyLine key={i} cells={path} size={solverSize} color={PATH_COLORS[i+1]} isActive={isSolving} />
                      ))}
                    </svg>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const PolyLine = ({ cells, size, color, isActive }: { cells: number[], size: number, color: string, isActive: boolean }) => {
  if (cells.length < 2) return null;
  const points = cells.map(index => {
    const r = Math.floor(index / size), c = index % size;
    return `${((c + 0.5) / size) * 1000},${((r + 0.5) / size) * 1000}`;
  }).join(' ');

  return <polyline points={points} fill="none" stroke={color} strokeWidth={isActive ? "25" : "40"} strokeLinecap="round" strokeLinejoin="round" opacity={isActive ? 0.6 : 1} style={{ filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none' }} />;
};

export default App;