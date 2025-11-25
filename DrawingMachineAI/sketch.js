let rows = 20;
let cols = 30;
let cellSize;
let grid = [];

function setup() {
  createCanvas(windowWidth, 400); // 400 px tall, full window width
  cellSize = width / cols; // Dynamically calculated
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = false;
    }
  }
}

function draw() {
  background(51);
  stroke(0);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      fill(grid[r][c] ? 0 : 255);
      rect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
  }
}

function mousePressed() {
  let col = Math.floor(mouseX / cellSize);
  let row = Math.floor(mouseY / cellSize);
  if (col >= 0 && col < cols && row >= 0 && row < rows) {
    grid[row][col] = !grid[row][col];
  }
}

// Optional: Make canvas responsive
function windowResized() {
  resizeCanvas(windowWidth, 400);
  cellSize = width / cols;
}