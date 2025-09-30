function setup() {
  createCanvas(600, 800);
  background(200);
  noStroke();
}

function draw() {

  // background(mouseX/2.35);

  // ears
  fill('black');
  circle(293,86,136);
  circle(191,188,136);

  //face
  fill('#F4E2C2');
  circle(341,230,170);

  //eyes
  fill('black');
  circle(366,205,44);
  circle(417,205,44);

  //nose
  circle(468,244,66); 

  //mouth
  fill('red');
  circle(334,315,54);  

  //body
  circle(384,443,194);    

  //buttons
  fill('black');
  circle(463,405,48);
  circle(413,424,48);

  //feet
  fill('yellow');
  circle(169,612,180);
  circle(423,679,180);
}