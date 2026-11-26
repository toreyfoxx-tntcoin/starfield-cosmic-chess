import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GameState, PieceType } from '../types/game';
import { starVertexShader, starFragmentShader, blackHoleVertexShader, blackHoleFragmentShader } from '../utils/shaders';
import { WarpTrail, CaptureExplosion } from '../utils/threeEffects';

interface ThreeBoardProps {
  gameState: GameState;
  onSquareClick: (position: { row: number; col: number }) => void;
  lowFxMode?: boolean;
}

export const ThreeBoard: React.FC<ThreeBoardProps> = ({ gameState, onSquareClick, lowFxMode = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pieceMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const effectsRef = useRef<CaptureExplosion[]>([]);
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    if (!lowFxMode) {
      const nebulaGeometry = new THREE.SphereGeometry(50, 32, 32);
      const nebulaMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a0a2e,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.3
      });
      const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
      scene.add(nebula);
    }

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 12, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: !lowFxMode });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0x4444ff, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isDark = (row + col) % 2 === 1;
        const geometry = new THREE.BoxGeometry(1, 0.2, 1);
        const material = new THREE.MeshStandardMaterial({
          color: isDark ? 0x1a1a2a : 0x2a2a4a,
          metalness: 0.5,
          roughness: 0.5,
          emissive: isDark ? 0x0a0a1a : 0x1a1a2a,
          emissiveIntensity: 0.2
        });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(col - 3.5, 0, row - 3.5);
        scene.add(square);
      }
    }

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      
      pieceMeshesRef.current.forEach(mesh => {
        if (mesh.material instanceof THREE.ShaderMaterial) {
          mesh.material.uniforms.time.value = elapsed;
        }
      });

      effectsRef.current = effectsRef.current.filter(effect => {
        const active = effect.update();
        if (!active) effect.dispose(scene);
        return active;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      controls.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [lowFxMode]);

  return <div ref={mountRef} className="w-full h-full" />;
};
