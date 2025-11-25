const IMAGES_COUNT = 36;
const IMAGES_PATH = 'images/';
let imgs = [];

function preload() {
  // Preload images
  for (let i = 1; i <= IMAGES_COUNT; i++) {
    const fn = String(i).padStart(2, '0') + '.png';
    imgs.push(loadImage(IMAGES_PATH + fn));
  }
}

function setup() {
  createCanvas(800, 800);
  noLoop();
  compose();
}

function mousePressed() {
  compose(); // Make a new composition on mouse click
}

function compose() {
  background(240);

  // Parameters for grid
  let cols = 8;
  let rows = 8;
  let cellW = width / cols;
  let cellH = height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Randomly pick image and cut size
      let img = random(imgs);

      // Instead of fitting image perfectly, draw a random crop
      let cropW = cellW * random(0.8, 1.4);
      let cropH = cellH * random(0.8, 1.4);
      let x = c * cellW + random(-cellW * 0.2, cellW * 0.2);
      let y = r * cellH + random(-cellH * 0.2, cellH * 0.2);

      // Source crop from image, randomize
      let sx = img.width * random(0.0, 0.5);
      let sy = img.height * random(0.0, 0.5);
      let sw = img.width * random(0.5, 1.0);
      let sh = img.height * random(0.5, 1.0);

      // Draw fragment on canvas
      image(img, x, y, cropW, cropH, sx, sy, sw, sh);

      // Optionally, skip some cells for the "cut away" look
      if (random() < 0.1) {
        fill(240);
        noStroke();
        rect(x, y, cropW, cropH);
      }
    }
  }
}