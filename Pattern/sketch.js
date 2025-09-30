const GRID = 5;
const CELL = 1080 / GRID;

function setup() {
  createCanvas(1080, 1080);
  noStroke();
  frameRate(2);
}

function draw() {
  background(255, 255, 220);
  const cz = random(10, CELL);
  const sz = random(10, CELL);

  for (let gy = 0; gy < GRID; gy++) {

    for (let gx = 0; gx < GRID; gx++) {
      const cx = gx * CELL + CELL / 2;
      const cy = gy * CELL + CELL / 2;

      push();
      blendMode(MULTIPLY);
      fill('blue');
      circle(cx, cy, cz);
      pop();

      push();
      fill('white');
      circle(cx, cy, random (cz));
      pop();

      push();
      blendMode(MULTIPLY);
      translate(cx, cy);
      fill('pink');
      rectMode(CENTER);
      rect(0, 0, sz, sz);
      pop();

push();
blendMode(MULTIPLY);
translate(cx, cy); // move origin to canvas center
rotate(random(TWO_PI));       // random rotation
const s = random(10, 40);   // side length
const h = (sqrt(4) / 2) * s;  // height of equilateral triangle
fill('LIGHTPINK');
triangle(-s/2, h/3, s/2, h/3, 0, -2*h/3);
pop();

    }
  }
}