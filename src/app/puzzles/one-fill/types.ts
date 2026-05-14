export interface OneFillLevel {
  id: string;
  width: number;
  height: number;
  start: number;
  end: number;
  grid: number[]; // -1 for BLOCKED, 0 for OPEN
  solution: number[];
  difficulty: string;
}

export type DifficultyCategory = "Easy" | "Medium" | "Hard";