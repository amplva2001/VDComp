let font;
let currentSample = 0.10;
let targetSample  = 0.10;
const SAMPLE_MIN  = 0.01
const SAMPLE_MAX  = 0.1;

function preload() {
  font = loadFont("karrik-Regular.woff"); // put the font next to your HTML
  fontImg = loadImage('vinyl2.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background('black');
  noFill();
  strokeWeight(1);
  stroke('black');

  const txt  = "PLATA";
  const size = 200;

  // lerp ease currentSample toward targetSample (smooth animation)
  currentSample = lerp(currentSample, targetSample, 0.10);

  const b = font.textBounds(txt, 0, 0, size);
  const x = width/2  - (b.w/2 + b.x);
  const y = height/2 + (b.h/2 - (b.y - b.y));

  const pts = font.textToPoints(txt, x, y, size, {
    sampleFactor: currentSample,
    simplifyThreshold: 0
    });

    for (const p of pts) image(fontImg, p.x, p.y, 30, 30);
  }

  function mousePressed() {
   // pick a new random target within your preferred range
   targetSample = random(SAMPLE_MIN, SAMPLE_MAX);
 }

 function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === 's') {
    saveGif('mySketch', 5);
  }
}