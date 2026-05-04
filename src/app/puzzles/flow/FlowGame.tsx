"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FlowGenerator } from './FlowGenerator';
import { BoardConfig, DifficultyLevel } from './types';
import { PATH_COLORS } from './colorMap';

interface CompletedPath { pairId: number; cells: number[]; }

const FlowGame: React.FC = () => {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [board, setBoard] = useState<BoardConfig | null>(null);
  
  // Game States
  const [completedPaths, setCompletedPaths] = useState<CompletedPath[]>([]);
  const [activePairId, setActivePairId] = useState<number | null>(null);
  const [activePathCells, setActivePathCells] = useState<number[]>([]);

  // NEW: Gallery States
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [savedPuzzles, setSavedPuzzles] = useState<Record<string, any>>({});

  const startNewGame = useCallback((newLevel: DifficultyLevel) => {
    const config = FlowGenerator.generateLevel(newLevel);
    setBoard(config);
    setCompletedPaths([]);
    setActivePairId(null);
    setActivePathCells([]);
    setIsGalleryOpen(false); // Close gallery when starting a standard level
  }, []);

  useEffect(() => {
    startNewGame(level);
  }, [level, startNewGame]);

  // NEW: Fetch local storage when Gallery opens
  useEffect(() => {
      if (isGalleryOpen) {
          const saved = localStorage.getItem('flow_puzzles');
          if (saved) setSavedPuzzles(JSON.parse(saved));
      }
  }, [isGalleryOpen]);

  // NEW: Load a custom board into the game
  const loadCustomPuzzle = (puzzleName: string, puzzleData: any) => {
      // Count unique pairs in the custom grid
      const uniqueNumbers = new Set(puzzleData.grid.filter((n: number) => n !== 0));
      
      const customConfig: BoardConfig = {
          level: 1, // Doesn't matter for custom
          size: puzzleData.size,
          pairs: uniqueNumbers.size,
          grid: puzzleData.grid
      };

      setBoard(customConfig);
      setCompletedPaths([]);
      setActivePairId(null);
      setActivePathCells([]);
      setIsGalleryOpen(false);
  };


  // ... KEEP YOUR EXISTING handlePointerDown, handlePointerEnter, and handlePointerUp functions here ...
  const handlePointerDown = (index: number, cellValue: number) => {
    if (cellValue === 0) return;
    setCompletedPaths(prev => prev.filter(p => p.pairId !== cellValue));
    setActivePairId(cellValue);
    setActivePathCells([index]);
  };

  const handlePointerEnter = (index: number) => {
    if (activePairId === null || !board) return;
    const lastIndex = activePathCells[activePathCells.length - 1];
    const rowDiff = Math.abs(Math.floor(index / board.size) - Math.floor(lastIndex / board.size));
    const colDiff = Math.abs((index % board.size) - (lastIndex % board.size));
    const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);

    if (!isAdjacent) return;
    if (activePathCells.length > 1 && activePathCells[activePathCells.length - 2] === index) {
      setActivePathCells(prev => prev.slice(0, -1));
      return;
    }
    if (activePathCells.includes(index)) return;
    if (completedPaths.some(p => p.cells.includes(index))) return;
    
    const targetCellValue = board.grid[index];
    if (targetCellValue !== 0 && targetCellValue !== activePairId) return;

    const newPath = [...activePathCells, index];
    setActivePathCells(newPath);

    if (targetCellValue === activePairId && newPath.length > 1) {
      setCompletedPaths(prev => [...prev, { pairId: activePairId, cells: newPath }]);
      setActivePairId(null);
      setActivePathCells([]);
    }
  };

  const handlePointerUp = () => {
    setActivePairId(null);
    setActivePathCells([]);
  };

  if (!board) return <div className="text-white text-center mt-20">Initializing...</div>;

  const isBoardFull = () => {
    if (!board) return false;
    const occupiedCount = completedPaths.reduce((acc, p) => acc + p.cells.length, 0);
    return occupiedCount === board.size * board.size;
  };
  const isLevelComplete = completedPaths.length === board?.pairs && isBoardFull();

  return (
    <div className="bg-slate-950 flex flex-col items-center justify-center p-4 font-mono select-none" onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      
      {/* Header UI */}
      <div className="mb-8 text-center space-y-4 w-full max-w-2xl">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-slate-200 tracking-widest uppercase">Network Router</h1>
            
            {/* NEW: Gallery Toggle Button */}
            <button 
                onClick={() => setIsGalleryOpen(!isGalleryOpen)}
                className="px-4 py-2 border border-slate-700 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-xs font-bold uppercase tracking-widest"
            >
                {isGalleryOpen ? 'Return to Game' : 'Level Gallery'}
            </button>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          {([1, 2, 3, 4, 5, 6, 7] as DifficultyLevel[]).map(l => (
            <button key={l} onClick={() => { setLevel(l); startNewGame(l); }} className={`px-3 py-1 text-xs font-bold rounded ${level === l && !isGalleryOpen ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              Lvl {l}
            </button>
          ))}
        </div>
      </div>

      {/* NEW: Gallery View vs Game View */}
      {isGalleryOpen ? (
          <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(savedPuzzles).length === 0 ? (
                  <div className="col-span-full text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-xl">
                      No custom architectures found. Create some in the AI Solver Lab.
                  </div>
              ) : (
                  Object.entries(savedPuzzles).map(([name, data]) => (
                      <div key={name} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center gap-4 hover:border-slate-600 transition-colors">
                          <h3 className="text-slate-200 font-bold uppercase tracking-wider text-sm">{name}</h3>
                          <div className="text-slate-500 text-xs">Size: {data.size}x{data.size}</div>
                          
                          {/* Mini Preview Grid */}
                          <div className="grid gap-[2px] bg-slate-800 p-1 rounded" style={{ gridTemplateColumns: `repeat(${data.size}, 1fr)`, width: '100px', height: '100px' }}>
                              {data.grid.map((val: number, i: number) => (
                                  <div key={i} className="flex items-center justify-center bg-slate-900">
                                      {val !== 0 && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PATH_COLORS[val] }} />}
                                  </div>
                              ))}
                          </div>

                          <button onClick={() => loadCustomPuzzle(name, data)} className="w-full py-2 mt-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600 hover:text-white text-xs font-bold uppercase transition-colors">
                              Load Architecture
                          </button>
                      </div>
                  ))
              )}
          </div>
      ) : (
          /* The Existing Game Board Container */
          <div className="relative bg-slate-900 border-2 border-slate-800 rounded-xl shadow-2xl p-4 overflow-hidden" style={{ width: 'min(90vw, 550px)', aspectRatio: '1 / 1', touchAction: 'none' }}>
            <div className="w-full h-full grid relative" style={{ gridTemplateColumns: `repeat(${board.size}, 1fr)`, gridTemplateRows: `repeat(${board.size}, 1fr)`, zIndex: 1 }}>
                {board.grid.map((cellValue, index) => (
                <div key={index} onPointerDown={(e) => { (e.target as HTMLElement).releasePointerCapture(e.pointerId); handlePointerDown(index, cellValue); }} onPointerEnter={() => handlePointerEnter(index)} className="relative flex items-center justify-center border border-white/5">
                    {cellValue !== 0 && ( <div className="w-3/4 h-3/4 rounded-full flex items-center justify-center text-slate-950 font-black relative" style={{ backgroundColor: PATH_COLORS[cellValue], zIndex: 30 }}>{cellValue}</div> )}
                </div>
                ))}
            </div>

            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none" style={{ zIndex: 20, padding: '1rem' }}>
                {completedPaths.map((path, i) => ( <PolyLine key={i} cells={path.cells} size={board.size} color={PATH_COLORS[path.pairId]} /> ))}
                {activePairId && activePathCells.length > 0 && ( <PolyLine cells={activePathCells} size={board.size} color={PATH_COLORS[activePairId]} isActive /> )}
            </svg>
          </div>
      )}

      {/* Footer Status */}
      {!isGalleryOpen && (
          <div className="mt-8 text-center h-12">
            {isLevelComplete ? (
              <div className="text-emerald-400 font-bold uppercase tracking-[0.3em] animate-pulse">Matrix Synced</div>
            ) : (
              <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">Links: {completedPaths.length} / {board.pairs}</div>
            )}
          </div>
      )}
    </div>
  );
};

// ... KEEP YOUR EXISTING PolyLine COMPONENT HERE ...
const PolyLine = ({ cells, size, color, isActive = false }: { cells: number[], size: number, color: string, isActive?: boolean }) => {
    if (cells.length < 2) return null;
    const points = cells.map(index => {
      const r = Math.floor(index / size);
      const c = index % size;
      const x = ((c + 0.5) / size) * 1000;
      const y = ((r + 0.5) / size) * 1000;
      return `${x},${y}`;
    }).join(' ');
  
    return (
      <polyline points={points} fill="none" stroke={color} strokeWidth={isActive ? 35 : 45} strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s ease', filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none', opacity: isActive ? 0.7 : 1 }} />
    );
  };

export default FlowGame;