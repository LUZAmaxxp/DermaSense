import type { PressureLevel, ZoneName, ZoneStats } from "@/types/sensor.types";

// ─── Clinical pressure thresholds (mmHg) ─────────────────────────────────────
// 🟢 P < 30       → Normal
// 🟠 30 ≤ P < 32  → Prévention / surveillance
// 🔴 P ≥ 32       → Repositionnement obligatoire
// 🚨 P ≥ 40       → Urgence immédiate + buzzer ESP32
export const P_NORMAL    = 30;
export const P_CAUTION   = 32;
export const P_EMERGENCY = 40;

// Zone → matrix index ranges
export const ZONE_INDICES: Record<ZoneName, number[]> = {
  shoulders: [0, 1, 2, 3, 4, 5, 6, 7],
  thorax:    [7, 8, 9, 10, 11, 12, 13, 14],
  sacrum:    [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  legs:      [23, 24, 25, 26, 27, 28, 29, 30, 31],
  heels:     [32, 33, 34, 35, 36, 37, 38, 39],
};

export function mmHgToLevel(value: number): PressureLevel {
  if (value >= P_CAUTION) return "critical";
  if (value >= P_NORMAL)  return "warning";
  return "safe";
}

export function mmHgToColor(value: number): string {
  if (value >= P_EMERGENCY) return "#ba1a1a";  // urgence — crimson
  if (value >= P_CAUTION)   return "#f97316";  // repositionnement — orange-red
  if (value >= P_NORMAL)    return "#f59e0b";  // prévention — amber
  return "#006e11";                             // normal — green
}

export function computeZoneStats(matrix: number[], indices: number[]): ZoneStats {
  const values = indices.map((i) => matrix[i] ?? 0);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const count_over_32 = values.filter((v) => v >= P_CAUTION).length;
  return { avg: Math.round(avg * 10) / 10, max, count_over_32 };
}

export function computeAllZones(matrix: number[]) {
  return {
    sacrum:    computeZoneStats(matrix, ZONE_INDICES.sacrum),
    shoulders: computeZoneStats(matrix, ZONE_INDICES.shoulders),
    heels:     computeZoneStats(matrix, ZONE_INDICES.heels),
    thorax:    computeZoneStats(matrix, ZONE_INDICES.thorax),
    legs:      computeZoneStats(matrix, ZONE_INDICES.legs),
  };
}

export function computeSafetyScore(matrix: number[]): number {
  const criticalCount = matrix.filter((v) => v >= P_CAUTION).length;
  return Math.round(Math.max(0, 100 - (criticalCount / matrix.length) * 100));
}

export function safetyLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Optimal",          color: "#006e11" };
  if (score >= 50) return { label: "Prévention",       color: "#f59e0b" };
  return                  { label: "Repositionnement", color: "#ba1a1a" };
}
