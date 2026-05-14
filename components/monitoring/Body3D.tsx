"use client";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { HumanModel } from "./HumanModel";

interface Body3DProps {
  matrix: number[] | null;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.3, 1.7, 0.2]} />
      <meshStandardMaterial color="#e2e8f0" wireframe />
    </mesh>
  );
}

export function Body3D({ matrix }: Body3DProps) {
  if (!matrix || matrix.length === 0) {
    return (
      <div className="flex items-center justify-center h-[480px] text-gray-400 text-xs">
        En attente des capteurs…
      </div>
    );
  }

  return (
    <div className="w-full h-[480px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas
        camera={{ position: [0, 0.9, 2.8], fov: 45, near: 0.1, far: 100 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 3, -2]} intensity={0.4} color="#a5c8ff" />
        <pointLight position={[0, 2, 1]} intensity={0.3} color="#ffffff" />

        {/* Environment for nice reflections */}
        <Environment preset="city" />

        {/* Floor shadow */}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.35}
          scale={3}
          blur={2}
          far={1.5}
        />

        {/* Human model + pressure blobs */}
        <Suspense fallback={<LoadingFallback />}>
          <HumanModel matrix={matrix} />
        </Suspense>

        {/* Camera controls — drag to rotate, scroll to zoom, right-click to pan */}
        <OrbitControls
          target={[0, 0.85, 0]}
          minDistance={1.2}
          maxDistance={5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
          enablePan={false}
        />
      </Canvas>

      {/* Hint text */}
      <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 pointer-events-none select-none">
        Cliquer-glisser pour tourner · Molette pour zoomer
      </div>
    </div>
  );
}
