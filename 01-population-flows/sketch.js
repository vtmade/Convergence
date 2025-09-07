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
  scale: 1,
  dataLoaded: false
};

function preload() {
  // Load the actual CSV data
  loadTable('Dubai2.csv', 'csv', 'header', (table) => {
    if (table && table.rows && table.rows.length > 0) {
      console.log(`Loading ${table.rows.length} community records`);
      
      for (let row of table.rows) {
        let code = row.get('Code');
        let pop = parseInt(row.get('Population'));
        let area = parseFloat(row.get('Area'));
        
        if (!isNaN(pop) && !isNaN(area) && code) {
          state.communityData.push({
            code: code,
            population: pop,
            area: area
          });
        }
      }
      
      if (state.communityData.length > 0) {
        calculateStats();
        state.dataLoaded = true;
        console.log(`Loaded ${state.communityData.length} communities`);
        console.log(`Population range: ${state.minPop} to ${state.maxPop}`);
        console.log(`Area range: ${state.minArea} to ${state.maxArea}`);
        
        // Redraw with real data
        if (typeof setup === 'function') {
          redraw();
        }
      }
    }
    
    if (!state.dataLoaded) {
      console.log('No valid data found, creating synthetic data');
      generateSyntheticData();
    }
  }, () => {
    console.log('CSV load failed, creating synthetic data');
    generateSyntheticData();
  });
}

function generateSyntheticData() {
  // Create realistic synthetic community data
  for (let i = 0; i < 50; i++) {
    let code = 100 + i;
    state.communityData.push({
      code: code.toString(),
      population: Math.floor(random(100, 55000)), // Based on real data range
      area: random(0.05, 100) // Based on real data range
    });
  }
  calculateStats();
  state.dataLoaded = true;
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
  state.scale = min(width, height) / 800; // 50% bigger
  
  background(15, 15, 15); // Dark background
  
  // Wait for data or use synthetic
  if (!state.dataLoaded && state.communityData.length === 0) {
    generateSyntheticData();
  }
  
  generateVisualization();
  noLoop(); // Static artwork
}

function generateVisualization() {
  state.nodes = [];
  state.connections = [];
  
  console.log(`Visualizing ${state.communityData.length} communities`);
  
  // Sort communities by population for better visual layering
  let sortedData = [...state.communityData].sort((a, b) => b.population - a.population);
  
  // Create nodes representing each community
  for (let i = 0; i < sortedData.length; i++) {
    let community = sortedData[i];
    
    // Position based on community code (spatial grouping)
    let codeNum = parseInt(community.code) || (100 + i);
    let codeAngle = map(codeNum % 100, 0, 99, 0, TWO_PI * 3); // Multiple spirals
    let codeRadius = map(Math.floor(codeNum / 100), 1, 10, 80, 300) * state.scale;
    
    // Add some variation for organic feel
    let angleOffset = map(i, 0, sortedData.length, 0, PI) + random(-0.3, 0.3);
    let radiusOffset = random(-30, 30) * state.scale;
    
    let x = state.centerX + cos(codeAngle + angleOffset) * (codeRadius + radiusOffset);
    let y = state.centerY + sin(codeAngle + angleOffset) * (codeRadius + radiusOffset);
    
    // Node size represents POPULATION (larger = more people)
    let nodeSize = map(community.population, state.minPop, state.maxPop, 4.5 * state.scale, 37.5 * state.scale);
    
    // Color intensity represents AREA (brighter = larger area)
    let areaRatio = map(community.area, state.minArea, state.maxArea, 0.2, 1.0);
    
    // Population density affects color hue
    let density = community.population / (community.area + 0.01); // Avoid division by zero
    let maxDensity = Math.max(...state.communityData.map(d => d.population / (d.area + 0.01)));
    let densityRatio = map(density, 0, maxDensity, 0, 1);
    
    state.nodes.push({
      x: x,
      y: y,
      size: nodeSize,
      community: community,
      areaIntensity: areaRatio,
      densityRatio: densityRatio,
      isMainCommunity: true
    });
  }
  
  // Create connections between communities with similar characteristics
  for (let i = 0; i < state.nodes.length; i++) {
    for (let j = i + 1; j < state.nodes.length; j++) {
      let nodeA = state.nodes[i];
      let nodeB = state.nodes[j];
      
      let distance = dist(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
      let maxConnectionDist = 150 * state.scale;
      
      if (distance < maxConnectionDist) {
        // Connection strength based on similarity in population density
        let densityDiff = abs(nodeA.densityRatio - nodeB.densityRatio);
        let similarity = 1 - densityDiff;
        
        if (similarity > 0.3) { // Only connect similar communities
          let alpha = map(distance, 0, maxConnectionDist, 0.6, 0.1) * similarity;
          let weight = map(distance, 0, maxConnectionDist, 1.5 * state.scale, 0.2 * state.scale);
          
          state.connections.push({
            from: i,
            to: j,
            alpha: alpha,
            weight: weight,
            similarity: similarity
          });
        }
      }
    }
  }
  
  drawVisualization();
}

function drawVisualization() {
  // Draw title and legend
  fill(200);
  textAlign(LEFT);
  textSize(16 * state.scale);
  text("Population Flows", 20, 30);
  
  textSize(12 * state.scale);
  fill(150);
  text("Node size = Population • Color intensity = Area • Connections = Similar density", 20, 50);
  
  // Draw connections between similar communities
  for (let connection of state.connections) {
    let nodeA = state.nodes[connection.from];
    let nodeB = state.nodes[connection.to];
    
    // Color based on average density of connected communities
    let avgDensity = (nodeA.densityRatio + nodeB.densityRatio) / 2;
    let r = map(avgDensity, 0, 1, 80, 255);
    let g = map(avgDensity, 0, 1, 120, 200);
    let b = map(avgDensity, 0, 1, 200, 100);
    
    stroke(r, g, b, connection.alpha * 255);
    strokeWeight(connection.weight);
    line(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
  }
  
  // Draw community nodes
  noStroke();
  for (let node of state.nodes) {
    let community = node.community;
    
    // Color based on population density
    let r = map(node.densityRatio, 0, 1, 100, 255);
    let g = map(node.densityRatio, 0, 1, 150, 220);
    let b = map(node.densityRatio, 0, 1, 255, 120);
    
    // Outer glow (represents area)
    let glowSize = node.size * (1 + node.areaIntensity);
    fill(r, g, b, node.areaIntensity * 60);
    circle(node.x, node.y, glowSize);
    
    // Main node (represents population)
    fill(r, g, b, 200);
    circle(node.x, node.y, node.size);
    
    // Inner core (high density communities get bright center)
    if (node.densityRatio > 0.7) {
      fill(255, 255, 255, 180);
      circle(node.x, node.y, node.size * 0.4);
    }
    
    // No text labels on nodes
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  state.centerX = width / 2;
  state.centerY = height / 2;
  state.scale = min(width, height) / 800; // 50% bigger
  
  background(15, 15, 15);
  generateVisualization();
}

function draw() {
  // Only redraw if data was loaded asynchronously
  if (state.dataLoaded && frameCount === 1) {
    background(15, 15, 15);
    generateVisualization();
    noLoop();
  }
}