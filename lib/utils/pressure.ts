import type { PressureLevel, ZoneName, ZoneStats } from "@/types/sensor.types";

// Zone → matrix index ranges
export const ZONE_INDICES: Record<ZoneName, number[]> = {
  shoulders: [0, 1, 2, 3, 4, 5, 6, 7],
  thorax:    [7, 8, 9, 10, 11, 12, 13, 14],
  sacrum:    [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  legs:      [23, 24, 25, 26, 27, 28, 29, 30, 31],
  heels:     [32, 33, 34, 35, 36, 37, 38, 39],
};

export function mmHgToLevel(value: number, threshold = 32): PressureLevel {
  if (value > threshold) return "critical";
  if (value > threshold * 0.75) return "warning";
  return "safe";
}

export function mmHgToColor(value: number): string {
  if (value > 40) return "#ba1a1a";  // critical — crimson
  if (value > 32) return "#f97316";  // high — orange
  if (value > 20) return "#f59e0b";  // warning — amber
  return "#006e11";                   // safe — green
}

export function computeZoneStats(matrix: number[], indices: number[]): ZoneStats {
  const values = indices.map((i) => matrix[i] ?? 0);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const count_over_32 = values.filter((v) => v > 32).length;
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

export function computeSafetyScore(matrix: number[], threshold = 32): number {
  const criticalCount = matrix.filter((v) => v > threshold).length;
  return Math.round(Math.max(0, 100 - (criticalCount / matrix.length) * 100));
}

export function safetyLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Optimal", color: "#006e11" };
  if (score >= 60) return { label: "Attention", color: "#f59e0b" };
  return { label: "Critique", color: "#ba1a1a" };
}
