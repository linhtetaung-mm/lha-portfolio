import React, { useState, useEffect, useCallback } from 'react';
import { OneFillLevel } from './types';
import Cell from './Cell';

interface GameProps {
  level: OneFillLevel;
  onLevelComplete: () => void;
}

const OneFillGame: React.FC<GameProps> = ({ level, onLevelComplete }) => {
  const [path, setPath] = useState<number[]>([level.start]);
  const [isDragging, setIsDragging] = useState(false);
  const [isWon, setIsWon] = useState(false);

  // Helper: Get adjacent neighbors
  const getNeighbors = (pos: number) => {
    const n = [];
    const r = Math.floor(pos / level.width);
    const c = pos % level.width;
    if (r > 0) n.push(pos - level.width);
    if (r < level.height - 1) n.push(pos + level.width);
    if (c > 0) n.push(pos - 1);
    if (c < level.width - 1) n.push(pos + 1);
    return n;
  };

  const handleMove = useCallback((index: number) => {
    if (level.grid[index] === -1 || isWon) return;

    const lastPos = path[path.length - 1];
    if (getNeighbors(lastPos).includes(index)) {
      if (path.includes(index)) {
        // Undo move if dragging back to previous cell
        if (index === path[path.length - 2]) {
          setPath(prev => prev.slice(0, -1));
        }
      } else {
        // Add to path
        setPath(prev => [...prev, index]);
      }
    }
  }, [path, level, isWon]);

  // Win Detection
  useEffect(() => {
    const totalOpenCells = level.grid.filter(c => c === 0).length;
    if (path.length === totalOpenCells && path[path.length - 1] === level.end) {
      setIsWon(true);
      setTimeout(onLevelComplete, 1500);
    }
  }, [path, level, onLevelComplete]);

  // Reset when level changes
  useEffect(() => {
    setPath([level.start]);
    setIsWon(false);
  }, [level]);

  return (
    <div 
      className="flex flex-col items-center"
      onMouseUp={() => setIsDragging(false)}
    >
      <div 
        className="grid gap-1 bg-slate-800 p-3 rounded-xl shadow-2xl border-4 border-slate-700"
        style={{ 
          gridTemplateColumns: `repeat(${level.width}, minmax(0, 1fr))`,
          width: 'fit-content'
        }}
      >
        {level.grid.map((cell, idx) => (
          <Cell 
            key={`${level.id}-${idx}`}
            index={idx}
            type={cell}
            isStart={idx === level.start}
            pathIndex={path.indexOf(idx)}
            nextInPath={path[path.indexOf(idx) + 1]}
            width={level.width}
            onMouseDown={() => { setIsDragging(true); handleMove(idx); }}
            onMouseEnter={() => { if (isDragging) handleMove(idx); }}
          />
        ))}
      </div>
      
      {isWon && (
        <div className="mt-6 text-2xl font-black text-green-400 tracking-widest animate-pulse">
          LEVEL CLEAR!
        </div>
      )}
    </div>
  );
};

export default OneFillGame;