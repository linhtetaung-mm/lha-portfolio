// FlowGenerator.ts
import { BoardConfig, DifficultyLevel } from './types';

export class FlowGenerator {
  // Maps Level 1-7 to their respective sizes
  private static readonly SIZE_MAP: Record<DifficultyLevel, number> = {
    1: 5, 2: 6, 3: 7, 4: 8, 5: 9, 6: 10, 7: 11
  };

  /**
   * Generates a fully playable board for a specific level.
   */
  public static generateLevel(level: DifficultyLevel): BoardConfig {
    const size = this.SIZE_MAP[level];
    const pairs = size - 1;
    const totalCells = size * size;

    let grid: number[] | null = null;
    let attempts = 0;

    // Keep trying until a valid board is successfully generated
    while (!grid && attempts < 10000) {
      grid = this.attemptGeneration(size, pairs, totalCells);
      attempts++;
    }

    if (!grid) {
      console.warn("Generation timed out. Yielding fallback board.");
      grid = new Array(totalCells).fill(0); // Fallback to prevent crashes
    }

    return { level, size, pairs, grid };
  }

  private static absorbEmptyCells(paths: number[][], globalUsed: Set<number>, size: number): boolean {
    let changed = true;
    while (changed) {
        changed = false;
        for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        // Try expanding from either the start or end of the path
        const endpoints = [path[0], path[path.length - 1]];
        
        for (const edge of endpoints) {
            const neighbors = this.getValidNeighbors(edge, size, globalUsed, new Set());
            if (neighbors.length > 0) {
            const hole = neighbors[0];
            // Stretch the path: add the hole to the start or end
            if (edge === path[0]) path.unshift(hole);
            else path.push(hole);
            
            globalUsed.add(hole);
            changed = true;
            break;
            }
        }
        }
    }
    // Return true only if every cell is now covered
    return globalUsed.size === size * size;
    }

  /**
   * Attempts to generate a single board. Returns null if it gets stuck.
   */
  private static attemptGeneration(size: number, pairs: number, totalCells: number): number[] | null {
    const grid = new Array(totalCells).fill(0);
    const usedCells = new Set<number>();
    const paths: number[][] = [];

    for (let currentPair = 1; currentPair <= pairs; currentPair++) {
        const start = this.getRandomEmptyCell(totalCells, usedCells);
        if (start === null) return null; 

        // Generate a snake that is forced to be longer if the board is empty
        const path = this.generateSnake(start, size, usedCells, totalCells);
        if (path.length < 2) return null; 

        path.forEach(cell => usedCells.add(cell));
        paths.push(path);
    }

    // CRITICAL FIX: If we used all pairs but cells are still empty, 
    // we must "expand" the existing paths to absorb the empty holes.
    if (usedCells.size < totalCells) {
        const success = this.absorbEmptyCells(paths, usedCells, size);
        if (!success) return null; // If holes are isolated, restart generation
    }

    // Map only the ENDPOINTS to the grid
    paths.forEach((path, i) => {
        const pairId = i + 1;
        grid[path[0]] = pairId;
        grid[path[path.length - 1]] = pairId;
    });

    return grid;
    }



  /**
   * Generates a single continuous path without hard length limits,
   * but stops randomly to allow room for other paths.
   */
 /**
 * Generates a single continuous path.
 * Updated to accept 4 arguments and prioritize filling the board.
 */
private static generateSnake(
    start: number, 
    size: number, 
    globalUsed: Set<number>, 
    totalCells: number
    ): number[] {
    let current = start;
    const path = [start];
    const localUsed = new Set<number>([start]);

    // Calculate "target length" based on remaining empty space
    // This helps prevent empty squares on large 11x11 boards
    const remainingCells = totalCells - globalUsed.size;
    const targetLength = Math.max(3, Math.floor(remainingCells / (size - 1)));

    while (true) {
        const neighbors = this.getValidNeighbors(current, size, globalUsed, localUsed);
        if (neighbors.length === 0) break; // Path is trapped

        // Prioritize neighbors that lead toward "open" areas
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        current = next;
        path.push(current);
        localUsed.add(current);

        // Dynamic termination: Stop if we've reached a good length, 
        // but only if the board isn't too empty.
        if (path.length >= targetLength && Math.random() < 0.3) {
        break; 
        }
    }

    return path;
    }

  /**
   * Helper: Finds neighbors (Up, Down, Left, Right) using 1D math.
   */
  private static getValidNeighbors(
    pos: number, size: number, globalUsed: Set<number>, localUsed: Set<number>
  ): number[] {
    const valid = [];
    const row = Math.floor(pos / size);
    const col = pos % size;

    const moves = [
      { r: row - 1, c: col, nextPos: pos - size }, // Up
      { r: row + 1, c: col, nextPos: pos + size }, // Down
      { r: row, c: col - 1, nextPos: pos - 1 },    // Left
      { r: row, c: col + 1, nextPos: pos + 1 },    // Right
    ];

    for (const move of moves) {
      if (
        move.r >= 0 && move.r < size && 
        move.c >= 0 && move.c < size && 
        !globalUsed.has(move.nextPos) && 
        !localUsed.has(move.nextPos)
      ) {
        valid.push(move.nextPos);
      }
    }

    return valid;
  }

  private static getRandomEmptyCell(totalCells: number, usedCells: Set<number>): number | null {
    const available = [];
    for (let i = 0; i < totalCells; i++) {
      if (!usedCells.has(i)) available.push(i);
    }
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }
}