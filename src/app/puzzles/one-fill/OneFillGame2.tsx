import React, { useState, useEffect, useCallback } from 'react';
import { OneFillLevel } from './types';
import Cell from './Cell2';

interface GameProps {
  level: OneFillLevel;
  onWin: () => void;
}

const OneFillGame: React.FC<GameProps> = ({ level, onWin }) => {
  const [path, setPath] = useState<number[]>([level.start]);
  const [isDragging, setIsDragging] = useState(false);
  const [isWon, setIsWon] = useState(false);

  // Logic to handle movement and "erasing"
  const handleMove = useCallback((index: number) => {
    if (level.grid[index] === -1 || isWon) return;

    const lastPos = path[path.length - 1];
    
    // Check if the cell is a valid neighbor (Up, Down, Left, Right)
    const neighbors = [
      lastPos - 1,             // Left
      lastPos + 1,             // Right
      lastPos - level.width,   // Up
      lastPos + level.width    // Down
    ];

    if (neighbors.includes(index)) {
      if (path.includes(index)) {
        // If the user moves back into the previous cell, undo the last step (Erasing)
        if (index === path[path.length - 2]) {
          setPath(prev => prev.slice(0, -1));
        }
      } else {
        // Add new cell to the path
        setPath(prev => [...prev, index]);
      }
    }
  }, [path, level, isWon]);

  // Check Win Condition
  useEffect(() => {
    const totalOpenCells = level.grid.filter(c => c === 0).length;
    // Win if path covers all open cells AND ends at the implicit end index
    if (path.length === totalOpenCells && path[path.length - 1] === level.end) {
      setIsWon(true);
      setTimeout(onWin, 1000); // Transition to next level after 1 second
    }
  }, [path, level, onWin]);

  // Reset local state when the level changes
  useEffect(() => {
    setPath([level.start]);
    setIsWon(false);
  }, [level]);

  return (
    <div 
      className="flex flex-col items-center"
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)} // Stop dragging if mouse leaves the board
    >
      <div 
        className="grid gap-0 bg-slate-900 p-4 rounded-xl shadow-2xl border-4 border-slate-800"
        style={{ 
          gridTemplateColumns: `repeat(${level.width}, 1fr)`,
          width: 'fit-content'
        }}
      >
        {level.grid.map((cellType, idx) => {
          // IMPORTANT: Find the cell's position in the user's current path
          const pathIndex = path.indexOf(idx);

          return (
            <Cell 
              key={`${level.id}-${idx}`}
              index={idx}
              type={cellType}
              isStart={idx === level.start}
              pathIndex={pathIndex}
              
              /* NEW PIPE LOGIC: 
                 Pass the index of the cell BEFORE and AFTER this one in the path.
                 The Cell component uses these to know where to draw the pipe lines. */
              prevInPath={pathIndex > 0 ? path[pathIndex - 1] : undefined}
              nextInPath={pathIndex < path.length - 1 ? path[pathIndex + 1] : undefined}
              
              width={level.width}
              onMouseDown={() => {
                setIsDragging(true);
                handleMove(idx);
              }}
              onMouseEnter={() => {
                if (isDragging) handleMove(idx);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default OneFillGame;