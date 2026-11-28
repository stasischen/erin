'use strict';

// 滿格方塊：把方塊放到 10x10 棋盤，湊滿一整排（橫）或一整列（直）就消除，斜的不算。
// 下面一次給 3 個方塊，放完再補 3 個；剩下的方塊全都放不下就結束（滿了就死了）。

const COLS = 10;
const ROWS = 10;
const BEST_KEY = 'erin-block-fill-best';
const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6'];

function norm(cells) {
  const mx = Math.min(...cells.map((c) => c[0]));
  const my = Math.min(...cells.map((c) => c[1]));
  return cells.map(([x, y]) => [x - mx, y - my]);
}
function variants(base) {
  const out = [];
  const seen = new Set();
  let c = norm(base);
  for (let i = 0; i < 4; i++) {
    const key = c.map(([x, y]) => x + ',' + y).sort().join('|');
    if (!seen.has(key)) { seen.add(key); out.push(c); }
    c = norm(c.map(([x, y]) => [-y, x]));
  }
  return out;
}
const BASE_SHAPES = [
  [[0, 0]],                                                        // 單格
  [[0, 0], [1, 0]],                                                // 2 連
  [[0, 0], [1, 0], [2, 0]],                                        // 3 連
  [[0, 0], [1, 0], [2, 0], [3, 0]],                                // 4 連
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],                        // 5 連
  [[0, 0], [1, 0], [0, 1], [1, 1]],                                // 2x2 方
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]], // 3x3 方
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],                // 2x3 長方
  [[0, 0], [0, 1], [1, 1]],                                        // 小 L（3 格）
  [[0, 0], [0, 1], [0, 2], [1, 2]],                                // L（4 格）
  [[0, 0], [1, 0], [2, 0], [1, 1]],                                // T
  [[1, 0], [2, 0], [0, 1], [1, 1]],                                // S
];
const POOL = [];
BASE_SHAPES.forEach((base, bi) => {
  variants(base).forEach((cells) => {
    POOL.push({
      cells,
      w: Math.max(...cells.map((c) => c[0])) + 1,
      h: Math.max(...cells.map((c) => c[1])) + 1,
      color: COLORS[bi % COLORS.length],
    });
  });
});

const boardEl = document.getElementById('board');
const trayEl = document.getElementById('tray');
const floatEl = document.getElementById('floatPiece');
const overlayEl = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const overlayBest = document.getElementById('overlayBest');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const linesEl = document.getElementById('lines');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

let grid = [];
let tray = [];
let score = 0;
let lines = 0;
let best = Number(localStorage.getItem(BEST_KEY) || 0);
let playing = false;
let selected = -1; // 點選模式選中的 tray 位置
let drag = null;   // { idx, pointerId, moved }

const cellEls = [];
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    const d = document.createElement('div');
    d.className = 'cell';
    boardEl.appendChild(d);
    cellEls.push(d);
  }
}

function randomPiece() {
  const p = POOL[Math.floor(Math.random() * POOL.length)];
  return { cells: p.cells, w: p.w, h: p.h, color: p.color, used: false };
}
function newTray() {
  tray = [randomPiece(), randomPiece(), randomPiece()];
  selected = -1;
  renderTray();
}
function canPlace(piece, ax, ay) {
  return piece.cells.every(([cx, cy]) => {
    const x = ax + cx, y = ay + cy;
    return x >= 0 && x < COLS && y >= 0 && y < ROWS && grid[y][x] === 0;
  });
}
function fitsAnywhere(piece) {
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (canPlace(piece, x, y)) return true;
  return false;
}
function placePiece(idx, ax, ay) {
  const piece = tray[idx];
  piece.cells.forEach(([cx, cy]) => { grid[ay + cy][ax + cx] = piece.color; });
  piece.used = true;
  score += piece.cells.length;

  // 同時檢查橫排與直列（斜的不算）
  const fullRows = [], fullCols = [];
  for (let y = 0; y < ROWS; y++) if (grid[y].every((v) => v !== 0)) fullRows.push(y);
  for (let x = 0; x < COLS; x++) if (grid.every((row) => row[x] !== 0)) fullCols.push(x);
  const n = fullRows.length + fullCols.length;
  if (n > 0) {
    fullRows.forEach((y) => { for (let x = 0; x < COLS; x++) grid[y][x] = 0; });
    fullCols.forEach((x) => { for (let y = 0; y < ROWS; y++) grid[y][x] = 0; });
    lines += n;
    score += 10 * n + 5 * n * (n - 1); // 一次消越多條，獎勵越高
  }

  if (score > best) { best = score; localStorage.setItem(BEST_KEY, String(best)); }
  selected = -1;
  if (tray.every((p) => p.used)) newTray(); else renderTray();
  render();
  checkGameOver();
}
function checkGameOver() {
  if (!playing) return;
  const alive = tray.some((p) => !p.used && fitsAnywhere(p));
  if (!alive) {
    playing = false;
    overlayTitle.textContent = '滿了，就死了！';
    overlayText.textContent = '棋盤放不下了，這局得分 ' + score + ' 分，消除 ' + lines + ' 條。';
    overlayBest.textContent = best;
    overlayEl.classList.remove('hidden');
    renderTray();
  }
}
function render() {
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const el = cellEls[y * COLS + x];
      const v = grid[y][x];
      el.style.background = v ? v : '';
      el.className = 'cell' + (v ? ' filled' : '');
    }
  scoreEl.textContent = score;
  bestEl.textContent = best;
  linesEl.textContent = lines;
}
function renderTray() {
  trayEl.innerHTML = '';
  tray.forEach((piece, idx) => {
    const slot = document.createElement('div');
    slot.className = 'tray-slot' + (idx === selected ? ' selected' : '') + (!playing || piece.used ? ' dim' : '');
    if (!piece.used) {
      const mini = document.createElement('div');
      mini.className = 'mini';
      mini.style.gridTemplateColumns = 'repeat(' + piece.w + ', 18px)';
      piece.cells.forEach(() => {});
      const filled = new Set(piece.cells.map(([x, y]) => x + ',' + y));
      for (let y = 0; y < piece.h; y++)
        for (let x = 0; x < piece.w; x++) {
          const c = document.createElement('div');
          c.className = 'mini-cell';
          if (filled.has(x + ',' + y)) { c.style.background = piece.color; c.classList.add('on'); }
          mini.appendChild(c);
        }
      slot.appendChild(mini);
      if (playing && !fitsAnywhere(piece)) slot.classList.add('stuck');
      slot.addEventListener('pointerdown', (e) => onPieceDown(e, idx));
    }
    trayEl.appendChild(slot);
  });
}
function showGhost(piece, ax, ay) {
  clearGhost();
  if (ax === null) return;
  const ok = canPlace(piece, ax, ay);
  piece.cells.forEach(([cx, cy]) => {
    const x = ax + cx, y = ay + cy;
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
    const el = cellEls[y * COLS + x];
    el.classList.add(ok ? 'ghost-ok' : 'ghost-bad');
    if (ok) el.style.background = piece.color;
  });
}
function clearGhost() {
  cellEls.forEach((el) => {
    el.classList.remove('ghost-ok', 'ghost-bad');
  });
  render();
}
function anchorFromPoint(piece, clientX, clientY, lift) {
  const rect = boardEl.getBoundingClientRect();
  const cell = rect.width / COLS;
  const ax = Math.round((clientX - rect.left) / cell - piece.w / 2);
  const ay = Math.round((clientY - lift - rect.top) / cell - piece.h / 2);
  return [ax, ay];
}
function drawFloat(piece, clientX, clientY, lift) {
  const rect = boardEl.getBoundingClientRect();
  const cell = rect.width / COLS;
  floatEl.innerHTML = '';
  floatEl.style.gridTemplateColumns = 'repeat(' + piece.w + ', ' + cell + 'px)';
  const filled = new Set(piece.cells.map(([x, y]) => x + ',' + y));
  for (let y = 0; y < piece.h; y++)
    for (let x = 0; x < piece.w; x++) {
      const c = document.createElement('div');
      c.className = 'float-cell';
      c.style.width = cell + 'px'; c.style.height = cell + 'px';
      if (filled.has(x + ',' + y)) { c.style.background = piece.color; c.classList.add('on'); }
      floatEl.appendChild(c);
    }
  floatEl.hidden = false;
  floatEl.style.left = (clientX - (piece.w * cell) / 2) + 'px';
  floatEl.style.top = (clientY - lift - piece.h * cell) + 'px';
}
const LIFT = 64;
function onPieceDown(e, idx) {
  if (!playing || tray[idx].used) return;
  e.preventDefault();
  drag = { idx, moved: false };
  const piece = tray[idx];
  drawFloat(piece, e.clientX, e.clientY, LIFT);
  const move = (ev) => {
    if (!drag) return;
    drag.moved = true;
    drawFloat(piece, ev.clientX, ev.clientY, LIFT);
    const [ax, ay] = anchorFromPoint(piece, ev.clientX, ev.clientY, LIFT);
    const rect = boardEl.getBoundingClientRect();
    if (ev.clientX >= rect.left - 30 && ev.clientX <= rect.right + 30 && ev.clientY >= rect.top - 90 && ev.clientY <= rect.bottom + 30) {
      showGhost(piece, ax, ay);
      drag.anchor = [ax, ay];
    } else {
      clearGhost();
      drag.anchor = null;
    }
  };
  const up = (ev) => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    floatEl.hidden = true;
    clearGhost();
    if (!drag) return;
    const wasDrag = drag.moved && drag.anchor;
    const anchor = drag.anchor;
    const dragIdx = drag.idx;
    drag = null;
    if (wasDrag && canPlace(piece, anchor[0], anchor[1])) {
      placePiece(dragIdx, anchor[0], anchor[1]);
    } else if (!wasDrag) {
      // 點一下：選取，再點棋盤放下
      selected = selected === dragIdx ? -1 : dragIdx;
      renderTray();
    }
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
}
boardEl.addEventListener('pointerdown', (e) => {
  if (!playing || selected < 0 || drag) return;
  const piece = tray[selected];
  if (!piece || piece.used) return;
  const [ax, ay] = anchorFromPoint(piece, e.clientX, e.clientY, 0);
  if (canPlace(piece, ax, ay)) placePiece(selected, ax, ay);
});
function startGame() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  score = 0;
  lines = 0;
  playing = true;
  overlayEl.classList.add('hidden');
  newTray();
  render();
}
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
overlayBest.textContent = best;
bestEl.textContent = best;
render();
