///partticle class and its property
export class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public mass: number;
  public radius: number;
  public color: string;
  
  constructor(x: number, y: number, mass: number, radius: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.mass = mass;
    this.radius = radius;
    this.color = this.generateColor();
  }
  
  //color generator
  private generateColor(): string {
    const hue = Math.max(0, Math.min(240, 240 - (this.mass - 1) * 60));
    return `hsl(${hue}, 70%, 50%)`;
  }
  
  //force calculation
  applyForce(fx: number, fy: number): void {
    const ax = fx / this.mass;
    const ay = fy / this.mass;
    this.vx += ax;
    this.vy += ay;
  }
  
  //update the position based on velocity
  update(): void {
    this.x += this.vx;
    this.y += this.vy;
  }
  

  //rendering of particle
  draw(p: any): void {
    p.fill(this.color);
    p.stroke(255);
    p.strokeWeight(1);
    p.ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
    
    // Add mass label for larger particles
    if (this.radius > 15) {
      p.fill(255);
      p.noStroke();
      p.text(this.mass.toFixed(1), this.x, this.y);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(10);
    }
  }

  //distance from the other particles
  distanceTo(other: Particle): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  //check if some point is inside a particle for future collisions detection
  contains(x: number, y: number): boolean {
    const dx = x - this.x;
    const dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }
  
  //check if there is a collision
  isCollidingWith(other: Particle): boolean {
    return this.distanceTo(other) <= (this.radius + other.radius);
  }

  //elastic collision calculations
  handleCollision(other: Particle): void {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // forbid division by zero
    if (distance === 0) return;
    
    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;
    
    // FIx position overlap, important !!, so that particles don't sink into each other
    const overlap = (this.radius + other.radius) - distance;
    const separationRatio = overlap / 2;
    
    this.x -= nx * separationRatio;
    this.y -= ny * separationRatio;
    other.x += nx * separationRatio;
    other.y += ny * separationRatio;
    
    //relative velocities
    const dvx = other.vx - this.vx;
    const dvy = other.vy - this.vy;
    
    // inner product of velocities
    const dvn = dvx * nx + dvy * ny;
    
    // Objects are moving away, so no collision needed
    if (dvn > 0) return;
    
    // Calculate collision impulse
    const totalMass = this.mass + other.mass;
    const impulse = (2 * dvn) / totalMass;
    
    // Apply impulse to velocities
    const impulsex = impulse * nx;
    const impulsey = impulse * ny;
    
    //change positon based on impulse  and opposite mass to conserve momentum
    this.vx += impulsex * other.mass;
    this.vy += impulsey * other.mass;
    other.vx -= impulsex * this.mass;
    other.vy -= impulsey * this.mass;
  }
}
