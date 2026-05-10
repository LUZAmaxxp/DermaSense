import type { PatientPosition } from "./sensor.types";

export interface Patient {
  _id: string;
  patient_id: string;
  name: string;
  age: number;
  ward: string;
  diagnosis: string[];
  braden_score: number;
  mobility_status: string;
  repositioning_interval_min: number;
  skin_condition: string;
  assigned_nurse_id: string;
  clinical_notes: string;
  created_at: string;
}

export interface PositionRecord {
  timestamp: string;
  position: PatientPosition;
  duration_min: number;
  changed_by: string;
}

export interface MedicalFile extends Patient {
  position_history: PositionRecord[];
  last_repositioned: string;
}
