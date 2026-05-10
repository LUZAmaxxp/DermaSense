import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IAlert extends Document {
  patient_id: string;
  severity: "critical" | "warning" | "info";
  zone: "sacrum" | "shoulders" | "heels" | "thorax" | "legs";
  pressure_mmhg: number;
  duration_min: number;
  threshold_mmhg: number;
  status: "active" | "dismissed" | "resolved";
  created_at: Date;
  resolved_at: Date | null;
  dismissed_by: string | null;
}

const AlertSchema = new Schema<IAlert>({
  patient_id: { type: String, required: true, index: true },
  severity: { type: String, enum: ["critical", "warning", "info"], required: true },
  zone: { type: String, enum: ["sacrum", "shoulders", "heels", "thorax", "legs"], required: true },
  pressure_mmhg: { type: Number, required: true, min: 0, max: 300 },
  duration_min: { type: Number, required: true, min: 0 },
  threshold_mmhg: { type: Number, required: true, min: 20, max: 60 },
  status: { type: String, enum: ["active", "dismissed", "resolved"], default: "active" },
  created_at: { type: Date, default: Date.now },
  resolved_at: { type: Date, default: null },
  dismissed_by: { type: String, default: null },
}, { timestamps: false });

AlertSchema.index({ patient_id: 1, created_at: -1 });
AlertSchema.index({ status: 1 });

export const Alert = models.Alert || model<IAlert>("Alert", AlertSchema);
