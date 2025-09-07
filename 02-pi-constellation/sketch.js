// Simple pi digits (first 1000 for testing)
const piDigits = '3141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930381964428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273724587006606315588174881520920962829254091715364367892590360011330530548820466521384146951941511609433057270365759591953092186117381932611793105118548074462379962749567351885752724891227938183011949129833673362440656643086021394946395224737190702179860943702770539217176293176752384674818467669405132000568127145263560827785771342757789609173637178721468440901224953430146549585371050792279689258923542019956112129021960864034418159813629774771309960518707211349999998372978049951059731732816096318595024459455346908302642522308253344685035261931188171010003137838752886587533208381420617177669147303598253490428755468731159562863882353787593751957781857780532171226806613001927876611195909216420198938367586366677661732155270044093732468611429755629169944442325123282133781255614331853056585013850864797120726484088004738085234325591070120640628932141070946038982440901503086074842637318486625279083980779928236508174000000000000000000';

let grid = [];
let colors = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20, 20, 25);
  
  // Define colors for digits 0-9
  colors = [
    color(255, 100, 100),  // 0 - Red
    color(255, 150, 50),   // 1 - Orange  
    color(255, 200, 0),    // 2 - Yellow
    color(100, 255, 100),  // 3 - Green
    color(0, 255, 150),    // 4 - Teal
    color(0, 150, 255),    // 5 - Blue
    color(100, 100, 255),  // 6 - Purple
    color(200, 50, 255),   // 7 - Violet
    color(255, 50, 150),   // 8 - Pink
    color(150, 255, 200)   // 9 - Mint
  ];
  
  drawPiVisualization();
  noLoop();
}

function drawPiVisualization() {
  let size = min(width, height) * 0.8;
  let gridSize = 32; // 32x32 = 1024 cells for 1000+ digits
  let cellSize = size / gridSize;
  let startX = (width - size) / 2;
  let startY = (height - size) / 2;
  
  // Draw title
  fill(200);
  textAlign(CENTER, TOP);
  textSize(24);
  text("Pi Constellation", width/2, 30);
  
  // Draw description
  textSize(14);
  fill(150);
  text("First 1000 digits of π - each digit colored and positioned in reading order", width/2, 60);
  
  // Draw pi digits as colored dots
  for (let i = 0; i < min(piDigits.length, gridSize * gridSize); i++) {
    let digit = parseInt(piDigits[i]);
    let x = i % gridSize;
    let y = floor(i / gridSize);
    
    let pixelX = startX + x * cellSize + cellSize/2;
    let pixelY = startY + y * cellSize + cellSize/2;
    
    // Draw dot
    fill(colors[digit]);
    noStroke();
    circle(pixelX, pixelY, cellSize * 0.6);
    
    // Draw connections to adjacent same digits
    if (i < piDigits.length - 1) {
      let nextDigit = parseInt(piDigits[i + 1]);
      if (digit === nextDigit) {
        let nextX = (i + 1) % gridSize;
        let nextY = floor((i + 1) / gridSize);
        let nextPixelX = startX + nextX * cellSize + cellSize/2;
        let nextPixelY = startY + nextY * cellSize + cellSize/2;
        
        stroke(colors[digit]);
        strokeWeight(2);
        line(pixelX, pixelY, nextPixelX, nextPixelY);
      }
    }
  }
  
  // Legend
  textAlign(LEFT, BOTTOM);
  textSize(12);
  fill(120);
  text("Connected dots show adjacent identical digits", 20, height - 40);
  text("Colors represent digits 0-9", 20, height - 25);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(20, 20, 25);
  drawPiVisualization();
}