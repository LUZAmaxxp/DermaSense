import { z } from "zod";

export const AlertSchema = z.object({
  patient_id: z.string().min(1),
  severity: z.enum(["critical", "warning", "info"]),
  zone: z.enum(["sacrum", "shoulders", "heels", "thorax", "legs"]),
  pressure_mmhg: z.number().min(0).max(300),
  duration_min: z.number().int().min(0),
  threshold_mmhg: z.number().min(20).max(60),
});

export const DismissAlertSchema = z.object({
  status: z.enum(["dismissed", "resolved"]),
  dismissed_by: z.string().optional(),
});

export type AlertInput = z.infer<typeof AlertSchema>;
export type DismissAlertInput = z.infer<typeof DismissAlertSchema>;
