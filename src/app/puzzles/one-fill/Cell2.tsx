import React from 'react';

interface CellProps {
  index: number;
  type: number;
  isStart: boolean;
  pathIndex: number;
  prevInPath?: number;
  nextInPath?: number;
  width: number;
  onMouseDown: () => void;
  onMouseEnter: () => void;
}

const Cell: React.FC<CellProps> = ({ 
  index, type, isStart, pathIndex, prevInPath, nextInPath, width, onMouseDown, onMouseEnter 
}) => {
  const isActive = pathIndex !== -1;
  
  // Helper to get relative direction
  const getDir = (neighbor?: number) => {
    if (neighbor === undefined) return null;
    if (neighbor === index - width) return 'top';
    if (neighbor === index + width) return 'bottom';
    if (neighbor === index - 1) return 'left';
    if (neighbor === index + 1) return 'right';
    return null;
  };

  const prevDir = getDir(prevInPath);
  const nextDir = getDir(nextInPath);

  // SVG Coordinates for the center and edges
  const points: Record<string, string> = {
    center: "25,25",
    top: "25,0",
    bottom: "25,50",
    left: "0,25",
    right: "50,25"
  };

  // Build the SVG path string
  let svgPath = "";
  if (isActive) {
    if (prevDir && nextDir) {
      // If it's a middle cell, draw a line from prev edge to center to next edge
      svgPath = `M ${points[prevDir]} L ${points.center} L ${points[nextDir]}`;
    } else if (prevDir || nextDir) {
      // If it's the head or tail, draw from the neighbor edge to center
      const dir = prevDir || nextDir;
      if (dir) svgPath = `M ${points[dir]} L ${points.center}`;
    }
  }

  if (type === -1) {
    return <div className="w-12 h-12 bg-slate-900 border border-slate-800" />;
  }

  return (
    <div 
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className="relative w-12 h-12 bg-slate-800 flex items-center justify-center cursor-pointer transition-colors duration-300"
    >
      {/* Background Dot for unvisited cells */}
      {!isActive && <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}

      {/* The SVG Pipe Layer */}
      {isActive && (
        <svg viewBox="0 0 50 50" className="absolute inset-0 w-full h-full pointer-events-none">
          <path 
            d={svgPath}
            fill="none"
            stroke="rgb(34 211 238)" // Cyan-400
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          />
          {/* Glowing Center Cap */}
          <circle cx="25" cy="25" r="6" fill="rgb(34 211 238)" />
        </svg>
      )}

      {/* Start UI */}
      {isStart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center">
              <span className="text-white font-black text-[10px]">S</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default Cell;