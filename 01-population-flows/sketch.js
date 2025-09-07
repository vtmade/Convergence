// Global variables
const state = {
  communityData: [],
  maxPop: 0,
  minPop: 0,
  maxArea: 0,
  minArea: 0,
  nodes: [],
  connections: [],
  centerX: 0,
  centerY: 0,
  scale: 1
};

function preload() {
  // Try to load CSV, create synthetic data if it fails
  try {
    loadTable('Dubai2.csv', 'csv', 'header', (table) => {
      if (table && table.rows && table.rows.length > 0) {
        for (let row of table.rows) {
          let pop = parseInt(row.get('Population'));
          let area = parseFloat(row.get('Area'));
          if (!isNaN(pop) && !isNaN(area)) {
            state.communityData.push({
              population: pop,
              area: area
            });
          }
        }
      }
      if (state.communityData.length === 0) {
        generateSyntheticData();
      }
      calculateStats();
    }, () => {
      generateSyntheticData();
      calculateStats();
    });
  } catch(e) {
    generateSyntheticData();
    calculateStats();
  }
}

function generateSyntheticData() {
  for (let i = 0; i < 60; i++) {
    state.communityData.push({
      population: Math.floor(random(1000, 50000)),
      area: random(10, 500)
    });
  }
}

function calculateStats() {
  if (state.communityData.length > 0) {
    state.maxPop = Math.max(...state.communityData.map(d => d.population));
    state.minPop = Math.min(...state.communityData.map(d => d.population));
    state.maxArea = Math.max(...state.communityData.map(d => d.area));
    state.minArea = Math.min(...state.communityData.map(d => d.area));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  state.centerX = width / 2;
  state.centerY = height / 2;
  state.scale = min(width, height) / 1000;
  
  // Ensure we have data
  if (state.communityData.length === 0) {
    generateSyntheticData();
    calculateStats();
  }
  
  background(25, 25, 25);
  
  generateNodes();
  generateConnections();
  drawArtwork();
  
  noLoop(); // Static artwork, no animation
}

function generateNodes() {
  state.nodes = [];
  
  // Create spiral distribution of main nodes
  for (let i = 0; i < state.communityData.length; i++) {
    let angle = map(i, 0, state.communityData.length, 0, 8 * PI);
    let radius = map(i, 0, state.communityData.length, 50 * state.scale, 400 * state.scale);
    
    let x = state.centerX + cos(angle) * radius;
    let y = state.centerY + sin(angle) * radius;
    
    let population = state.communityData[i].population;
    let area = state.communityData[i].area;
    
    let nodeSize = map(population, state.minPop, state.maxPop, 2 * state.scale, 12 * state.scale);
    let colorIntensity = map(area, state.minArea, state.maxArea, 0.3, 1.0);
    
    state.nodes.push({
      x: x,
      y: y,
      size: nodeSize,
      intensity: colorIntensity,
      isMain: true
    });
  }
  
  // Add secondary nodes
  for (let i = 0; i < 100; i++) {
    let angle = random(TWO_PI);
    let radius = random(80 * state.scale, 350 * state.scale);
    
    let x = state.centerX + cos(angle) * radius;
    let y = state.centerY + sin(angle) * radius;
    
    state.nodes.push({
      x: x,
      y: y,
      size: random(1 * state.scale, 4 * state.scale),
      intensity: random(0.2, 0.6),
      isMain: false
    });
  }
}

function generateConnections() {
  state.connections = [];
  
  // Create connections between nearby nodes
  for (let i = 0; i < state.nodes.length; i++) {
    for (let j = i + 1; j < state.nodes.length; j++) {
      let d = dist(state.nodes[i].x, state.nodes[i].y, state.nodes[j].x, state.nodes[j].y);
      
      if (d < 120 * state.scale) {
        let alpha = map(d, 0, 120 * state.scale, 0.6, 0.1);
        let weight = map(d, 0, 120 * state.scale, 2 * state.scale, 0.3 * state.scale);
        
        state.connections.push({
          from: i,
          to: j,
          alpha: alpha,
          weight: weight
        });
      }
    }
  }
  
  // Create radial lines
  for (let i = 0; i < 72; i++) {
    let angle = map(i, 0, 72, 0, TWO_PI);
    let innerRadius = 40 * state.scale;
    let outerRadius = 450 * state.scale;
    
    state.connections.push({
      type: 'radial',
      angle: angle,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      alpha: random(0.1, 0.4)
    });
  }
}

function drawArtwork() {
  // Draw radial lines
  stroke(100, 150, 200, 60);
  for (let connection of state.connections) {
    if (connection.type === 'radial') {
      strokeWeight(0.5 * state.scale);
      stroke(100, 150, 200, connection.alpha * 255);
      
      let x1 = state.centerX + cos(connection.angle) * connection.innerRadius;
      let y1 = state.centerY + sin(connection.angle) * connection.innerRadius;
      let x2 = state.centerX + cos(connection.angle) * connection.outerRadius;
      let y2 = state.centerY + sin(connection.angle) * connection.outerRadius;
      
      line(x1, y1, x2, y2);
    }
  }
  
  // Draw node connections
  for (let connection of state.connections) {
    if (!connection.type) {
      let nodeA = state.nodes[connection.from];
      let nodeB = state.nodes[connection.to];
      
      stroke(150, 200, 255, connection.alpha * 255);
      strokeWeight(connection.weight);
      line(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
    }
  }
  
  // Draw nodes
  noStroke();
  for (let node of state.nodes) {
    if (node.isMain) {
      // Main nodes - larger with glow
      fill(200, 220, 255, node.intensity * 255);
      circle(node.x, node.y, node.size);
      
      // Inner glow
      fill(255, 255, 255, node.intensity * 150);
      circle(node.x, node.y, node.size * 0.6);
    } else {
      // Secondary nodes
      fill(150, 180, 220, node.intensity * 200);
      circle(node.x, node.y, node.size);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  state.centerX = width / 2;
  state.centerY = height / 2;
  state.scale = min(width, height) / 1000;
  
  state.nodes = [];
  state.connections = [];
  
  background(25, 25, 25);
  generateNodes();
  generateConnections();
  drawArtwork();
}