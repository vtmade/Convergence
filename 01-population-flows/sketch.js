// Global variables without redeclaration
const state = {
  communityData: [],
  maxPop: 0,
  minPop: 0,
  maxArea: 0,
  minArea: 0,
  nodes: [],
  connections: [],
  flowingLines: [],
  particles: [],
  spokesCount: 80,
  time: 0,
  animationSpeed: 0.008,
  centerX: 0,
  centerY: 0,
  scale: 1,
  colorPalette: [],
  dataLoaded: false
};

function preload() {
  // Try to load CSV, but don't fail if it doesn't exist
  try {
    loadTable('Dubai2.csv', 'csv', 'header', (table) => {
      if (table && table.rows && table.rows.length > 0) {
        for (let row of table.rows) {
          let pop = parseInt(row.get('Population'));
          let area = parseFloat(row.get('Area'));
          if (!isNaN(pop) && !isNaN(area)) {
            state.communityData.push({
              code: row.get('Code'),
              population: pop,
              area: area
            });
          }
        }
        
        if (state.communityData.length > 0) {
          state.maxPop = Math.max(...state.communityData.map(d => d.population));
          state.minPop = Math.min(...state.communityData.map(d => d.population));
          state.maxArea = Math.max(...state.communityData.map(d => d.area));
          state.minArea = Math.min(...state.communityData.map(d => d.area));
          state.dataLoaded = true;
        }
      }
    }, () => {
      // If CSV fails to load, create synthetic data
      console.log('CSV not found, generating synthetic data');
      generateSyntheticData();
    });
  } catch(e) {
    console.log('Error loading CSV, generating synthetic data');
    generateSyntheticData();
  }
}

function generateSyntheticData() {
  // Create synthetic community data if CSV doesn't load
  for (let i = 0; i < 50; i++) {
    state.communityData.push({
      code: `C${i}`,
      population: Math.floor(random(1000, 50000)),
      area: random(10, 500)
    });
  }
  
  state.maxPop = Math.max(...state.communityData.map(d => d.population));
  state.minPop = Math.min(...state.communityData.map(d => d.population));
  state.maxArea = Math.max(...state.communityData.map(d => d.area));
  state.minArea = Math.min(...state.communityData.map(d => d.area));
  state.dataLoaded = true;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  
  state.centerX = width / 2;
  state.centerY = height / 2;
  state.scale = min(width, height) / 1100;
  
  // Create smooth color palette
  state.colorPalette = [
    {h: 200, s: 80, b: 90}, // Cyan
    {h: 280, s: 70, b: 85}, // Purple
    {h: 320, s: 75, b: 80}, // Pink
    {h: 180, s: 65, b: 85}, // Teal
    {h: 240, s: 80, b: 90}, // Blue
    {h: 300, s: 70, b: 75}, // Magenta
  ];
  
  // If data isn't loaded yet, generate synthetic data
  if (state.communityData.length === 0) {
    generateSyntheticData();
  }
  
  colorMode(HSB, 360, 100, 100, 1);
  background(8, 12, 18);
  
  generateNodes();
  generateFlowingLines();
  generateParticles();
  
  loop();
}

function generateNodes() {
  state.nodes = [];
  
  // Ensure we have data
  if (state.communityData.length === 0) {
    generateSyntheticData();
  }
  
  // Create organic spiral distribution
  for (let i = 0; i < state.communityData.length; i++) {
    let spiralT = map(i, 0, state.communityData.length, 0, 4 * PI);
    let spiralRadius = map(i, 0, state.communityData.length, 80 * state.scale, 350 * state.scale);
    
    let x = state.centerX + cos(spiralT) * (spiralRadius + sin(spiralT * 2) * 30 * state.scale);
    let y = state.centerY + sin(spiralT) * (spiralRadius + cos(spiralT * 1.5) * 25 * state.scale);
    
    let population = state.communityData[i].population;
    let area = state.communityData[i].area;
    let nodeSize = map(population, state.minPop, state.maxPop, 2 * state.scale, 8 * state.scale);
    
    let colorIndex = floor(map(area, state.minArea, state.maxArea, 0, state.colorPalette.length));
    colorIndex = constrain(colorIndex, 0, state.colorPalette.length - 1);
    
    state.nodes.push({
      x: x,
      y: y,
      size: nodeSize,
      isData: true,
      color: state.colorPalette[colorIndex],
      originalX: x,
      originalY: y,
      phase: random(TWO_PI),
      pulsePhase: random(TWO_PI),
      orbitRadius: random(3, 10) * state.scale,
      orbitSpeed: random(0.3, 1.5)
    });
  }
  
  // Add flowing secondary nodes
  for (let i = 0; i < 120; i++) {
    let angle = random(TWO_PI);
    let radius = random(100 * state.scale, 400 * state.scale);
    
    let x = state.centerX + cos(angle) * radius;
    let y = state.centerY + sin(angle) * radius;
    
    let colorIndex = floor(random(state.colorPalette.length));
    
    state.nodes.push({
      x: x,
      y: y,
      size: random(1 * state.scale, 3 * state.scale),
      isData: false,
      color: state.colorPalette[colorIndex],
      originalX: x,
      originalY: y,
      phase: random(TWO_PI),
      pulsePhase: random(TWO_PI),
      orbitRadius: random(2, 6) * state.scale,
      orbitSpeed: random(0.2, 1.2)
    });
  }
}

function generateFlowingLines() {
  state.flowingLines = [];
  
  // Create flowing radial lines
  for (let i = 0; i < 48; i++) {
    let angle = map(i, 0, 48, 0, TWO_PI);
    let innerR = 60 * state.scale;
    let outerR = 450 * state.scale;
    
    let colorIndex = floor(random(state.colorPalette.length));
    
    state.flowingLines.push({
      type: 'radial',
      angle: angle,
      innerRadius: innerR,
      outerRadius: outerR,
      color: state.colorPalette[colorIndex],
      phase: random(TWO_PI),
      flowSpeed: random(0.3, 1.5),
      waveLength: random(40, 120) * state.scale,
      amplitude: random(8, 25) * state.scale
    });
  }
  
  // Create spiral flowing lines
  for (let i = 0; i < 6; i++) {
    let colorIndex = floor(random(state.colorPalette.length));
    
    state.flowingLines.push({
      type: 'spiral',
      spiralTightness: random(0.1, 0.25),
      maxRadius: random(250, 400) * state.scale,
      color: state.colorPalette[colorIndex],
      phase: random(TWO_PI),
      flowSpeed: random(0.2, 0.8),
      rotationSpeed: random(-0.3, 0.3)
    });
  }
}

function generateParticles() {
  state.particles = [];
  
  for (let i = 0; i < 80; i++) {
    let angle = random(TWO_PI);
    let radius = random(80 * state.scale, 350 * state.scale);
    
    let colorIndex = floor(random(state.colorPalette.length));
    
    state.particles.push({
      x: state.centerX + cos(angle) * radius,
      y: state.centerY + sin(angle) * radius,
      vx: random(-0.3, 0.3),
      vy: random(-0.3, 0.3),
      life: 1.0,
      maxLife: random(150, 300),
      currentLife: random(30, 150),
      size: random(0.8, 2.5) * state.scale,
      color: state.colorPalette[colorIndex],
      trail: []
    });
  }
}

function draw() {
  background(8, 12, 18, 0.1);
  
  state.time += state.animationSpeed;
  
  // Update node positions with organic motion
  state.nodes.forEach(node => {
    let orbitX = cos(state.time * node.orbitSpeed + node.phase) * node.orbitRadius;
    let orbitY = sin(state.time * node.orbitSpeed + node.phase) * node.orbitRadius;
    
    let breathe = sin(state.time * 1.5 + node.pulsePhase) * 2;
    
    node.x = node.originalX + orbitX;
    node.y = node.originalY + orbitY + breathe;
  });
  
  // Draw flowing radial lines with wave motion
  blendMode(ADD);
  state.flowingLines.forEach(line => {
    if (line.type === 'radial') {
      let segments = 40;
      let flowOffset = state.time * line.flowSpeed + line.phase;
      
      for (let i = 0; i < segments - 1; i++) {
        let t1 = map(i, 0, segments - 1, 0, 1);
        let t2 = map(i + 1, 0, segments - 1, 0, 1);
        
        let r1 = lerp(line.innerRadius, line.outerRadius, t1);
        let r2 = lerp(line.innerRadius, line.outerRadius, t2);
        
        // Add wave motion
        let wave1 = sin(t1 * line.waveLength + flowOffset) * line.amplitude;
        let wave2 = sin(t2 * line.waveLength + flowOffset) * line.amplitude;
        
        let x1 = state.centerX + cos(line.angle) * (r1 + wave1);
        let y1 = state.centerY + sin(line.angle) * (r1 + wave1);
        let x2 = state.centerX + cos(line.angle) * (r2 + wave2);
        let y2 = state.centerY + sin(line.angle) * (r2 + wave2);
        
        let alpha = map(t1, 0, 1, 0.5, 0.08) * (0.6 + sin(flowOffset + t1 * PI) * 0.4);
        
        stroke(line.color.h, line.color.s, line.color.b, alpha);
        strokeWeight(map(t1, 0, 1, 1.8 * state.scale, 0.3 * state.scale));
        line(x1, y1, x2, y2);
      }
    }
    
    if (line.type === 'spiral') {
      noFill();
      let segments = 80;
      let rotationOffset = state.time * line.rotationSpeed;
      
      beginShape();
      for (let i = 0; i < segments; i++) {
        let t = map(i, 0, segments - 1, 0, 1);
        let spiralAngle = t * 5 * PI + line.phase + rotationOffset;
        let radius = t * line.maxRadius;
        
        let flowWave = sin(state.time * line.flowSpeed + t * 6) * 15 * state.scale;
        
        let x = state.centerX + cos(spiralAngle) * (radius + flowWave);
        let y = state.centerY + sin(spiralAngle) * (radius + flowWave);
        
        let alpha = map(t, 0, 1, 0.6, 0.08) * (0.6 + sin(state.time + t * PI) * 0.4);
        stroke(line.color.h, line.color.s, line.color.b, alpha);
        strokeWeight(map(t, 0, 1, 1.2 * state.scale, 0.2 * state.scale));
        
        vertex(x, y);
      }
      endShape();
    }
  });
  
  // Draw dynamic connections between nearby nodes
  for (let i = 0; i < state.nodes.length; i++) {
    for (let j = i + 1; j < state.nodes.length; j++) {
      let d = dist(state.nodes[i].x, state.nodes[i].y, state.nodes[j].x, state.nodes[j].y);
      if (d < 100 * state.scale) {
        let alpha = map(d, 0, 100 * state.scale, 0.3, 0.03);
        alpha *= (0.4 + sin(state.time + i + j) * 0.4);
        
        // Blend colors
        let h = lerp(state.nodes[i].color.h, state.nodes[j].color.h, 0.5);
        let s = lerp(state.nodes[i].color.s, state.nodes[j].color.s, 0.5);
        let b = lerp(state.nodes[i].color.b, state.nodes[j].color.b, 0.5);
        
        stroke(h, s, b, alpha);
        strokeWeight(map(d, 0, 100 * state.scale, 1.2 * state.scale, 0.15 * state.scale));
        
        // Add curve to connections
        let midX = (state.nodes[i].x + state.nodes[j].x) / 2;
        let midY = (state.nodes[i].y + state.nodes[j].y) / 2;
        let curve = sin(state.time + i * 0.1) * 8;
        
        noFill();
        beginShape();
        vertex(state.nodes[i].x, state.nodes[i].y);
        quadraticVertex(midX + curve, midY + curve, state.nodes[j].x, state.nodes[j].y);
        endShape();
      }
    }
  }
  
  // Update and draw particles with trails
  state.particles.forEach(particle => {
    particle.currentLife--;
    if (particle.currentLife <= 0) {
      // Respawn particle
      let angle = random(TWO_PI);
      let radius = random(80 * state.scale, 350 * state.scale);
      particle.x = state.centerX + cos(angle) * radius;
      particle.y = state.centerY + sin(angle) * radius;
      particle.currentLife = particle.maxLife;
      particle.trail = [];
    }
    
    // Add to trail
    particle.trail.push({x: particle.x, y: particle.y});
    if (particle.trail.length > 6) {
      particle.trail.splice(0, 1);
    }
    
    // Move particle
    particle.x += particle.vx + sin(state.time + particle.x * 0.008) * 0.4;
    particle.y += particle.vy + cos(state.time + particle.y * 0.008) * 0.25;
    
    // Draw trail
    for (let i = 0; i < particle.trail.length - 1; i++) {
      let alpha = map(i, 0, particle.trail.length - 1, 0.08, 0.4);
      stroke(particle.color.h, particle.color.s, particle.color.b, alpha);
      strokeWeight(map(i, 0, particle.trail.length - 1, 0.3, 1.2) * state.scale);
      line(particle.trail[i].x, particle.trail[i].y, 
           particle.trail[i + 1].x, particle.trail[i + 1].y);
    }
  });
  
  // Draw nodes with halos
  blendMode(BLEND);
  state.nodes.forEach(node => {
    let pulseSize = 1 + sin(state.time * 2.5 + node.pulsePhase) * 0.25;
    
    // Draw halo
    for (let i = 3; i > 0; i--) {
      let alpha = map(i, 0, 3, 0, 0.35) * pulseSize;
      fill(node.color.h, node.color.s * 0.7, node.color.b, alpha);
      noStroke();
      circle(node.x, node.y, node.size * i * 2.2);
    }
    
    // Draw core
    fill(node.color.h, node.color.s, node.color.b, 0.85);
    circle(node.x, node.y, node.size * pulseSize);
    
    // Draw inner glow
    fill(node.color.h, node.color.s * 0.4, 100, 0.5);
    circle(node.x, node.y, node.size * 0.5 * pulseSize);
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  state.centerX = width / 2;
  state.centerY = height / 2;
  state.scale = min(width, height) / 1100;
  
  state.nodes = [];
  state.flowingLines = [];
  state.particles = [];
  generateNodes();
  generateFlowingLines();
  generateParticles();
}