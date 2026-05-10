import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SensorReading } from "@/models/SensorReading";
import { computeZoneStats } from "@/lib/utils/pressure";
import { ZONE_INDICES } from "@/lib/utils/pressure";
import type { ZoneName } from "@/types/sensor.types";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const patient_id = new URL(req.url).searchParams.get("patient_id") ?? "7724";
    const since = new Date(Date.now() - 30 * 60 * 1000); // last 30 min

    const readings = await SensorReading.find(
      { patient_id, timestamp: { $gte: since } },
      { matrix: 1 }
    ).lean();

    if (readings.length === 0) {
      return NextResponse.json({ zones: [] });
    }

    // Aggregate all matrices
    const allMatrices = readings.map((r) => r.matrix as number[]);
    const combined = allMatrices[allMatrices.length - 1]; // use latest

    const zones = (Object.entries(ZONE_INDICES) as [ZoneName, number[]][]).map(
      ([name, indices]) => ({
        name,
        ...computeZoneStats(combined, indices),
      })
    );

    return NextResponse.json({ zones });
  } catch (err) {
    console.error("[GET /api/sensors/zones]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
