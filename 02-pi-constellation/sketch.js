let piDigits = '';
let size;
let dotSize;
let digitColors = [];
let grid = [];
let scale = 1;

function preload() {
  loadStrings('pivalue.txt', function(result) {
    piDigits = result.join('').replace(/\s/g, '').substring(0, 10000);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Calculate responsive sizing
  scale = min(windowWidth, windowHeight) / 1000;
  size = min(windowWidth, windowHeight) * 0.85;
  let gridSize = ceil(sqrt(10000));
  dotSize = size / gridSize;
  
  // Predefined colors for digits 0-9
  digitColors = [
    [255, 95, 82],   // Vibrant Coral
    [255, 153, 51],  // Marigold Orange
    [222, 222, 4],   // Sunflower Yellow
    [96, 168, 50],   // Lime Green
    [76, 217, 143],  // Emerald Green
    [41, 191, 199],  // Turquoise
    [52, 139, 235],  // Azure Blue
    [101, 101, 255], // Royal Blue
    [169, 81, 237],  // Amethyst Purple
    [255, 87, 143]   // Hot Pink
  ];
  
  generateGrid();
}

function generateGrid() {
  let gridSize = ceil(sqrt(10000));
  let index = 0;
  grid = [];
  
  for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
      if (index < piDigits.length) {
        grid[y][x] = parseInt(piDigits[index]);
        index++;
      } else {
        grid[y][x] = -1;  // Use -1 to represent empty cells
      }
    }
  }
}

function draw() {
  background(18, 18, 20);
  
  // Center the visualization
  push();
  translate((windowWidth - size) / 2, (windowHeight - size) / 2);
  
  // Draw connections first (behind dots)
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      let digit = grid[y][x];
      if (digit !== -1 && digit >= 0 && digit < 10) {
        // Check and draw connections
        checkAndDrawConnection(x, y, x+1, y);    // Right
        checkAndDrawConnection(x, y, x, y+1);    // Down
        checkAndDrawConnection(x, y, x+1, y+1);  // Diagonal down-right
        checkAndDrawConnection(x, y, x-1, y+1);  // Diagonal down-left
      }
    }
  }
  
  // Draw dots on top of connections
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      let digit = grid[y][x];
      if (digit !== -1 && digit >= 0 && digit < 10) {
        fill(digitColors[digit][0], digitColors[digit][1], digitColors[digit][2]);
        noStroke();
        ellipse(x * dotSize + dotSize/2, y * dotSize + dotSize/2, dotSize * 0.4);
      }
    }
  }
  
  pop();
  
  // Add responsive text at bottom
  let textSizeResponsive = max(10, 12 * scale);
  let margin = max(20, 30 * scale);
  
  textAlign(LEFT, BOTTOM);
  textSize(textSizeResponsive);
  fill(89, 89, 105);
  text("π Constellation", margin, windowHeight - margin * 2);
  
  textSize(textSizeResponsive * 0.8);
  text("10,000 decimal places of π visualized as dots, reading from top-left to bottom-right.", margin, windowHeight - margin * 1.3);
  text("Connected dots indicate adjacent identical digits forming constellations in mathematical space.", margin, windowHeight - margin * 0.8);
  
  noLoop();
}

function checkAndDrawConnection(x1, y1, x2, y2) {
  if (x2 >= 0 && x2 < grid[0].length && y2 >= 0 && y2 < grid.length) {
    let digit1 = grid[y1][x1];
    let digit2 = grid[y2][x2];
    if (digit1 === digit2 && digit1 !== -1 && digit1 >= 0 && digit1 < 10) {
      stroke(digitColors[digit1][0], digitColors[digit1][1], digitColors[digit1][2], 180);
      strokeWeight(dotSize * 0.2);
      line(x1 * dotSize + dotSize/2, y1 * dotSize + dotSize/2,
           x2 * dotSize + dotSize/2, y2 * dotSize + dotSize/2);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Recalculate responsive sizing
  scale = min(windowWidth, windowHeight) / 1000;
  size = min(windowWidth, windowHeight) * 0.85;
  let gridSize = ceil(sqrt(10000));
  dotSize = size / gridSize;
  
  redraw();
}