/**
 * POST /api/mock/inject
 *
 * Development-only endpoint that simulates an ESP32 sensor reading arriving
 * via MQTT. Accepts a full payload OR generates a realistic random one.
 *
 * The handler reuses the exact same pipeline as the real MQTT message handler:
 *   1. Validate with Zod
 *   2. Compute zone stats + safety score
 *   3. Persist SensorReading to MongoDB
 *   4. Run alert logic
 *   5. Emit to sensorStore → SSE clients update in real time
 *
 * Only available when NODE_ENV !== "production".
 */

import { NextRequest, NextResponse } from "next/server";
import { SensorPayloadSchema } from "@/lib/validations/sensor.schema";
import { computeAllZones, computeSafetyScore } from "@/lib/utils/pressure";
import { sensorStore } from "@/lib/mqtt-store";
import { connectDB } from "@/lib/mongodb";
import { SensorReading } from "@/models/SensorReading";
import { Alert } from "@/models/Alert";
import type { PatientPosition } from "@/types/sensor.types";

if (process.env.NODE_ENV === "production") {
  // Hard-stop at module load so the route is dead in production
  throw new Error("Mock inject route must not be used in production");
}

// ─── Realistic matrix generator ──────────────────────────────────────────────

type ScenarioName = "normal" | "prevention" | "caution" | "repositionnement" | "urgence";

interface MockOptions {
  patient_id?: string;
  scenario?: ScenarioName;
  position?: PatientPosition;
}

function gaussianRandom(mean: number, std: number): number {
  // Box–Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, Math.min(300, mean + std * z0));
}

/**
 * Generate a 40-value pressure matrix that matches the requested clinical scenario.
 * Zone index layout mirrors ZONE_INDICES in lib/utils/pressure.ts:
 *   shoulders [0-7] | thorax [7-14] | sacrum [15-25] | legs [23-31] | heels [32-39]
 */
function generateMatrix(scenario: ScenarioName, position: PatientPosition): number[] {
  const matrix = new Array<number>(40).fill(0);

  // Base low-pressure background (resting tissue)
  for (let i = 0; i < 40; i++) {
    matrix[i] = gaussianRandom(12, 4);
  }

  // Zone pressure overlays per scenario
  const scenarios: Record<ScenarioName, { zones: number[]; mean: number; std: number }[]> = {
    normal: [],
    prevention: [
      { zones: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], mean: 31, std: 2 }, // sacrum ~31 mmHg
    ],
    caution: [
      { zones: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], mean: 33, std: 3 }, // sacrum crossing 32
    ],
    repositionnement: [
      { zones: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], mean: 37, std: 4 }, // sacrum high
      { zones: [32, 33, 34, 35, 36, 37, 38, 39], mean: 33, std: 3 },             // heels elevated
    ],
    urgence: [
      { zones: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], mean: 45, std: 5 }, // sacrum emergency
      { zones: [32, 33, 34, 35, 36, 37, 38, 39], mean: 38, std: 4 },             // heels high
      { zones: [0, 1, 2, 3, 4, 5, 6, 7], mean: 35, std: 4 },                    // shoulders elevated
    ],
  };

  // Lateral positions put pressure on one shoulder instead of sacrum
  if (position === "lateral_droit" || position === "lateral_gauche") {
    const shoulderSide = position === "lateral_droit" ? [0, 1, 2, 3] : [4, 5, 6, 7];
    for (const idx of shoulderSide) {
      matrix[idx] = gaussianRandom(28, 5);
    }
  }

  for (const overlay of scenarios[scenario]) {
    for (const idx of overlay.zones) {
      matrix[idx] = gaussianRandom(overlay.mean, overlay.std);
    }
  }

  return matrix.map((v) => Math.round(v * 10) / 10);
}

function buildMockPayload(opts: MockOptions) {
  const scenario: ScenarioName = opts.scenario ?? "normal";
  const position: PatientPosition = opts.position ?? "dorsal";

  return {
    patient_id: opts.patient_id ?? "7724",
    ts: Date.now(),
    matrix: generateMatrix(scenario, position),
    pos: position,
    hum: Math.round(gaussianRandom(55, 10)),
    uptime: Math.floor(Math.random() * 1_000_000),
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Use provided values or fall back to generated mock
    // If the body is a hint-only object (scenario/patient_id/position without full matrix),
    // generate the full payload. Otherwise treat as a literal ESP32-style payload.
    const isHintOnly = !("matrix" in body) || !("ts" in body);
    const raw = isHintOnly
      ? buildMockPayload(body as MockOptions)
      : body;

    const parsed = SensorPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const zones = computeAllZones(data.matrix);
    const safety_score = computeSafetyScore(data.matrix);

    await connectDB();

    // 1. Persist sensor reading
    await SensorReading.create({
      patient_id: data.patient_id,
      timestamp: new Date(data.ts),
      matrix: data.matrix,
      zones,
      position: data.pos,
      humidity: data.hum,
      esp32_uptime_ms: data.uptime,
    });

    // 2. Alert logic (same as MQTT handler)
    for (const [zoneName, stats] of Object.entries(zones)) {
      if (stats.avg >= 32) {
        const severity = stats.avg >= 40 ? "critical" : "warning";
        const existing = await Alert.findOne({
          patient_id: data.patient_id,
          zone: zoneName,
          status: "active",
        });
        if (!existing) {
          await Alert.create({
            patient_id: data.patient_id,
            severity,
            zone: zoneName,
            pressure_mmhg: Math.round(stats.avg),
            duration_min: 0,
            threshold_mmhg: 32,
            status: "active",
          });
        }
      }
    }

    // 3. Push to SSE stream
    sensorStore.emitUpdate({
      patient_id: data.patient_id,
      timestamp: data.ts,
      matrix: data.matrix,
      zones,
      position: data.pos,
      humidity: data.hum,
      safety_score,
      alert_level: data.alert_level,
    });

    return NextResponse.json({
      ok: true,
      patient_id: data.patient_id,
      safety_score,
      zones: Object.fromEntries(
        Object.entries(zones).map(([k, v]) => [k, { avg: v.avg, max: v.max }])
      ),
      position: data.pos,
    });
  } catch (err) {
    console.error("[POST /api/mock/inject]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/mock/inject?scenario=urgence&patient_id=7724&count=5&interval_ms=2000
 *
 * Convenience: inject `count` readings server-side at `interval_ms` apart,
 * then return a summary. Useful for quickly populating the DB for chart testing.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scenario = (searchParams.get("scenario") ?? "normal") as ScenarioName;
  const patient_id = searchParams.get("patient_id") ?? "7724";
  const position = (searchParams.get("position") ?? "dorsal") as PatientPosition;
  const count = Math.min(parseInt(searchParams.get("count") ?? "10", 10), 100);
  const interval_ms = Math.max(parseInt(searchParams.get("interval_ms") ?? "1000", 10), 200);

  const results: { safety_score: number; zones: Record<string, { avg: number; max: number }> }[] = [];

  await connectDB();

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (let i = 0; i < count; i++) {
    const raw = buildMockPayload({ patient_id, scenario, position });
    const parsed = SensorPayloadSchema.safeParse(raw);
    if (!parsed.success) continue;

    const data = parsed.data;
    const zones = computeAllZones(data.matrix);
    const safety_score = computeSafetyScore(data.matrix);

    await SensorReading.create({
      patient_id: data.patient_id,
      timestamp: new Date(data.ts - (count - i) * interval_ms),
      matrix: data.matrix,
      zones,
      position: data.pos,
      humidity: data.hum,
      esp32_uptime_ms: data.uptime,
    });

    sensorStore.emitUpdate({
      patient_id: data.patient_id,
      timestamp: data.ts,
      matrix: data.matrix,
      zones,
      position: data.pos,
      humidity: data.hum,
      safety_score,
    });

    results.push({
      safety_score,
      zones: Object.fromEntries(
        Object.entries(zones).map(([k, v]) => [k, { avg: v.avg, max: v.max }])
      ),
    });

    if (i < count - 1) await delay(interval_ms);
  }

  return NextResponse.json({ ok: true, injected: count, scenario, patient_id, results });
}
