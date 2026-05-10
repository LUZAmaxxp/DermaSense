export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "dismissed" | "resolved";
export type AlertZone = "sacrum" | "shoulders" | "heels" | "thorax" | "legs";

export interface Alert {
  _id: string;
  patient_id: string;
  severity: AlertSeverity;
  zone: AlertZone;
  pressure_mmhg: number;
  duration_min: number;
  threshold_mmhg: number;
  status: AlertStatus;
  created_at: string;
  resolved_at: string | null;
  dismissed_by: string | null;
}

export interface AlertTrend {
  date: string;    // e.g. "Lun"
  count: number;
  critical: number;
  warning: number;
}
