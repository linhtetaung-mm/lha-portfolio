


const ADJACENCY_MATRIX = [
  [1, 1, 0, 1, 0, 0, 0, 0, 0], 
  [1, 1, 1, 0, 1, 0, 0, 0, 0], 
  [0, 1, 1, 0, 0, 1, 0, 0, 0],
  [1, 0, 0, 1, 1, 0, 1, 0, 0], 
  [0, 1, 0, 1, 1, 1, 0, 1, 0], 
  [0, 0, 1, 0, 1, 1, 0, 0, 1],
  [0, 0, 0, 1, 0, 0, 1, 1, 0], 
  [0, 0, 0, 0, 1, 0, 1, 1, 1], 
  [0, 0, 0, 0, 0, 1, 0, 1, 1]
];

export function getSolution(currentBoard: number[]) {
  // Target: we want to flip all 0s (Red) to 1s (Green)
  const b = currentBoard.map(val => val === 0 ? 1 : 0);

  let matrix = ADJACENCY_MATRIX.map((row, i) => [...row, b[i]]);
  
  for (let pivot = 0; pivot < 9; pivot++) {
    let sel = pivot;
    while (sel < 9 && matrix[sel][pivot] === 0) sel++;
    if (sel === 9) continue;
    [matrix[pivot], matrix[sel]] = [matrix[sel], matrix[pivot]];

    for (let i = 0; i < 9; i++) {
      if (i !== pivot && matrix[i][pivot] === 1) {
        for (let k = pivot; k < 10; k++) matrix[i][k] ^= matrix[pivot][k];
      }
    }
  }
  return matrix.map(row => row[9]);
}