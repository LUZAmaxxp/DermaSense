import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Alert } from "@/models/Alert";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const patient_id = new URL(req.url).searchParams.get("patient_id") ?? "7724";
    const days = 7;
    const since = new Date(Date.now() - days * 86400 * 1000);

    const alerts = await Alert.find(
      { patient_id, created_at: { $gte: since } },
      { severity: 1, created_at: 1 }
    ).lean();

    // Build 7-day trend
    const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const trend: Record<string, { count: number; critical: number; warning: number }> = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400 * 1000);
      const key = d.toISOString().slice(0, 10);
      trend[key] = { count: 0, critical: 0, warning: 0 };
    }

    for (const a of alerts) {
      const key = new Date(a.created_at).toISOString().slice(0, 10);
      if (trend[key]) {
        trend[key].count++;
        if (a.severity === "critical") trend[key].critical++;
        if (a.severity === "warning") trend[key].warning++;
      }
    }

    const result = Object.entries(trend).map(([date, stats]) => ({
      date: dayLabels[new Date(date).getDay()],
      ...stats,
    }));

    return NextResponse.json({ trend: result });
  } catch (err) {
    console.error("[GET /api/alerts/trends]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
