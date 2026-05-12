import { z } from "zod";

export const SettingsSchema = z.object({
  threshold_mmhg: z.number().min(20).max(60).default(32),
  alert_window_min: z.number().int().min(15).max(120).default(30),
  notify_critical: z.boolean().default(true),
  notify_warning: z.boolean().default(true),
  notify_info: z.boolean().default(false),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  role: z.enum(["nurse", "doctor", "admin"] as const),
  ward: z.string().optional(),
  password: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type SettingsInput = z.infer<typeof SettingsSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
