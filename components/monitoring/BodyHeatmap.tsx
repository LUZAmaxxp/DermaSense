"use client";
import { mmHgToColor } from "@/lib/utils/pressure";

// 40 anatomical node positions in a 300×600 viewBox (supine body silhouette)
const NODE_POSITIONS: [number, number, string][] = [
  // shoulders (0-7)
  [80,95,"Épaules"],[100,90,"Épaules"],[120,86,"Épaules"],[140,84,"Épaules"],
  [160,84,"Épaules"],[180,86,"Épaules"],[200,90,"Épaules"],[220,95,"Épaules"],
  // thorax (8-14)
  [105,145,"Thorax"],[125,140,"Thorax"],[145,136,"Thorax"],[155,136,"Thorax"],
  [175,140,"Thorax"],[195,145,"Thorax"],[150,160,"Thorax"],
  // sacrum (15-25)
  [120,225,"Sacrum"],[135,220,"Sacrum"],[150,216,"Sacrum"],[165,220,"Sacrum"],[180,225,"Sacrum"],
  [130,240,"Sacrum"],[150,236,"Sacrum"],[170,240,"Sacrum"],
  [135,255,"Sacrum"],[150,252,"Sacrum"],[165,255,"Sacrum"],
  // legs (26-34)
  [120,295,"Jambes"],[150,290,"Jambes"],[180,295,"Jambes"],
  [115,335,"Jambes"],[145,330,"Jambes"],[175,335,"Jambes"],
  [110,375,"Jambes"],[150,370,"Jambes"],[190,375,"Jambes"],
  // heels (35-39)
  [115,440,"Talons"],[135,445,"Talons"],[150,442,"Talons"],[165,445,"Talons"],[185,440,"Talons"],
];

interface BodyHeatmapProps {
  matrix: number[] | null;
  onNodeClick?: (index: number, value: number) => void;
}

export function BodyHeatmap({ matrix, onNodeClick }: BodyHeatmapProps) {
  if (!matrix || matrix.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-xs">
        En attente des capteurs\u2026
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <svg
        viewBox="0 0 300 500"
        className="w-full max-w-[220px]"
        aria-label="Carte corporelle de pression"
      >
        {/* Head */}
        <ellipse cx="150" cy="46" rx="32" ry="36" fill="#e8edf4" stroke="#c8d0dc" strokeWidth="1.5" />
        {/* Neck */}
        <rect x="138" y="80" width="24" height="18" rx="4" fill="#e8edf4" stroke="#c8d0dc" strokeWidth="1" />
        {/* Torso */}
        <rect x="82" y="95" width="136" height="155" rx="14" fill="#e8edf4" stroke="#c8d0dc" strokeWidth="1.5" />
        {/* Arms */}
        <rect x="46" y="100" width="38" height="110" rx="12" fill="#e8edf4" stroke="#c8d0dc" strokeWidth="1" />
        <rect x="216" y="100" width="38" height="110" rx="12" fill="#e8edf4" stroke="#c8d0dc" strokeWidth="1" />
        {/* Pelvis */}
        <rect x="95" y="245" width="110" height="40" rx="8" fill="#e8edf4" stroke="#c8d0dc" strokeWidth="1.5" />
        {/* Left leg */}
        <rect x="90" y="280" width="55" height="160" rx="12" fill="#e8edf4" stroke="#c8d0dc" strokeWidth="1" />
        {/* Right leg */}
        <rect x="155" y="280" width="55" height="160" rx="12" fill="#e8edf4" stroke="#c8d0dc" strokeWidth="1" />
        {/* Left foot */}
        <ellipse cx="115" cy="455" rx="22" ry="12" fill="#e8edf4" stroke="#c8d0dc" strokeWidth="1" />
        {/* Right foot */}
        <ellipse cx="185" cy="455" rx="22" ry="12" fill="#e8edf4" stroke="#c8d0dc" strokeWidth="1" />

        {/* Sensor nodes */}
        {NODE_POSITIONS.map(([x, y, zone], i) => {
          const val = matrix[i] ?? 0;
          const color = mmHgToColor(val);
          return (
            <g key={i}>
              <title>{zone} — {Math.round(val)} mmHg</title>
              <circle
                cx={x}
                cy={y}
                r="7"
                fill={color}
                opacity="0.88"
                stroke="white"
                strokeWidth="1.5"
                style={{ transition: "fill 300ms ease", cursor: onNodeClick ? "pointer" : "default" }}
                onClick={() => onNodeClick?.(i, val)}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
