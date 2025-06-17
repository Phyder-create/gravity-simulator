import { Particle } from './Particle';

// previously was class and prop for particles, it is for overall how they interact 
export class PhysicsEngine {
  private particles: Particle[] = [];
  private G: number = 0.5;
  private dampingFactor: number = 1; //no damping by default, may add later
  
  constructor() {}

  //add a particle
  addParticle(particle: Particle): void {
    this.particles.push(particle);
  }

  //remove particle
  removeParticle(particle: Particle): void {
    const index = this.particles.indexOf(particle);
    if (index > -1) {
      this.particles.splice(index, 1);
    }
  }

  //clear all particles for clean slate
  clearParticles(): void {
    this.particles = [];
  }

  //get all particles
  getParticles(): Particle[] {
    return this.particles;
  }
  
  //Gravitational Constant declaration - setter
  setGravitationalConstant(g: number): void {
    this.G = g;
  }
  
  //Gravitational constant getter
  getGravitationalConstant(): number {
    return this.G;
  }
  
  //Gravitational force between two particles - Newtonian Dynamics
  private calculateGravitationalForce(p1: Particle, p2: Particle): { fx: number; fy: number } {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distanceSquared = dx * dx + dy * dy;
    
    const minDistance = (p1.radius + p2.radius) * 0.5;
    const distance = Math.max(Math.sqrt(distanceSquared), minDistance);
    
    // force calculation
    const force = (this.G * p1.mass * p2.mass) / (distance * distance);
    
    // Nnormalize direction vectors
    const fx = (force * dx) / distance;
    const fy = (force * dy) / distance;
    
    return { fx, fy };
  }
  
  update(): void {
    // Reset forces
    for (const particle of this.particles) {
      particle.vx *= this.dampingFactor;
      particle.vy *= this.dampingFactor;
    }
    
    // Calculate gravitational forces between all particle pairs
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        
        // Check for collision first
        if (p1.isCollidingWith(p2)) {
          p1.handleCollision(p2);
        } else {
          // Calculate and apply gravitational forces
          const { fx, fy } = this.calculateGravitationalForce(p1, p2);
          
          // Apply equal and opposite forces (Newton's 3rd law)
          p1.applyForce(fx, fy);
          p2.applyForce(-fx, -fy);
        }
      }
    }
    
    // Update particle positions and do for each particle
    for (const particle of this.particles) {
      particle.update();
    }
  }
  
  //draw all particles
  draw(p: any): void {
    for (const particle of this.particles) {
      particle.draw(p);
    }
  }
  
  //create a random particle at given position
  createRandomParticle(x: number, y: number, minMass: number = 1, maxMass: number = 5): Particle {
    const mass = minMass + Math.random() * (maxMass - minMass);
    const radius = 5 + mass * 3; // Radius proportional to mass
    return new Particle(x, y, mass, radius);
  }
  
  //keep window resize, maybe a little not necessary but was adviced to add this
  handleResize(width: number, height: number): void {
    // Keep particles within new bounds
    for (const particle of this.particles) {
      particle.x = Math.max(particle.radius, Math.min(width - particle.radius, particle.x));
      particle.y = Math.max(particle.radius, Math.min(height - particle.radius, particle.y));
    }
  }
}


//add later on for wall collision so that particle remain in canvas
// update(width: number, height: number): void {
//   this.x += this.vx;
//   this.y += this.vy;

//   // Bounce on X edges
//   if (this.x - this.radius < 0 || this.x + this.radius > width) {
//     this.vx *= -1;
//     this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
//   }

//   // Bounce on Y edges
//   if (this.y - this.radius < 0 || this.y + this.radius > height) {
//     this.vy *= -1;
//     this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
//   }
// }
