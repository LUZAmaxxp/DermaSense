import { z } from "zod";

export const SensorPayloadSchema = z.object({
  patient_id: z.string().min(1).max(50),
  ts: z.number().int().positive(),
  matrix: z.array(z.number().min(0).max(300)).length(40),
  pos: z.enum(["dorsal", "lateral_droit", "lateral_gauche", "prone"]),
  hum: z.number().min(0).max(100),
  uptime: z.number().int().nonnegative(),
});

export type SensorPayloadInput = z.infer<typeof SensorPayloadSchema>;
