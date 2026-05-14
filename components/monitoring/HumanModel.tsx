"use client";
import { useRef, useState, useMemo } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";

// ─────────────────────────────────────────────────────────────────────────────
// Thermal colour scale: 0 mmHg → green, 40+ mmHg → deep red
// ─────────────────────────────────────────────────────────────────────────────
function pressureToColor(mmhg: number): string {
  if (mmhg <= 0)  return "#4ade80";   // green
  if (mmhg < 15)  return "#a3e635";   // lime
  if (mmhg < 25)  return "#facc15";   // yellow
  if (mmhg < 32)  return "#f97316";   // orange
  if (mmhg < 40)  return "#ef4444";   // red
  return "#7f1d1d";                   // deep red
}

function pressureToEmissive(mmhg: number): string {
  if (mmhg >= 40) return "#7f1d1d";
  if (mmhg >= 32) return "#ef4444";
  return "#000000";
}

function pressureToEmissiveIntensity(mmhg: number): number {
  if (mmhg >= 40) return 1.2;
  if (mmhg >= 32) return 0.6;
  return 0;
}

function pressureToScale(mmhg: number): number {
  // radius 0.04 → 0.14 based on pressure
  return THREE.MathUtils.clamp(0.04 + (mmhg / 300) * 0.10, 0.04, 0.14);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3-D sensor positions in NORMALIZED body space:
//   - feet at y = 0, top of head at y = 1.7  (model auto-scaled to this)
//   - x = 0 is the body's centre-line
//   - z > 0 = front surface (blobs sit on the front so they are always visible)
// Tweak these values here if a blob looks off on your specific GLB.
// ─────────────────────────────────────────────────────────────────────────────
const SENSOR_POSITIONS: { label: string; pos: [number, number, number] }[] = [
  // 0 – Épaule gauche
  { label: "Épaule gauche",  pos: [-0.20, 1.42,  0.14] },
  // 1 – Épaule droite
  { label: "Épaule droite",  pos: [ 0.20, 1.42,  0.14] },
  // 2 – Thorax gauche
  { label: "Thorax gauche",  pos: [-0.12, 1.15,  0.16] },
  // 3 – Thorax droit
  { label: "Thorax droit",   pos: [ 0.12, 1.15,  0.16] },
  // 4 – Sacrum gauche
  { label: "Sacrum gauche",  pos: [-0.08, 0.80,  0.14] },
  // 5 – Sacrum droit
  { label: "Sacrum droit",   pos: [ 0.08, 0.80,  0.14] },
  // 6 – Jambe gauche
  { label: "Jambe gauche",   pos: [-0.11, 0.44,  0.12] },
  // 7 – Jambe droite
  { label: "Jambe droite",   pos: [ 0.11, 0.44,  0.12] },
  // 8 – Talon gauche
  { label: "Talon gauche",   pos: [-0.10, 0.06,  0.08] },
  // 9 – Talon droit
  { label: "Talon droit",    pos: [ 0.10, 0.06,  0.08] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Single pressure blob
// ─────────────────────────────────────────────────────────────────────────────
interface BlobProps {
  position: [number, number, number];
  label: string;
  mmhg: number;
}

function PressureBlob({ position, label, mmhg }: BlobProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef  = useRef<THREE.MeshStandardMaterial>(null!);
  const [hovered, setHovered] = useState(false);

  const isCritical = mmhg >= 32;
  const baseScale  = pressureToScale(mmhg);

  // Pulse animation for critical blobs
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (isCritical) {
      const pulse = 1 + 0.18 * Math.sin(clock.getElapsedTime() * 4);
      meshRef.current.scale.setScalar(baseScale * pulse);
    } else {
      meshRef.current.scale.setScalar(baseScale);
    }
    if (matRef.current) {
      matRef.current.color.set(hovered ? "#ffffff" : pressureToColor(mmhg));
      matRef.current.emissive.set(pressureToEmissive(mmhg));
      matRef.current.emissiveIntensity = pressureToEmissiveIntensity(mmhg);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        ref={matRef}
        color={pressureToColor(mmhg)}
        emissive={pressureToEmissive(mmhg)}
        emissiveIntensity={pressureToEmissiveIntensity(mmhg)}
        transparent
        opacity={mmhg <= 0 ? 0.35 : 0.75}
        roughness={0.4}
        metalness={0.1}
        depthWrite={false}
      />
      {/* Tooltip */}
      {hovered && (
        <Html distanceFactor={4} center>
          <div
            style={{
              background: "rgba(10,10,20,0.88)",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 12,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              border: `1px solid ${pressureToColor(mmhg)}`,
              boxShadow: `0 0 8px ${pressureToColor(mmhg)}60`,
            }}
          >
            <div style={{ fontWeight: 700 }}>{label}</div>
            <div style={{ color: pressureToColor(mmhg), fontWeight: 600 }}>
              {Math.round(mmhg)} mmHg
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main: loads GLB + renders blobs
// ─────────────────────────────────────────────────────────────────────────────
interface HumanModelProps {
  matrix: number[];
}

type GLTFResult = GLTF & { nodes: Record<string, THREE.Object3D>; materials: Record<string, THREE.Material> };

export function HumanModel({ matrix }: HumanModelProps) {
  const { scene } = useGLTF("/models/human.glb") as GLTFResult;

  // ── Normalise the model regardless of original scale/offset ──────────────
  // Computes: scale so height = 1.7 units, position so feet land at y=0 and
  // the body is centred on x/z.  Runs once per loaded scene (cached by useGLTF).
  const { modelScale, modelPosition } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const s = size.y > 0 ? 1.7 / size.y : 1;
    return {
      modelScale: s,
      // group position (world-space), applied AFTER scale:
      //   a child point at raw [x,y,z] lands at world [x*s + px, y*s + py, z*s + pz]
      //   → we want feet (y = box.min.y) at world 0: py = -box.min.y * s
      //   → we want centre x/z at world 0: px = -center.x * s, pz = -center.z * s
      modelPosition: [
        -center.x * s,
        -box.min.y * s,
        -center.z * s,
      ] as [number, number, number],
    };
  }, [scene]);

  // ── Apply skin material (once per cached scene) ──────────────────────────
  useMemo(() => {
    scene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      mesh.castShadow    = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          mat.color.set("#c8a882");
          mat.roughness    = 0.85;
          mat.metalness    = 0.0;
          mat.needsUpdate  = true;
        }
      });
    });
  }, [scene]);

  return (
    <>
      {/* Normalised body mesh — scale + offset applied at group level */}
      <group scale={modelScale} position={modelPosition}>
        <primitive object={scene} />
      </group>

      {/* Pressure blobs — in WORLD space (same normalised coordinate system)
          Kept outside the scaled group so their size stays constant in world units */}
      {SENSOR_POSITIONS.map((s, i) => (
        <PressureBlob
          key={i}
          position={s.pos}
          label={s.label}
          mmhg={matrix[i] ?? 0}
        />
      ))}
    </>
  );
}

useGLTF.preload("/models/human.glb");
