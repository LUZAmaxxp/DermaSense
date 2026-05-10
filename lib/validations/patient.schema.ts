import { z } from "zod";

export const PatientSchema = z.object({
  name: z.string().min(2).max(100),
  age: z.number().int().min(0).max(130),
  ward: z.string().min(1),
  diagnosis: z.array(z.string()).min(1),
  braden_score: z.number().int().min(6).max(23),
  mobility_status: z.string(),
  repositioning_interval_min: z.number().int().min(15).max(240),
  skin_condition: z.string(),
  clinical_notes: z.string().optional(),
});

export type PatientInput = z.infer<typeof PatientSchema>;
