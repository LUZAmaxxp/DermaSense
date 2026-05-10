import mongoose, { Schema, Document, models, model } from "mongoose";
import bcryptjs from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password_hash: string;
  name: string;
  role: "nurse" | "doctor" | "admin";
  ward: string;
  settings: {
    threshold_mmhg: number;
    alert_window_min: number;
    notify_critical: boolean;
    notify_warning: boolean;
    notify_info: boolean;
  };
  created_at: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["nurse", "doctor", "admin"], default: "nurse" },
  ward: { type: String, default: "" },
  settings: {
    threshold_mmhg: { type: Number, default: 32, min: 20, max: 60 },
    alert_window_min: { type: Number, default: 30, min: 15, max: 120 },
    notify_critical: { type: Boolean, default: true },
    notify_warning: { type: Boolean, default: true },
    notify_info: { type: Boolean, default: false },
  },
  created_at: { type: Date, default: Date.now },
}, { timestamps: false });

UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcryptjs.compare(plain, this.password_hash);
};

export const User = models.User || model<IUser>("User", UserSchema);
