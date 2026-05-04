/**
 * Sudoku puzzle generator using backtracking
 * Creates a solved grid, then removes cells based on difficulty
 */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function empty(grid) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (grid[r][c] === 0) return [r, c];
  return null;
}

function valid(grid, row, col, val) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === val) return false;
    if (grid[i][col] === val) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (grid[r][c] === val) return false;
  return true;
}

function solve(grid) {
  const pos = empty(grid);
  if (!pos) return true;
  const [row, col] = pos;
  for (const val of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (valid(grid, row, col, val)) {
      grid[row][col] = val;
      if (solve(grid)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

function makeSolved() {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(grid);
  return grid;
}

function copyGrid(grid) {
  return grid.map(row => [...row]);
}

const REMOVE_COUNT = { easy: [35, 40], medium: [45, 50], hard: [53, 57] };

export function generatePuzzle(difficulty = 'medium') {
  const solved = makeSolved();
  const puzzle = copyGrid(solved);
  const [minRm, maxRm] = REMOVE_COUNT[difficulty] ?? REMOVE_COUNT.medium;
  const toRemove = minRm + Math.floor(Math.random() * (maxRm - minRm + 1));
  const positions = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      positions.push([r, c]);
  const shuffled = shuffle(positions);
  for (let i = 0; i < toRemove && i < shuffled.length; i++) {
    const [r, c] = shuffled[i];
    puzzle[r][c] = 0;
  }
  return { puzzle, solved };
}

export function findConflicts(grid) {
  const conflicts = new Set();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (!val) continue;
      for (let i = 0; i < 9; i++) {
        if (i !== c && grid[r][i] === val) conflicts.add(`${r},${c}`);
        if (i !== r && grid[i][c] === val) conflicts.add(`${r},${c}`);
      }
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      for (let rr = br; rr < br + 3; rr++)
        for (let cc = bc; cc < bc + 3; cc++)
          if ((rr !== r || cc !== c) && grid[rr][cc] === val)
            conflicts.add(`${r},${c}`);
    }
  }
  return conflicts;
}

export function isComplete(grid) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (grid[r][c] === 0) return false;
  return findConflicts(grid).size === 0;
}
