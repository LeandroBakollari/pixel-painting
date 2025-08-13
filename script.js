// ======= elements =======
const board = document.getElementById('board');
const colorPicker = document.getElementById('colorPicker');
const sizeSlider = document.getElementById('sizeSlider');
const sizeLabel = document.getElementById('sizeLabel');
const paintBtn = document.getElementById('paintBtn');
const eraserBtn = document.getElementById('eraserBtn');
const rainbowBtn = document.getElementById('rainbowBtn');
const gridBtn = document.getElementById('gridBtn');
const clearBtn = document.getElementById('clearBtn');

// ======= state =======
let gridSize = parseInt(sizeSlider.value, 10);
let isDrawing = false;
let mode = 'paint'; // 'paint' | 'erase'
let rainbow = false;
let showGrid = true;

// ======= helpers =======
const setCSSVar = (name, value) => document.documentElement.style.setProperty(name, value);

function updateSizeLabel() {
  sizeLabel.textContent = `${gridSize} × ${gridSize}`;
}

function randomColor() {
  // HSL for smooth rainbow; convert to CSS color string
  const h = Math.floor(Math.random() * 360);
  const s = 90;
  const l = 55;
  return `hsl(${h} ${s}% ${l}%)`;
}

function applyToCell(cell, isPrimary) {
  if (!cell || !cell.classList.contains('pixel')) return;
  if (mode === 'erase' || (!isPrimary && event && event.buttons === 2)) {
    cell.style.background = '#ffffffff';
    return;
    }
  const color = rainbow ? randomColor() : colorPicker.value;
  cell.style.background = color;
}

function setActive(btn, active) {
  btn.classList.toggle('active', active);
  btn.setAttribute('aria-pressed', String(active));
}

function rebuildGrid() {
  board.innerHTML = '';
  setCSSVar('--grid-size', gridSize);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.className = 'pixel' + (showGrid ? ' grid' : '');
    frag.appendChild(cell);
  }
  board.appendChild(frag);
}

// ======= init =======
updateSizeLabel();
rebuildGrid();

// Prevent context menu (we use right-click as temporary eraser)
board.addEventListener('contextmenu', e => e.preventDefault());

// Mouse interactions
board.addEventListener('pointerdown', (e) => {
  if (!(e.target instanceof HTMLElement)) return;
  isDrawing = true;
  board.setPointerCapture(e.pointerId);
  applyToCell(e.target, true);
});

board.addEventListener('pointermove', (e) => {
  if (!isDrawing) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  applyToCell(el, false);
});

board.addEventListener('pointerup', (e) => {
  isDrawing = false;
  try { board.releasePointerCapture(e.pointerId); } catch {}
});

board.addEventListener('pointerleave', () => { isDrawing = false; });

// Controls
sizeSlider.addEventListener('input', () => {
  gridSize = parseInt(sizeSlider.value, 10);
  updateSizeLabel();
  rebuildGrid();
});

paintBtn.addEventListener('click', () => {
  mode = 'paint';
  setActive(paintBtn, true);
  setActive(eraserBtn, false);
});

eraserBtn.addEventListener('click', () => {
  mode = 'erase';
  setActive(paintBtn, false);
  setActive(eraserBtn, true);
});

rainbowBtn.addEventListener('click', () => {
  rainbow = !rainbow;
  setActive(rainbowBtn, rainbow);
});

gridBtn.addEventListener('click', () => {
  showGrid = !showGrid;
  setActive(gridBtn, showGrid);
  // toggle outlines on existing cells
  board.querySelectorAll('.pixel').forEach(cell => {
    cell.classList.toggle('grid', showGrid);
  });
});

clearBtn.addEventListener('click', () => {
  board.querySelectorAll('.pixel').forEach(cell => {
    cell.style.background = '#ffffffff';
  });
});

// Keyboard quickies
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'e') eraserBtn.click();
  if (e.key.toLowerCase() === 'p') paintBtn.click();
  if (e.key.toLowerCase() === 'g') gridBtn.click();
  if (e.key.toLowerCase() === 'r') rainbowBtn.click();
  if (e.key.toLowerCase() === 'c') clearBtn.click();
});
