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

// ─── Realistic matrix generator ──────────────────────────────────────────────

type ScenarioName = "normal" | "prevention" | "caution" | "repositionnement" | "urgence";

interface MockOptions {
  patient_id?: string;
  scenario?: ScenarioName;
  position?: PatientPosition;
}

function gaussianRandom(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, Math.min(300, mean + std * z0));
}

function generateMatrix(scenario: ScenarioName, position: PatientPosition): number[] {
  const matrix = new Array<number>(10).fill(0);
  for (let i = 0; i < 10; i++) matrix[i] = gaussianRandom(12, 4);

  const overlays: Record<ScenarioName, { indices: number[]; mean: number; std: number }[]> = {
    normal: [],
    prevention: [{ indices: [4, 5], mean: 31, std: 2 }],
    caution: [{ indices: [4, 5], mean: 33, std: 2 }],
    repositionnement: [
      { indices: [4, 5], mean: 37, std: 3 },
      { indices: [8, 9], mean: 33, std: 2 },
    ],
    urgence: [
      { indices: [4, 5], mean: 45, std: 4 },
      { indices: [8, 9], mean: 38, std: 3 },
      { indices: [0, 1], mean: 35, std: 3 },
    ],
  };

  if (position === "lateral_droit") matrix[0] = gaussianRandom(28, 5);
  else if (position === "lateral_gauche") matrix[1] = gaussianRandom(28, 5);

  for (const overlay of overlays[scenario]) {
    for (const idx of overlay.indices) matrix[idx] = gaussianRandom(overlay.mean, overlay.std);
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

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

// ─── Route handler ────────────────────────────────────────────────────────────

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
