const N = 4;
let grid = [];
let score = 0;
let gameOver = false;

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
document.getElementById("restart").addEventListener("click", init);

function init() {
  grid = Array.from({ length: N }, () => Array(N).fill(0));
  score = 0;
  gameOver = false;
  statusEl.textContent = "";
  addRandomTile();
  addRandomTile();
  render();
}

function emptyCells() {
  const cells = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (grid[r][c] === 0) cells.push([r, c]);
  }
  return cells;
}

function addRandomTile() {
  const empties = emptyCells();
  if (empties.length === 0) return;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  boardEl.innerHTML = "";
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const v = grid[r][c];
    const cell = document.createElement("div");
    cell.className = `cell v${v}`;
    cell.textContent = v === 0 ? "" : String(v);
    if (v === 0) cell.classList.add("v0");
    boardEl.appendChild(cell);
  }
  scoreEl.textContent = String(score);

  const won = has2048();
  if (won) statusEl.textContent = "🎉 2048 atteint ! (tu peux continuer)";
  if (!gameOver && !canMove()) {
    gameOver = true;
    statusEl.textContent = "💀 Game Over — R pour restart";
  }
}

function has2048() {
  return grid.some(row => row.some(v => v === 2048));
}

function canMove() {
  if (emptyCells().length > 0) return true;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const v = grid[r][c];
    if (r + 1 < N && grid[r + 1][c] === v) return true;
    if (c + 1 < N && grid[r][c + 1] === v) return true;
  }
  return false;
}

function cloneGrid(g) {
  return g.map(row => row.slice());
}

function gridsEqual(a, b) {
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (a[r][c] !== b[r][c]) return false;
  }
  return true;
}

function slideAndMerge(line) {
  // remove zeros
  const arr = line.filter(v => v !== 0);
  // merge
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] !== 0 && arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr[i + 1] = 0;
      i++; // skip next
    }
  }
  // compact again
  const compact = arr.filter(v => v !== 0);
  while (compact.length < N) compact.push(0);
  return compact;
}

function moveLeft() {
  const before = cloneGrid(grid);
  for (let r = 0; r < N; r++) grid[r] = slideAndMerge(grid[r]);
  return !gridsEqual(before, grid);
}

function moveRight() {
  const before = cloneGrid(grid);
  for (let r = 0; r < N; r++) {
    const rev = [...grid[r]].reverse();
    const merged = slideAndMerge(rev).reverse();
    grid[r] = merged;
  }
  return !gridsEqual(before, grid);
}

function moveUp() {
  const before = cloneGrid(grid);
  for (let c = 0; c < N; c++) {
    const col = [];
    for (let r = 0; r < N; r++) col.push(grid[r][c]);
    const merged = slideAndMerge(col);
    for (let r = 0; r < N; r++) grid[r][c] = merged[r];
  }
  return !gridsEqual(before, grid);
}

function moveDown() {
  const before = cloneGrid(grid);
  for (let c = 0; c < N; c++) {
    const col = [];
    for (let r = 0; r < N; r++) col.push(grid[r][c]);
    const merged = slideAndMerge(col.reverse()).reverse();
    for (let r = 0; r < N; r++) grid[r][c] = merged[r];
  }
  return !gridsEqual(before, grid);
}

function doMove(kind) {
  if (gameOver) return;
  let moved = false;
  if (kind === "L") moved = moveLeft();
  if (kind === "R") moved = moveRight();
  if (kind === "U") moved = moveUp();
  if (kind === "D") moved = moveDown();

  if (moved) addRandomTile();
  render();
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") doMove("L");
  else if (e.key === "ArrowRight") doMove("R");
  else if (e.key === "ArrowUp") doMove("U");
  else if (e.key === "ArrowDown") doMove("D");
  else if (e.key.toLowerCase() === "r") init();
});

init();
