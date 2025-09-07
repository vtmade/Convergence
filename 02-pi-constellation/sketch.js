function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255, 0, 0); // Bright red background
  
  // Draw a simple white circle to test if p5.js works
  fill(255);
  noStroke();
  circle(width/2, height/2, 100);
  
  // Add text
  fill(0);
  textAlign(CENTER);
  textSize(32);
  text("TEST - If you see this, p5.js works", width/2, height/2 - 100);
  
  noLoop();
}

function draw() {
  // Nothing here for now
}