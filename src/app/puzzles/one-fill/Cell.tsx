import React from 'react';

interface CellProps {
  index: number;
  type: number;
  isStart: boolean;
  pathIndex: number;
  nextInPath?: number;
  width: number;
  onMouseDown: () => void;
  onMouseEnter: () => void;
}

const Cell: React.FC<CellProps> = ({ 
  index, type, isStart, pathIndex, nextInPath, width, onMouseDown, onMouseEnter 
}) => {
  const isActive = pathIndex !== -1;
  
  // Calculate Arrow Direction for the "Solution" look
  let arrow = null;
  if (isActive && nextInPath !== undefined) {
    const diff = nextInPath - index;
    if (diff === 1) arrow = "→";
    else if (diff === -1) arrow = "←";
    else if (diff === width) arrow = "↓";
    else if (diff === -width) arrow = "↑";
  }

  // Base styles
  const baseClass = "w-12 h-12 flex items-center justify-center rounded-sm transition-all duration-150 cursor-pointer text-2xl font-bold select-none";
  
  // Blocked Cell
  if (type === -1) {
    return <div className={`${baseClass} bg-slate-900 border border-slate-800 shadow-inner`} />;
  }

  return (
    <div 
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className={`
        ${baseClass} 
        ${isActive ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'bg-slate-700 hover:bg-slate-600 text-slate-500'}
        ${isStart ? 'ring-4 ring-green-500 ring-inset' : ''}
      `}
    >
      {isStart && pathIndex <= 0 ? 'S' : arrow}
      {!isStart && !isActive && <div className="w-2 h-2 rounded-full bg-slate-500" />}
    </div>
  );
};

export default Cell;