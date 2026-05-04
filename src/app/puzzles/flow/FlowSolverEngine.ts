export class VisualFlowSolver {
  constructor(
    private size: number,
    private grid: number[],
    private onStep: (paths: number[][]) => void
  ) {}

  public async solve(): Promise<boolean> {
    const pairs = this.getPairs();
    return await this.backtrack(pairs, 0, [], new Set());
  }

  private async backtrack(pairs: any[], idx: number, solution: number[][], used: Set<number>): Promise<boolean> {
    if (idx === pairs.length) return used.size === this.size * this.size;

    const possiblePaths = this.findPaths(pairs[idx].start, pairs[idx].end);
    for (const path of possiblePaths) {
      if (path.some(c => used.has(c))) continue;

      path.forEach(c => used.add(c));
      solution.push(path);
      this.onStep([...solution]);
      await new Promise(r => setTimeout(r, 40)); // Visual Speed

      if (await this.backtrack(pairs, idx + 1, solution, used)) return true;

      solution.pop();
      path.forEach(c => used.delete(c));
      this.onStep([...solution]);
    }
    return false;
  }

  private findPaths(start: number, end: number): number[][] {
    const results: number[][] = [];
    const dfs = (curr: number, path: number[], vis: Set<number>) => {
      if (curr === end) { results.push([...path]); return; }
      const neighbors = this.getNeighbors(curr).filter(n => !vis.has(n) && (this.grid[n] === 0 || n === end));
      for (const n of neighbors) {
        vis.add(n); path.push(n);
        dfs(n, path, vis);
        path.pop(); vis.delete(n);
      }
    };
    dfs(start, [start], new Set([start]));
    return results;
  }

  private getNeighbors(pos: number): number[] {
    const r = Math.floor(pos / this.size), c = pos % this.size, n = [];
    if (r > 0) n.push(pos - this.size); if (r < this.size - 1) n.push(pos + this.size);
    if (c > 0) n.push(pos - 1); if (c < this.size - 1) n.push(pos + 1);
    return n;
  }

  private getPairs() {
    const pairs: any = {};
    this.grid.forEach((val, i) => {
      if (val !== 0) {
        if (!pairs[val]) pairs[val] = { id: val, start: i };
        else pairs[val].end = i;
      }
    });
    return Object.values(pairs);
  }
}