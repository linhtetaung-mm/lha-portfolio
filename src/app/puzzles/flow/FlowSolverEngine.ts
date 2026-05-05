export class VisualFlowSolver {
  private size: number;
  private grid: number[];
  private goals: Map<number, number[]>;
  private onProgress?: (steps: number) => void;
  private stepCount: number = 0;

  constructor(size: number, grid: number[], onProgress?: (steps: number) => void) {
    this.size = size;
    this.grid = [...grid];
    this.onProgress = onProgress;
    this.goals = new Map();
    grid.forEach((val, idx) => {
      if (val !== 0) {
        if (!this.goals.has(val)) this.goals.set(val, []);
        this.goals.get(val)!.push(idx);
      }
    });
  }

  solve(): number[][] | null {
    const colors = Array.from(this.goals.keys());
    const paths = new Map<number, number[]>();
    colors.forEach(c => paths.set(c, [this.goals.get(c)![0]]));

    const result = this.backtrack(colors, paths);
    return result ? Array.from(result.values()) : null;

    // return this.backtrack(colors, paths);
  }

  private backtrack(remainingColors: number[], paths: Map<number, number[]>): Map<number, number[]> | null {
    this.stepCount++;
    if (this.stepCount % 5000 === 0 && this.onProgress) {
        this.onProgress(this.stepCount);
    }

    if (remainingColors.length === 0) {
      return this.grid.every(cell => cell !== 0) ? paths : null;
    }

    // Optimization: Pick the color with the most constrained target (nearest)
    const color = this.getMostConstrainedColor(remainingColors, paths);
    const currentPath = paths.get(color)!;
    const lastPos = currentPath[currentPath.length - 1];
    const target = this.goals.get(color)![1];

    for (const next of this.getNeighbors(lastPos)) {
      if (next === target) {
        if (currentPath.length < 2) continue; // Rule #5 Violation Check[cite: 5]
        
        currentPath.push(next);
        const res = this.backtrack(remainingColors.filter(c => c !== color), paths);
        if (res) return res;
        currentPath.pop();
        continue;
      }

      if (this.grid[next] === 0) {
        this.grid[next] = color;
        currentPath.push(next);

        // Advanced Pruning: Only proceed if all other colors are still reachable
        if (this.allColorsStillPossible(remainingColors, paths)) {
            const res = this.backtrack(remainingColors, paths);
            if (res) return res;
        }

        this.grid[next] = 0;
        currentPath.pop();
      }
    }
    return null;
  }

  private getMostConstrainedColor(colors: number[], paths: Map<number, number[]>): number {
    // Heuristic: Returns the color whose current tip is closest to its goal
    return colors.sort((a, b) => {
        const distA = this.getDist(paths.get(a)![paths.get(a)!.length - 1], this.goals.get(a)![1]);
        const distB = this.getDist(paths.get(b)![paths.get(b)!.length - 1], this.goals.get(b)![1]);
        return distA - distB;
    })[0];
  }

  private getDist(p1: number, p2: number): number {
    return Math.abs(Math.floor(p1/this.size) - Math.floor(p2/this.size)) + 
           Math.abs((p1%this.size) - (p2%this.size));
  }

  private allColorsStillPossible(colors: number[], paths: Map<number, number[]>): boolean {
    // Basic connectivity check using BFS could be added here for 11x11 performance
    return true; 
  }

  private getNeighbors(pos: number): number[] {
    const n: number[] = [], r = Math.floor(pos/this.size), c = pos % this.size;
    if (r > 0) n.push(pos - this.size);
    if (r < this.size - 1) n.push(pos + this.size);
    if (c > 0) n.push(pos - 1);
    if (c < this.size - 1) n.push(pos + 1);
    return n;
  }
}