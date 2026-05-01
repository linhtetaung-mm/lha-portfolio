"use client";

import { useState, useEffect } from 'react';

export default function GreensAndReds() {
  // We use a 1D array of 9 numbers (1 for Green, 0 for Red) for easier React mapping.
  // We use lazy initialization so the scramble only happens once when the component mounts.
  const [board, setBoard] = useState<number[]>(() => initializeBoard());
  const [moves, setMoves] = useState(0);

  // Your original scramble logic, adapted for a 1D array
  function initializeBoard(): number[] {
    let tempBoard = Array(9).fill(1);
    // Scramble with 20 random clicks
    for (let i = 0; i < 20; i++) {
      const randomPos = Math.floor(Math.random() * 9);
      tempBoard = calculateNewBoard(randomPos, tempBoard);
    }
    return tempBoard;
  }

  // This replaces your clickSquare() and changeColor() functions.
  // Instead of drawing to a canvas, we just calculate the new array.
  function calculateNewBoard(pos: number, currentBoard: number[]): number[] {
    const newBoard = [...currentBoard];
    const r = Math.floor(pos / 3);
    const c = pos % 3;

    // A clever trick: XOR (^= 1) flips 0 to 1, and 1 to 0.
    newBoard[pos] ^= 1; // Clicked square

    // Check bounds and flip neighbors, exactly like your original logic
    if (r < 2) newBoard[(r + 1) * 3 + c] ^= 1; // Bottom
    if (r > 0) newBoard[(r - 1) * 3 + c] ^= 1; // Top
    if (c < 2) newBoard[r * 3 + (c + 1)] ^= 1; // Right
    if (c > 0) newBoard[r * 3 + (c - 1)] ^= 1; // Left

    return newBoard;
  }

  // The actual click handler attached to the React buttons
  const handleSquareClick = (index: number) => {
    setBoard((prevBoard) => calculateNewBoard(index, prevBoard));
    setMoves((m) => m + 1);
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setMoves(0);
  };

  // Optional: Check if all squares are green (1)
  const isWinner = board.every((cell) => cell === 1);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      
      {/* Game Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Greens & Reds</h2>
        <p className="text-gray-500">Make all squares Green. Moves: {moves}</p>
      </div>

      {/* The Game Board (Replaces the Canvas) */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[400px] aspect-square bg-black p-2 rounded-xl shadow-lg">
        {board.map((cellValue, index) => (
          <button
            key={index}
            onClick={() => handleSquareClick(index)}
            disabled={isWinner}
            className={`
              w-full h-full rounded-md transition-colors duration-300 shadow-inner
              ${cellValue === 1 ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}
            `}
            aria-label={`Square ${index}`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button 
          onClick={resetGame}
          className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
        >
          Reset Grid
        </button>
      </div>

      {/* Win State */}
      {isWinner && moves > 0 && (
        <div className="text-green-600 font-bold text-xl animate-bounce">
          Puzzle Solved!
        </div>
      )}
    </div>
  );
}