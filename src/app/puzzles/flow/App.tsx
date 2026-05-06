"use client";

import React, { useState, useEffect, useRef } from 'react';
import FlowGame from './FlowGame';
import FlowEditor from './FlowEditor';

const App = () => {
  const [view, setView] = useState<'play' | 'solve'>('play');
  const [solverSize, setSolverSize] = useState<number>(5);
  
  // Engine & UI State
  const [solverState, setSolverState] = useState<number[][]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [stepsExplored, setStepsExplored] = useState(0);
  const [solveTime, setSolveTime] = useState(0);
  
  // Keep a persistent reference to the Web Worker
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // 1. Initialize the worker
    workerRef.current = new Worker(new URL('./flowsolver.worker.ts', import.meta.url));
    
    // 2. Listen for messages from the background thread
    workerRef.current.onmessage = async (e: MessageEvent) => {
      const { type, steps, solution, duration } = e.data;

      if (type === 'progress') {
        // Update the real-time "Search Space" counter
        setStepsExplored(steps);
      } 
      else if (type === 'result') {
        setIsSolving(false); 
        setSolveTime(duration);
        setStepsExplored(0); // Reset counter so it doesn't linger

        if (solution) {
          const maxLen = Math.max(...solution.map((p: number[]) => p.length));

          // 3. The Animation Loop: Yield to the main thread to prevent UI freezing
          for (let step = 2; step <= maxLen; step++) {
            // Create a fresh array reference every frame
            const frame = solution.map((path: number[]) => path.slice(0, step));
            setSolverState(frame);
            
            // Wait 80ms before the next frame. This is crucial for large 
            // matrices so the browser has time to actually draw the SVG.
            await new Promise(r => setTimeout(r, 80)); 
          }
        } else {
          alert("System Failure: No valid 100% filled solution found.");
        }
      }
    };

    // 4. Cleanup on unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const runAISolver = (userGrid: number[]) => {
    // Reset the board and UI before starting
    setSolverState([]); 
    setStepsExplored(0);
    setSolveTime(0);
    setIsSolving(true);
    
    // Dispatch the payload to the background worker
    workerRef.current?.postMessage({ size: solverSize, grid: userGrid });
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
            
            {/* Matrix Size Selector */}
            <div className="mb-6 flex gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest self-center px-4">Matrix Size:</span>
                {[5, 6, 7, 8, 9, 10, 11].map(size => (
                    <button 
                        key={size}
                        onClick={() => { setSolverSize(size); setSolverState([]); }}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors ${solverSize === size ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        {size}x{size}
                    </button>
                ))}
            </div>

            {/* Telemetry Dashboard */}
            <div className="w-full max-w-[500px] mb-4 grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col items-center shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Search Space</span>
                <span className="text-xl font-mono text-blue-400">
                  {stepsExplored.toLocaleString()} <span className="text-[10px] text-slate-600">states</span>
                </span>
              </div>
              
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col items-center shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Execution Time</span>
                <span className="text-xl font-mono text-emerald-400">
                  {isSolving ? (
                    <span className="animate-pulse">Thinking...</span>
                  ) : (
                    `${(solveTime / 1000).toFixed(2)}s`
                  )}
                </span>
              </div>
            </div>

            {/* The Interactive Editor */}
            <div className="w-full">
              <FlowEditor 
                size={solverSize} 
                onSizeChange={setSolverSize}
                onSolve={runAISolver} 
                solutionPaths={solverState}
                isSolving={isSolving}
                onClearSolution={() => {
                  setSolverState([]);
                  setSolveTime(0);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;