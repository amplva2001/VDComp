let rainbow = ['#000000ff','#00289680','#0840d880','#a5c9ff80'];
let offsets = [-8, -4, -2, 0];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#000000ff');
  strokeWeight(30);
}

function draw() {
  if (mouseIsPressed) {
    // direction of motion
    let dx = mouseX - pmouseX;
    let dy = mouseY - pmouseY;
    // perpendicular unit vector (-dy, dx)
    let mag = sqrt(dx*dx + dy*dy);
    let px = 0, py = 0;
    if (mag > 0) {
      px = -dy / mag;
      py =  dx / mag;
    }

    // Number of steps based on distance
    let steps = int(mag / 2); // smaller divisor = more points
    for (let s = 0; s <= steps; s++) {
      let t = steps > 0 ? s / steps : 0;
      let ix = lerp(pmouseX, mouseX, t);
      let iy = lerp(pmouseY, mouseY, t);

      for (let i = 0; i < rainbow.length; i++) {
        stroke(rainbow[i]);
        let off = offsets[i];
        let x = ix + px * off;
        let y = iy + py * off;
        point(x, y);
      }
    }
  }
}