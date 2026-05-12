// Sensor data types
export type AlertLevel = "normal" | "prevention" | "caution" | "repositionnement" | "urgence";

/** Index into the 10-value FSR sensor matrix (0–9) */
export type SensorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** Human-readable label for each of the 10 FSR sensors */
export type SensorLabel =
  | "shoulder_left"  | "shoulder_right"
  | "thorax_left"    | "thorax_right"
  | "sacrum_left"    | "sacrum_right"
  | "leg_left"       | "leg_right"
  | "heel_left"      | "heel_right";

/** Canonical sensor map — 5 zones × 2 sensors each */
export const SENSOR_MAP: Record<ZoneName, { indices: [SensorIndex, SensorIndex]; labels: [SensorLabel, SensorLabel] }> = {
  shoulders: { indices: [0, 1], labels: ["shoulder_left", "shoulder_right"] },
  thorax:    { indices: [2, 3], labels: ["thorax_left",   "thorax_right"]   },
  sacrum:    { indices: [4, 5], labels: ["sacrum_left",   "sacrum_right"]   },
  legs:      { indices: [6, 7], labels: ["leg_left",      "leg_right"]      },
  heels:     { indices: [8, 9], labels: ["heel_left",     "heel_right"]     },
} as const;

export interface SensorMatrix {
  patient_id: string;
  timestamp: Date;
  /** 10 FSR sensor readings in mmHg, indices 0–9 */
  matrix: number[];
  zones: {
    sacrum: ZoneStats;
    shoulders: ZoneStats;
    heels: ZoneStats;
    thorax: ZoneStats;
    legs: ZoneStats;
  };
  position: PatientPosition;
  humidity: number;
  esp32_uptime_ms: number;
}

export interface ZoneStats {
  avg: number;
  max: number;
  count_over_32: number;
}

export interface ZoneReading {
  name: ZoneName;
  label: string;
  avg: number;
  max: number;
  duration_min: number;
  status: PressureLevel;
  indices: number[]; // which matrix indices belong to this zone
}

export type ZoneName = "sacrum" | "shoulders" | "heels" | "thorax" | "legs";
export type PatientPosition = "dorsal" | "lateral_droit" | "lateral_gauche" | "prone";
export type PressureLevel = "safe" | "warning" | "critical";

// Raw ESP32 MQTT payload (before processing)
export interface Esp32Payload {
  patient_id: string;
  ts: number;
  matrix: number[];
  pos: PatientPosition;
  hum: number;
  uptime: number;
  alert_level?: AlertLevel;
}

// Processed sensor update pushed to frontend via SSE
export interface SensorUpdate {
  patient_id: string;
  timestamp: number;
  matrix: number[];
  zones: SensorMatrix["zones"];
  position: PatientPosition;
  humidity: number;
  safety_score: number; // 0-100
  alert_level?: AlertLevel;
}
