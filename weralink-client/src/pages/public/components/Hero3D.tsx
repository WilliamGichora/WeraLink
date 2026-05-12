import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color="#EF626C"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0}
        metalness={1}
      />
    </Sphere>
  );
};

const ConnectingNodes = () => {
  const groupRef = useRef<THREE.Group>(null);
  const count = 40;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2}>
          <mesh position={[positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

export const Hero3D: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#EF626C" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4A90E2" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
          <AnimatedSphere />
        </Float>

        <ConnectingNodes />
      </Canvas>
    </div>
  );
};
