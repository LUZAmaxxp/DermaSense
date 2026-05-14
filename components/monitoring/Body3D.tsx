"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { HumanModel } from "./HumanModel";

interface Body3DProps {
  matrix: number[] | null;
}

function LoadingFallback() {
  return (
    <mesh position={[0, 0.85, 0]}>
      <boxGeometry args={[0.3, 1.7, 0.2]} />
      <meshStandardMaterial color="#334155" wireframe />
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
    <div className="relative w-full h-[480px] rounded-xl overflow-hidden bg-[#0f172a]">
      <Canvas
        camera={{ position: [0, 0.85, 3.2], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x0f172a, 1);
          scene.background = new THREE.Color(0x0f172a);
        }}
      >
        {/* Scene background */}
        <color attach="background" args={["#0f172a"]} />

        {/* Lighting — no external HDR downloads */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]}  intensity={1.4} />
        <directionalLight position={[-3, 3, -2]} intensity={0.5} color="#a5c8ff" />
        <directionalLight position={[0, -2, 3]}  intensity={0.2} color="#ffffff" />
        <pointLight       position={[0, 2, 2]}   intensity={0.4} />

        {/* Human model + pressure blobs */}
        <Suspense fallback={<LoadingFallback />}>
          <HumanModel matrix={matrix} />
        </Suspense>

        {/* Camera controls */}
        <OrbitControls
          target={[0, 0.85, 0]}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
          enablePan={false}
        />
      </Canvas>

      {/* Hint */}
      <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 pointer-events-none select-none">
        Cliquer-glisser pour tourner · Molette pour zoomer
      </div>
    </div>
  );
}

