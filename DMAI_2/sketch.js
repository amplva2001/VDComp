const IMAGES_COUNT = 36;
const IMAGES_PATH = 'images/';
let imgs = [];

function preload() {
  // Preload images
  for (let i = 1; i <= IMAGES_COUNT; i++) {
    const fn = String(i).padStart(2, '0') + '.png';
    imgs.push(loadImage(IMAGES_PATH + fn,
      () => console.log("Loaded " + fn),
      () => console.error("Failed to load " + fn)
    ));
  }
}

function setup() {
  createCanvas(800, 800);
  compose();

  // Add a button to regenerate the collage
  let btn = createButton("New Collage");
  btn.position(10, 10);
  btn.mousePressed(compose);
}

function compose() {
  background(240);

  let fragments = 80;             // How many pieces per canvas (try 100+ for even denser)
  let minSize = 60, maxSize = 220; // Min/max size for collage fragments

  for (let i = 0; i < fragments; i++) {
    let img = random(imgs);

    // Random destination on canvas
    let x = random(width);
    let y = random(height);
    let w = random(minSize, maxSize);
    let h = random(minSize, maxSize);

    // Source crop from image, for "cut" and "zoom"
    let cropFactorW = random(0.3, 0.9);
    let cropFactorH = random(0.3, 0.9);
    let sw = img.width * cropFactorW;
    let sh = img.height * cropFactorH;
    let sx = random(0, img.width - sw);
    let sy = random(0, img.height - sh);

    // Draw cropped/zoomed part, possibly stretching
    image(img, x, y, w, h, sx, sy, sw, sh);
  }
}

// Optional: You can keep mousePressed for another way to regenerate
function mousePressed() {
  compose();
}