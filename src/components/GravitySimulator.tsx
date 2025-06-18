import { useEffect, useRef } from 'react';
import { PhysicsEngine } from '../lib/physics/PhysicsEngine';
import { Particle } from '../lib/physics/Particle';

//main stuff for Simulator, uses Particle class and Physics Engine class

declare global {
  interface Window {
    p5: any;
  }
}

export default function GravitySimulator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const p5InstanceRef = useRef<any>(null);
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/p5.min.js';
    script.onload = () => {
      initializeSimulation();
    };
    document.head.appendChild(script);
    
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
      document.head.removeChild(script);
    };
  }, []);
  
  const initializeSimulation = () => {
    if (!containerRef.current || !window.p5) return;
    
    const physicsEngine = new PhysicsEngine();
    physicsEngineRef.current = physicsEngine;
    
    const sketch = (p: any) => {

      let instructionsText: any
      let helpText: any;
      let canvas: any;
      let controlsHeight = 80;

      let stars: { x: number; y: number }[] = []; //because stars are cool

      // UI state, initial values of different parameters
      let gravitationalConstant = 10;
      let minMass = 5;
      let maxMass = 10;
      let showTrails = true;
      
      // UI elements, sliders for parameters
      let gSlider: any;
      let minMassSlider: any;
      let maxMassSlider: any;
      let trailsCheckbox: any;
      let clearButton: any;
      
      p.setup = () => {
        canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(containerRef.current);
        
        // create UI controls
        setupUI();
        
        // Add some initial particles
        addInitialParticles();

        //stars 
        for (let i = 0; i < 1000; i++) { 
          stars.push({
            x: Math.random() * p.width,
            y: Math.random() * p.height
          });
        }

        //background
        p.background(10, 10, 20);
      };
      
      const setupUI = () => {
        const hudY = 10;
        const hudHeight = 60;
      
        // draw hud box 
        controlsHeight = hudHeight + 2 * hudY;
      
        // G slider
        gSlider = p.createSlider(0, 20, gravitationalConstant, 0.1);
        gSlider.parent(containerRef.current);
        gSlider.position(60, hudY + 25);
        gSlider.style('width', '120px');
      
        // Min mass
        minMassSlider = p.createSlider(0.5, 5, minMass, 0.1);
        minMassSlider.parent(containerRef.current);
        minMassSlider.position(220, hudY + 25);
        minMassSlider.style('width', '90px');
      
        // Max mass
        maxMassSlider = p.createSlider(1, 10, maxMass, 0.1);
        maxMassSlider.parent(containerRef.current);
        maxMassSlider.position(350, hudY + 25);
        maxMassSlider.style('width', '90px');
      
        // Clear all
        clearButton = p.createButton('Clear All');
        clearButton.parent(containerRef.current);
        clearButton.position(480, hudY + 20);
        clearButton.mousePressed(() => physicsEngine.clearParticles());
        clearButton.style('padding', '10px 20px');
        clearButton.style('font-size', '12px');
        clearButton.style('background-color', '#ff4444');
        clearButton.style('color', 'white');
        clearButton.style('border', 'none');
        clearButton.style('border-radius', '8px');
        clearButton.style('font-family', 'monospace');
        clearButton.style('font-weight', 'bold');
        clearButton.style('cursor', 'pointer');



        instructionsText = p.createP('> Click to create particles · Gravity attracts · Momentum is conserved · Increase gravitation to see proper trails');
        instructionsText.parent(containerRef.current);
        instructionsText.position(30, p.height - 40);
        instructionsText.style('color', '#0f0');
        instructionsText.style('font-family', 'monospace');
        instructionsText.style('font-size', '14px');
        instructionsText.style('text-shadow', '0 0 5px #0f0');


        helpText = p.createDiv(`
          <pre style="margin:0">
          <strong>Shortcuts:</strong><br/>
          [C] - Clear Particles<br/>
          [R] - Reset System<br/>
          [T] - Toggle Trails<br/>
          [Space] - Pause/Resume
          </pre>
        `);
        helpText.parent(containerRef.current);
        helpText.style('color', '#fff');
        helpText.style('font-family', 'monospace');
        helpText.style('font-size', '12px');
        helpText.style('background', 'transparent');
        helpText.style('padding', '8px 12px');
        helpText.style('border-radius', '8px');
        helpText.style('position', 'absolute');
        helpText.style('bottom', '10px');
        helpText.style('right', '20px');
        helpText.style('z-index', '10');
        
        

      };
      
      const addInitialParticles = () => {
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        const G = gravitationalConstant;
      
        // Small central body
        const centralMass = 50;
        const centralRadius = 10;
        const centralBody = new Particle(centerX, centerY, centralRadius, centralMass);
        physicsEngine.addParticle(centralBody);
      
        // Orbiting particles
        const numOrbiters = 5;
        for (let i = 0; i < numOrbiters; i++) {
          const angle = (i / numOrbiters) * p.TWO_PI;
          const distance = 100 + i * 30;
          const orbiterMass = 5 + Math.random() * 5;
          const orbiterRadius = 3;
      
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
      
          const particle = new Particle(x, y, orbiterRadius, orbiterMass);
      
          // Stable circular orbital speed
          const orbitalSpeed = Math.sqrt((G * centralMass) / distance);
          particle.vx = -Math.sin(angle) * orbitalSpeed;
          particle.vy = Math.cos(angle) * orbitalSpeed;
      
          physicsEngine.addParticle(particle);
        }
      };
      
      
      
      p.draw = () => {
        // Update UI values if changed
        const newG = gSlider.value();
        if (newG !== gravitationalConstant) {
          gravitationalConstant = newG;
          physicsEngine.setGravitationalConstant(gravitationalConstant);
        }
        
        minMass = minMassSlider.value();
        maxMass = Math.max(minMass + 0.1, maxMassSlider.value());

        // Draw stars
        p.noStroke();
        p.fill(255);
        for (const star of stars) {
          p.circle(star.x, star.y, 1.5);
        }
        
        // Clear background
        if (showTrails) {
          p.fill(10, 10, 20, 30);
          p.noStroke();
          p.rect(0, 0, p.width, p.height);
        } else {
          p.background(10, 10, 20);
        }
        
        // Update and draw 
        physicsEngine.update();
        physicsEngine.draw(p);
        
        // Draw UI overlay
        drawUI();
        
        // Draw performance info - fps stuff yk
        drawPerformanceInfo();
      };
      
      const drawUI = () => {
        p.push();
        p.noStroke();
        p.fill(0, 0, 0, 180);
        p.rect(10, 10, p.width - 20, controlsHeight, 12);
      
        // Draw labels
        p.fill(0, 255, 180);
        p.textFont('monospace');
        p.textSize(12);
        p.textAlign(p.LEFT);
      
        p.text(`G Constant: ${gravitationalConstant.toFixed(1)}`, 60, 22);
        p.text(`Min Mass: ${minMass.toFixed(1)}`, 220, 22);
        p.text(`Max Mass: ${maxMass.toFixed(1)}`, 350, 22);
        p.pop();

        p.textSize(16);
        p.fill(100, 255, 100);
        p.textFont('monospace');
        p.textAlign(p.LEFT);
        p.text('╔' + '═'.repeat(p.width / 10) + '╗', 10, 10);
        p.text('╚' + '═'.repeat(p.width / 10) + '╝', 10, controlsHeight);

      };
      
      
      const drawPerformanceInfo = () => {
        const particleCount = physicsEngine.getParticles().length;
        const fps = p.frameRate();
        
        p.fill(255, 255, 255, 180);
        p.textSize(12);
        p.text(`Particles: ${particleCount} | FPS: ${fps.toFixed(1)}`, p.width - 200, 25);
        
        if (particleCount > 50) {
          p.fill(255, 200, 0);
          p.text('Warning: High particle count may affect performance', p.width - 350, 45);
        }
      };
      
      p.mousePressed = () => {
        // Don't create particles if clicking on UI controls
        if (p.mouseY < controlsHeight) return;
        
        // Create new particle at mouse position
        const particle = physicsEngine.createRandomParticle(p.mouseX, p.mouseY, minMass, maxMass);
        physicsEngine.addParticle(particle);
        
        console.log(`Created particle at (${p.mouseX}, ${p.mouseY}) with mass ${particle.mass.toFixed(2)}`);
      };
      
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        physicsEngine.handleResize(p.windowWidth, p.windowHeight);
        
        if (instructionsText) {
          instructionsText.position(30, p.height - 40);
          instructionsText.style('max-width', (p.width - 40) + 'px');
        }

        if (helpText) {
          helpText.style('top', '10px');
          helpText.style('right', '20px');
        }
        
        
      };
      
      // Keyboard shortcuts
      p.keyPressed = () => {
        switch (p.key.toLowerCase()) {
          case 'c':
            physicsEngine.clearParticles();
            console.log('Cleared all particles');
            break;
          case 'r':
            physicsEngine.clearParticles();
            addInitialParticles();
            console.log('Reset simulation');
            break;
          case 't':
            showTrails = !showTrails;
            console.log(`Trails ${showTrails ? 'enabled' : 'disabled'}`);
            break;
          case ' ':
            if (p.isLooping()) {
              p.noLoop();
              console.log('Simulation paused');
            } else {
              p.loop();
              console.log('Simulation resumed');
            }
            break;
        }
      };
    };
    
    // Create p5 instance
    p5InstanceRef.current = new window.p5(sketch);
  };
  
  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        background: '#0a0a14',
        position: 'relative',
        top: 0,
        left: 0,
        zIndex: 1
      }}
    >
      <style>{`
        canvas {
          display: block;
          z-index = 0;
          position : absolute;
        }
        
        /*slider styling for better visibility */
        input[type="range"] {
          -webkit-appearance: none;
          background: rgba(255,255,255,0.4) !important;
          outline: none !important;
          border-radius: 8px !important;
          height: 8px !important;
          border: 1px solid rgba(255,255,255,0.6) !important;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00ff88 !important;
          cursor: pointer;
          border: 2px solid white !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00ff88 !important;
          cursor: pointer;
          border: 2px solid white !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
        }
        
        button:hover {
          background-color: #ff6666 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        }

        
      `}</style>
      
      {/* Loading indicator */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '18px',
        display: p5InstanceRef.current ? 'none' : 'block'
      }}>
        Loading Gravity Simulator...
      </div>
    </div>
  );
}
