// Stellar shaders for Three.js pieces

export const starVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const starFragmentShader = `
  uniform float time;
  uniform vec3 color;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    float pulse = sin(time * 2.0) * 0.3 + 0.7;
    vec3 glow = color * pulse;
    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(glow + fresnel * color, 1.0);
  }
`;

export const blackHoleVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const blackHoleFragmentShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    float lensing = 1.0 / (dist * 10.0 + 1.0);
    vec3 accretion = vec3(0.8, 0.3, 0.1) * lensing;
    float rotation = atan(vUv.y - 0.5, vUv.x - 0.5) + time;
    float spiral = sin(rotation * 5.0 - dist * 20.0) * 0.5 + 0.5;
    gl_FragColor = vec4(accretion * spiral, 1.0);
  }
`;
