import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Alert } from "@/models/Alert";
import { AlertSchema } from "@/lib/validations/alert.schema";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const patient_id = searchParams.get("patient_id") ?? "7724";

    const query: Record<string, unknown> = { patient_id };
    if (status === "active") query.status = "active";
    else if (status === "resolved") query.status = { $in: ["dismissed", "resolved"] };

    const alerts = await Alert.find(query)
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ alerts });
  } catch (err) {
    console.error("[GET /api/alerts]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Internal use only — called by MQTT handler, not from browser
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = AlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const alert = await Alert.create(parsed.data);
    return NextResponse.json({ alert }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/alerts]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
