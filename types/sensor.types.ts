// Sensor data types
export interface SensorMatrix {
  patient_id: string;
  timestamp: Date;
  matrix: number[]; // length 40, mmHg values
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
}
