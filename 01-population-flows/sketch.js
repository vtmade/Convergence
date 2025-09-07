// Global variables without redeclaration
const state = {
  communityData: [],
  maxPop: 0,
  minPop: 0,
  maxArea: 0,
  minArea: 0,
  nodes: [],
  connections: [],
  spokesCount: 100,
  time: 0,
  animationSpeed: 0.002,
  centerX: 0,
  centerY: 0,
  scale: 1
};

function preload() {
  loadTable('Dubai2.csv', 'csv', 'header', (table) => {
    for (let row of table.rows) {
      state.communityData.push({
        code: row.get('Code'),
        population: parseInt(row.get('Population')),
        area: parseFloat(row.get('Area'))
      });
    }
    
    state.maxPop = Math.max(...state.communityData.map(d => d.population));
    state.minPop = Math.min(...state.communityData.map(d => d.population));
    state.maxArea = Math.max(...state.communityData.map(d => d.area));
    state.minArea = Math.min(...state.communityData.map(d => d.area));
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(10, 20, 30);
  colorMode(RGB, 255, 255, 255, 1);
  
  state.centerX = width / 2;
  state.centerY = height / 2;
  state.scale = min(width, height) / 1100;
  
  generateNodes();
  generateSpokes();
  generateConnections();
  
  loop();
}

function generateNodes() {
  // Create multiple layers of nodes for a broader ring
  let baseRadii = [250 * state.scale, 300 * state.scale, 350 * state.scale]; // Multiple base radii for broader distribution
  
  // Primary data nodes in multiple circular layers
  for (let i = 0; i < state.communityData.length; i++) {
    let baseRadius = random(baseRadii); // Randomly choose from different radii
    let angle = map(i, 0, state.communityData.length, 0, TWO_PI);
    
    // Add more random variation to make it more organic
    let radiusVariation = random(-50 * state.scale, 50 * state.scale);
    let angleVariation = random(-0.1, 0.1);
    
    let x = state.centerX + cos(angle + angleVariation) * (baseRadius + radiusVariation);
    let y = state.centerY + sin(angle + angleVariation) * (baseRadius + radiusVariation);
    
    let population = state.communityData[i].population;
    let area = state.communityData[i].area;
    let nodeSize = map(population, state.minPop, state.maxPop, 2 * state.scale, 8 * state.scale);
    
    // Determine color based on area with more variation
    let colorRatio = map(area, state.minArea, state.maxArea, 0, 1);
    colorRatio += random(-0.2, 0.2); // Add some color variation
    colorRatio = constrain(colorRatio, 0, 1);
    
    state.nodes.push({
      x: x,
      y: y,
      size: nodeSize,
      isData: true,
      color: {
        r: lerp(50, 255, colorRatio),
        b: lerp(255, 50, colorRatio),
        alpha: random(0.7, 0.9)
      },
      originalX: x,
      originalY: y,
      phase: random(TWO_PI)
    });
  }
  
  // Add more secondary nodes with broader distribution
  for (let i = 0; i < 300; i++) {
    let angle = random(TWO_PI);
    let radius = random(200 * state.scale, 500 * state.scale);
    
    // Add some clustering tendency
    if (random() < 0.7) {
      radius = random(230 * state.scale, 420 * state.scale);
    }
    
    let x = state.centerX + cos(angle) * radius;
    let y = state.centerY + sin(angle) * radius;
    
    state.nodes.push({
      x: x,
      y: y,
      size: random(0.5 * state.scale, 2 * state.scale),
      isData: false,
      color: {
        r: random(50, 150),
        b: random(150, 255),
        alpha: random(0.4, 0.7)
      },
      originalX: x,
      originalY: y,
      phase: random(TWO_PI)
    });
  }
}

function generateSpokes() {
  // Add varied radial spokes
  for (let i = 0; i < state.spokesCount; i++) {
    let angle = map(i, 0, state.spokesCount, 0, TWO_PI) + random(-0.02, 0.02);
    let innerRadius = random(180 * state.scale, 280 * state.scale);
    let outerRadius = random(380 * state.scale, 550 * state.scale);
    
    // Add some curved spokes for organic feel
    if (random() < 0.3) {
      state.connections.push({
        type: 'curved-spoke',
        x1: state.centerX + cos(angle) * innerRadius,
        y1: state.centerY + sin(angle) * innerRadius,
        x2: state.centerX + cos(angle) * outerRadius,
        y2: state.centerY + sin(angle) * outerRadius,
        ctrl: random(0.1, 0.3),
        color: {
          r: random(50, 200),
          b: random(150, 255),
          alpha: random(0.08, 0.2)
        },
        phase: random(TWO_PI)
      });
    } else {
      state.connections.push({
        type: 'spoke',
        x1: state.centerX + cos(angle) * innerRadius,
        y1: state.centerY + sin(angle) * innerRadius,
        x2: state.centerX + cos(angle) * outerRadius,
        y2: state.centerY + sin(angle) * outerRadius,
        color: {
          r: random(50, 200),
          b: random(150, 255),
          alpha: random(0.08, 0.2)
        },
        phase: random(TWO_PI)
      });
    }
  }
}

function generateConnections() {
  for (let i = 0; i < state.nodes.length; i++) {
    for (let j = i + 1; j < state.nodes.length; j++) {
      let d = dist(state.nodes[i].x, state.nodes[i].y, state.nodes[j].x, state.nodes[j].y);
      if (d < 180 * state.scale) {
        let colorMix = {
          r: (state.nodes[i].color.r + state.nodes[j].color.r) / 2,
          b: (state.nodes[i].color.b + state.nodes[j].color.b) / 2,
          alpha: random(0.03, 0.12)
        };
        
        state.connections.push({
          type: 'connection',
          from: i,
          to: j,
          weight: map(d, 0, 180 * state.scale, 1.2 * state.scale, 0.1 * state.scale),
          color: colorMix
        });
      }
    }
  }
}

function draw() {
  background(10, 20, 30, 0.05);
  
  state.time += state.animationSpeed;
  
  // Update node positions with slow motion
  state.nodes.forEach(node => {
    let drift = sin(state.time + node.phase) * 2;
    let driftY = cos(state.time * 0.7 + node.phase) * 1.5;
    node.x = node.originalX + drift;
    node.y = node.originalY + driftY;
  });
  
  // Draw spokes with more organic feel
  blendMode(ADD);
  state.connections.forEach(conn => {
    if (conn.type === 'spoke' || conn.type === 'curved-spoke') {
      stroke(conn.color.r, 0, conn.color.b, conn.color.alpha);
      let pulseAlpha = conn.color.alpha * (1 + sin(state.time * 2 + (conn.phase || 0)) * 0.3);
      stroke(conn.color.r, 0, conn.color.b, pulseAlpha);
      strokeWeight(random(0.3 * state.scale, 2 * state.scale));
      
      if (conn.type === 'curved-spoke') {
        let midX = (conn.x1 + conn.x2) / 2 + random(-20, 20);
        let midY = (conn.y1 + conn.y2) / 2 + random(-20, 20);
        noFill();
        beginShape();
        vertex(conn.x1, conn.y1);
        quadraticVertex(midX, midY, conn.x2, conn.y2);
        endShape();
      } else {
        line(conn.x1, conn.y1, conn.x2, conn.y2);
      }
    }
  });
  
  // Draw node connections
  state.connections.forEach(conn => {
    if (conn.type === 'connection') {
      let from = state.nodes[conn.from];
      let to = state.nodes[conn.to];
      
      stroke(conn.color.r, 0, conn.color.b, conn.color.alpha);
      let pulseWeight = conn.weight * (1 + sin(state.time + conn.from + conn.to) * 0.2);
      strokeWeight(pulseWeight);
      
      if (random() < 0.3) {
        let mid = createVector(
          (from.x + to.x) / 2 + random(-10, 10),
          (from.y + to.y) / 2 + random(-10, 10)
        );
        noFill();
        beginShape();
        vertex(from.x, from.y);
        quadraticVertex(mid.x, mid.y, to.x, to.y);
        endShape();
      } else {
        line(from.x, from.y, to.x, to.y);
      }
    }
  });
  
  // Draw nodes with subtle variation
  state.nodes.forEach(node => {
    noStroke();
    for (let i = 3; i > 0; i--) {
      let alpha = map(i, 0, 3, 0, node.color.alpha);
      fill(node.color.r, 0, node.color.b, alpha * 0.3);
      let sizeVar = random(0.9, 1.1);
      circle(node.x, node.y, node.size * i * 2 * sizeVar);
    }
    
    fill(node.color.r, 0, node.color.b, node.color.alpha);
    circle(node.x, node.y, node.size * random(0.9, 1.1));
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  state.centerX = width / 2;
  state.centerY = height / 2;
  state.scale = min(width, height) / 1100;
  
  state.nodes = [];
  state.connections = [];
  generateNodes();
  generateSpokes();
  generateConnections();
}