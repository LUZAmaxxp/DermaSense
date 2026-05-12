import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ISensorReading extends Document {
  patient_id: string;
  timestamp: Date;
  matrix: number[];
  zones: {
    sacrum: { avg: number; max: number; count_over_32: number };
    shoulders: { avg: number; max: number; count_over_32: number };
    heels: { avg: number; max: number; count_over_32: number };
    thorax: { avg: number; max: number; count_over_32: number };
    legs: { avg: number; max: number; count_over_32: number };
  };
  position: string;
  humidity: number;
  esp32_uptime_ms: number;
}

const ZoneStatsSchema = new Schema({
  avg: { type: Number, required: true },
  max: { type: Number, required: true },
  count_over_32: { type: Number, required: true },
}, { _id: false });

const SensorReadingSchema = new Schema<ISensorReading>({
  patient_id: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, default: Date.now },
  matrix: { type: [Number], required: true, validate: [(v: number[]) => v.length === 10, "matrix must have exactly 10 values"] },
  zones: {
    sacrum: ZoneStatsSchema,
    shoulders: ZoneStatsSchema,
    heels: ZoneStatsSchema,
    thorax: ZoneStatsSchema,
    legs: ZoneStatsSchema,
  },
  position: { type: String, enum: ["dorsal", "lateral_droit", "lateral_gauche", "prone"], required: true },
  humidity: { type: Number, min: 0, max: 100 },
  esp32_uptime_ms: { type: Number },
}, { timestamps: false });

// Compound index: most common query pattern
SensorReadingSchema.index({ patient_id: 1, timestamp: -1 });
// TTL: auto-delete after 30 days
SensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

export const SensorReading = models.SensorReading || model<ISensorReading>("SensorReading", SensorReadingSchema);
