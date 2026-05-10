import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IPatient extends Document {
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
  created_at: Date;
}

const PatientSchema = new Schema<IPatient>({
  patient_id: { type: String, required: true, unique: true },
  name: { type: String, required: true, minlength: 2, maxlength: 100 },
  age: { type: Number, required: true, min: 0, max: 130 },
  ward: { type: String, required: true },
  diagnosis: { type: [String], required: true },
  braden_score: { type: Number, min: 6, max: 23 },
  mobility_status: { type: String },
  repositioning_interval_min: { type: Number, default: 120, min: 15, max: 240 },
  skin_condition: { type: String },
  assigned_nurse_id: { type: String },
  clinical_notes: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
}, { timestamps: false });

export const Patient = models.Patient || model<IPatient>("Patient", PatientSchema);
