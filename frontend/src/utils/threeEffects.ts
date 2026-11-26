import * as THREE from 'three';

export class WarpTrail {
  particles: THREE.Points;
  
  constructor(scene: THREE.Scene, from: THREE.Vector3, to: THREE.Vector3) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    for (let i = 0; i < 50; i++) {
      const t = i / 50;
      positions.push(
        THREE.MathUtils.lerp(from.x, to.x, t),
        THREE.MathUtils.lerp(from.y, to.y, t),
        THREE.MathUtils.lerp(from.z, to.z, t)
      );
      colors.push(0.5, 0.7, 1.0);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    this.particles = new THREE.Points(geometry, material);
    scene.add(this.particles);
  }
  
  dispose(scene: THREE.Scene) {
    scene.remove(this.particles);
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
  }
}

export class CaptureExplosion {
  particles: THREE.Points;
  startTime: number;
  
  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    this.startTime = Date.now();
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    
    for (let i = 0; i < 100; i++) {
      positions.push(position.x, position.y, position.z);
      velocities.push(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xff6600,
      transparent: true,
      opacity: 1.0
    });
    
    this.particles = new THREE.Points(geometry, material);
    scene.add(this.particles);
  }
  
  update(): boolean {
    const elapsed = (Date.now() - this.startTime) / 1000;
    if (elapsed > 1.0) return false;
    
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const velocities = this.particles.geometry.attributes.velocity.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
    (this.particles.material as THREE.PointsMaterial).opacity = 1.0 - elapsed;
    
    return true;
  }
  
  dispose(scene: THREE.Scene) {
    scene.remove(this.particles);
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
  }
}
