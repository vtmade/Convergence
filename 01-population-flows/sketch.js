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
  animationSpeed: 0.01,
  centerX: 0,
  centerY: 0,
  scale: 1,
  colorPalette: []
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
  background(8, 12, 18);
  colorMode(HSB, 360, 100, 100, 1);
  
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
  
  generateNodes();
  generateFlowingLines();
  generateParticles();
  
  loop();
}

function generateNodes() {
  state.nodes = [];
  
  // Create organic spiral distribution
  for (let i = 0; i < state.communityData.length; i++) {
    let spiralT = map(i, 0, state.communityData.length, 0, 6 * PI);
    let spiralRadius = map(i, 0, state.communityData.length, 100 * state.scale, 400 * state.scale);
    
    let x = state.centerX + cos(spiralT) * (spiralRadius + sin(spiralT * 2) * 50 * state.scale);
    let y = state.centerY + sin(spiralT) * (spiralRadius + cos(spiralT * 1.5) * 40 * state.scale);
    
    let population = state.communityData[i].population;
    let area = state.communityData[i].area;
    let nodeSize = map(population, state.minPop, state.maxPop, 3 * state.scale, 12 * state.scale);
    
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
      orbitRadius: random(5, 15) * state.scale,
      orbitSpeed: random(0.5, 2)
    });
  }
  
  // Add flowing secondary nodes
  for (let i = 0; i < 200; i++) {
    let angle = random(TWO_PI);
    let radius = random(150 * state.scale, 500 * state.scale);
    
    let x = state.centerX + cos(angle) * radius;
    let y = state.centerY + sin(angle) * radius;
    
    let colorIndex = floor(random(state.colorPalette.length));
    
    state.nodes.push({
      x: x,
      y: y,
      size: random(1 * state.scale, 4 * state.scale),
      isData: false,
      color: state.colorPalette[colorIndex],
      originalX: x,
      originalY: y,
      phase: random(TWO_PI),
      pulsePhase: random(TWO_PI),
      orbitRadius: random(3, 8) * state.scale,
      orbitSpeed: random(0.3, 1.5)
    });
  }
}

function generateFlowingLines() {
  state.flowingLines = [];
  
  // Create flowing radial lines
  for (let i = 0; i < 60; i++) {
    let angle = map(i, 0, 60, 0, TWO_PI);
    let innerR = 80 * state.scale;
    let outerR = 600 * state.scale;
    
    let colorIndex = floor(random(state.colorPalette.length));
    
    state.flowingLines.push({
      type: 'radial',
      angle: angle,
      innerRadius: innerR,
      outerRadius: outerR,
      color: state.colorPalette[colorIndex],
      phase: random(TWO_PI),
      flowSpeed: random(0.5, 2),
      waveLength: random(50, 150) * state.scale,
      amplitude: random(10, 30) * state.scale
    });
  }
  
  // Create spiral flowing lines
  for (let i = 0; i < 8; i++) {
    let colorIndex = floor(random(state.colorPalette.length));
    
    state.flowingLines.push({
      type: 'spiral',
      spiralTightness: random(0.1, 0.3),
      maxRadius: random(300, 500) * state.scale,
      color: state.colorPalette[colorIndex],
      phase: random(TWO_PI),
      flowSpeed: random(0.3, 1),
      rotationSpeed: random(-0.5, 0.5)
    });
  }
}

function generateParticles() {
  state.particles = [];
  
  for (let i = 0; i < 150; i++) {
    let angle = random(TWO_PI);
    let radius = random(100 * state.scale, 400 * state.scale);
    
    let colorIndex = floor(random(state.colorPalette.length));
    
    state.particles.push({
      x: state.centerX + cos(angle) * radius,
      y: state.centerY + sin(angle) * radius,
      vx: random(-0.5, 0.5),
      vy: random(-0.5, 0.5),
      life: 1.0,
      maxLife: random(200, 400),
      currentLife: random(50, 200),
      size: random(1, 3) * state.scale,
      color: state.colorPalette[colorIndex],
      trail: []
    });
  }
}

function draw() {
  background(8, 12, 18, 0.08);
  
  state.time += state.animationSpeed;
  
  // Update node positions with organic motion
  state.nodes.forEach(node => {
    let orbitX = cos(state.time * node.orbitSpeed + node.phase) * node.orbitRadius;
    let orbitY = sin(state.time * node.orbitSpeed + node.phase) * node.orbitRadius;
    
    let breathe = sin(state.time * 2 + node.pulsePhase) * 3;
    
    node.x = node.originalX + orbitX;
    node.y = node.originalY + orbitY + breathe;
  });
  
  // Draw flowing radial lines with wave motion
  blendMode(ADD);
  state.flowingLines.forEach(line => {
    if (line.type === 'radial') {
      let segments = 50;
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
        
        let alpha = map(t1, 0, 1, 0.6, 0.1) * (0.5 + sin(flowOffset + t1 * PI) * 0.5);
        
        stroke(line.color.h, line.color.s, line.color.b, alpha);
        strokeWeight(map(t1, 0, 1, 2 * state.scale, 0.5 * state.scale));
        line(x1, y1, x2, y2);
      }
    }
    
    if (line.type === 'spiral') {
      noFill();
      let segments = 100;
      let rotationOffset = state.time * line.rotationSpeed;
      
      beginShape();
      for (let i = 0; i < segments; i++) {
        let t = map(i, 0, segments - 1, 0, 1);
        let spiralAngle = t * 6 * PI + line.phase + rotationOffset;
        let radius = t * line.maxRadius;
        
        let flowWave = sin(state.time * line.flowSpeed + t * 8) * 20 * state.scale;
        
        let x = state.centerX + cos(spiralAngle) * (radius + flowWave);
        let y = state.centerY + sin(spiralAngle) * (radius + flowWave);
        
        let alpha = map(t, 0, 1, 0.7, 0.1) * (0.7 + sin(state.time + t * PI) * 0.3);
        stroke(line.color.h, line.color.s, line.color.b, alpha);
        strokeWeight(map(t, 0, 1, 1.5 * state.scale, 0.3 * state.scale));
        
        vertex(x, y);
      }
      endShape();
    }
  });
  
  // Draw dynamic connections between nearby nodes
  for (let i = 0; i < state.nodes.length; i++) {
    for (let j = i + 1; j < state.nodes.length; j++) {
      let d = dist(state.nodes[i].x, state.nodes[i].y, state.nodes[j].x, state.nodes[j].y);
      if (d < 120 * state.scale) {
        let alpha = map(d, 0, 120 * state.scale, 0.4, 0.05);
        alpha *= (0.5 + sin(state.time + i + j) * 0.5);
        
        // Blend colors
        let h = lerp(state.nodes[i].color.h, state.nodes[j].color.h, 0.5);
        let s = lerp(state.nodes[i].color.s, state.nodes[j].color.s, 0.5);
        let b = lerp(state.nodes[i].color.b, state.nodes[j].color.b, 0.5);
        
        stroke(h, s, b, alpha);
        strokeWeight(map(d, 0, 120 * state.scale, 1.5 * state.scale, 0.2 * state.scale));
        
        // Add curve to connections
        let midX = (state.nodes[i].x + state.nodes[j].x) / 2;
        let midY = (state.nodes[i].y + state.nodes[j].y) / 2;
        let curve = sin(state.time + i * 0.1) * 10;
        
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
      let radius = random(100 * state.scale, 400 * state.scale);
      particle.x = state.centerX + cos(angle) * radius;
      particle.y = state.centerY + sin(angle) * radius;
      particle.currentLife = particle.maxLife;
      particle.trail = [];
    }
    
    // Add to trail
    particle.trail.push({x: particle.x, y: particle.y});
    if (particle.trail.length > 8) {
      particle.trail.splice(0, 1);
    }
    
    // Move particle
    particle.x += particle.vx + sin(state.time + particle.x * 0.01) * 0.5;
    particle.y += particle.vy + cos(state.time + particle.y * 0.01) * 0.3;
    
    // Draw trail
    for (let i = 0; i < particle.trail.length - 1; i++) {
      let alpha = map(i, 0, particle.trail.length - 1, 0.1, 0.5);
      stroke(particle.color.h, particle.color.s, particle.color.b, alpha);
      strokeWeight(map(i, 0, particle.trail.length - 1, 0.5, 1.5) * state.scale);
      line(particle.trail[i].x, particle.trail[i].y, 
           particle.trail[i + 1].x, particle.trail[i + 1].y);
    }
  });
  
  // Draw nodes with halos
  blendMode(BLEND);
  state.nodes.forEach(node => {
    let pulseSize = 1 + sin(state.time * 3 + node.pulsePhase) * 0.3;
    
    // Draw halo
    for (let i = 3; i > 0; i--) {
      let alpha = map(i, 0, 3, 0, 0.4) * pulseSize;
      fill(node.color.h, node.color.s * 0.7, node.color.b, alpha);
      noStroke();
      circle(node.x, node.y, node.size * i * 2.5);
    }
    
    // Draw core
    fill(node.color.h, node.color.s, node.color.b, 0.9);
    circle(node.x, node.y, node.size * pulseSize);
    
    // Draw inner glow
    fill(node.color.h, node.color.s * 0.5, 100, 0.6);
    circle(node.x, node.y, node.size * 0.6 * pulseSize);
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