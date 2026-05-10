import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SensorReading } from "@/models/SensorReading";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const patient_id = searchParams.get("patient_id") ?? "7724";
    const range = searchParams.get("range") ?? "12h";

    const hours = range === "24h" ? 24 : 12;
    const since = new Date(Date.now() - hours * 3600 * 1000);

    const readings = await SensorReading.find(
      { patient_id, timestamp: { $gte: since } },
      { matrix: 0, __v: 0 }
    )
      .sort({ timestamp: -1 })
      .limit(300)
      .lean();

    return NextResponse.json({ readings });
  } catch (err) {
    console.error("[GET /api/sensors]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
