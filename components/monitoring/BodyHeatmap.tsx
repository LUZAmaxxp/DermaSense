"use client";
import { mmHgToColor } from "@/lib/utils/pressure";
import { getSensorLabel } from "@/lib/utils/pressure";

/**
 * 10 FSR sensor positions in a 300×500 viewBox (supine body silhouette).
 * Layout: 2 sensors per zone, left/right of body center-line.
 * [cx, cy, label]
 */
const SENSOR_POSITIONS: [number, number, string][] = [
  // shoulders (0–1)
  [110, 100, "Épaule gauche"],
  [190, 100, "Épaule droite"],
  // thorax (2–3)
  [120, 160, "Thorax gauche"],
  [180, 160, "Thorax droit"],
  // sacrum (4–5)
  [130, 240, "Sacrum gauche"],
  [170, 240, "Sacrum droit"],
  // legs (6–7)
  [115, 330, "Jambe gauche"],
  [185, 330, "Jambe droite"],
  // heels (8–9)
  [115, 440, "Talon gauche"],
  [185, 440, "Talon droit"],
];

interface BodyHeatmapProps {
  matrix: number[] | null;
  onNodeClick?: (index: number, value: number) => void;
}

export function BodyHeatmap({ matrix, onNodeClick }: BodyHeatmapProps) {
  if (!matrix || matrix.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-xs">
        En attente des capteurs…
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

        {/* Sensor dots — 10 FSR sensors (2 per zone) */}
        {SENSOR_POSITIONS.map(([x, y, label], i) => {
          const val = matrix[i] ?? 0;
          const color = mmHgToColor(val);
          return (
            <g key={i}>
              <title>{label} (#{i} · {getSensorLabel(i)}) — {Math.round(val)} mmHg</title>
              {/* Outer glow ring for critical sensors */}
              {val >= 32 && (
                <circle cx={x} cy={y} r="13" fill={color} opacity="0.25" />
              )}
              <circle
                cx={x}
                cy={y}
                r="9"
                fill={color}
                opacity="0.92"
                stroke="white"
                strokeWidth="2"
                style={{ transition: "fill 300ms ease", cursor: onNodeClick ? "pointer" : "default" }}
                onClick={() => onNodeClick?.(i, val)}
              />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="7" fill="white" fontWeight="700" style={{ pointerEvents: "none" }}>
                {Math.round(val)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
