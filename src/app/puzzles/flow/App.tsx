"use client";

import React, { useState, useEffect, useRef } from 'react';
import FlowGame from './FlowGame';
import FlowEditor from './FlowEditor';
import { VisualFlowSolver } from './FlowSolverEngine';

const App = () => {
  const [view, setView] = useState<'play' | 'solve'>('play');
  const [solverState, setSolverState] = useState<number[][]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [solverSize, setSolverSize] = useState<number>(5);

  const [stepsExplored, setStepsExplored] = useState(0);
  const [solveTime, setSolveTime] = useState(0);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // 1. Initialize the Web Worker on component mount
    workerRef.current = new Worker(new URL('./flowsolver.worker.ts', import.meta.url));
    
    // 2. Set up the message listener to handle data coming back from the worker[cite: 3]
    // workerRef.current.onmessage = async (e: MessageEvent) => {
    //   const { type, steps, solution, duration } = e.data;

    //   if (type === 'progress') {
    //     // Provide real-time feedback on how many paths the AI has explored
    //     setStepsExplored(steps);
    //   } 
      
    //   else if (type === 'result') {
    //     setSolveTime(duration);
        
    //     if (solution) {
    //       // Calculate the longest path to determine total animation frames
    //       const maxLen = Math.max(...solution.map((p: number[]) => p.length));

    //       /**
    //        * ANIMATION LOOP
    //        * We use an immutable slice approach to ensure React triggers a 
    //        * re-render for every frame of the solution paths.
    //        */
    //       for (let step = 2; step <= maxLen; step++) {
    //         setSolverState(solution.map((path: number[]) => path.slice(0, step)));
    //         // Smooth animation delay (approx 16 frames per second)
    //         await new Promise(r => setTimeout(r, 60)); 
    //       }
    //     } else {
    //       // Triggered if the AI explores the entire state space without a 100% fill
    //       alert("System Failure: No valid 100% filled solution found.");
    //     }
        
    //     setIsSolving(false);
    //   }
    // };

    workerRef.current.onmessage = async (e: MessageEvent) => {
      const { type, steps, solution } = e.data;

      if (type === 'progress') {
        setStepsExplored(steps);
      } 
      
      else if (type === 'result') {
        setIsSolving(false); 
        // Stop the progress counter immediately
        setStepsExplored(0); 

        if (solution) {
          const maxLen = Math.max(...solution.map((p: number[]) => p.length));

          // Use a functional update to ensure we don't block the thread
          for (let step = 2; step <= maxLen; step++) {
            const frame = solution.map((path: number[]) => path.slice(0, step));
            setSolverState(frame);
            // Increase delay slightly for 9x9 to give the browser room to breathe
            await new Promise(r => setTimeout(r, 80)); 
          }
        }
      }
    };

    // 3. Clean up: Terminate the background thread if the user leaves the page[cite: 3]
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const runAISolver = (userGrid: number[]) => {
    setSolverState([]); 
    setIsSolving(true);
    // Send data to background thread to prevent UI freeze[cite: 3]
    workerRef.current?.postMessage({ size: solverSize, grid: userGrid });
  };

  

  // const runAISolver = async (userGrid: number[]) => {
  //   setSolverState([]); 
  //   setIsSolving(true);
    
  //   const engine = new VisualFlowSolver(solverSize, userGrid);
  //   const solution = engine.solve();

  //   if (solution) {
  //       const maxLen = Math.max(...solution.map(p => p.length));

  //       // Using .slice() creates a purely immutable array every frame, 
  //       // guaranteeing React will update the UI without dropping frames.
  //       for (let step = 2; step <= maxLen; step++) {
  //           setSolverState(solution.map(path => path.slice(0, step)));
  //           await new Promise(r => setTimeout(r, 60)); 
  //       }
        
  //       setIsSolving(false);
  //   } else {
  //       setIsSolving(false);
  //       alert("System Failure: No valid 100% filled solution found.");
  //   }
  // };

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
            <div className="mb-6 flex gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest self-center px-4">Matrix Size:</span>
                {[5, 6, 7, 8, 9, 10, 11].map(size => (
                    <button 
                        key={size}
                        onClick={() => {
                            setSolverSize(size);
                            setSolverState([]); 
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors ${solverSize === size ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        {size}x{size}
                    </button>
                ))}
            </div>

            {/* Add this inside your main solver view, above <FlowEditor /> */}
            <div className="w-full max-w-[500px] mb-4 grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Search Space</span>
                <span className="text-xl font-mono text-blue-400">
                  {stepsExplored.toLocaleString()} <span className="text-[10px] text-slate-600">states</span>
                </span>
              </div>
              
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Execution Time</span>
                <span className="text-xl font-mono text-emerald-400">
                  {isSolving ? (
                    <span className="animate-pulse">Thinking...</span>
                  ) : (
                    `${(solveTime / 1000).toFixed(2)}s`
                  )}
                </span>
              </div>
            </div>

            <div className="w-full">
              <FlowEditor 
                size={solverSize} 
                onSizeChange={setSolverSize}
                onSolve={(grid) => runAISolver(grid)} 
                solutionPaths={solverState}
                isSolving={isSolving}
                onClearSolution={() => setSolverState([])}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;