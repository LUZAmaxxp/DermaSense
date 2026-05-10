import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Alert } from "@/models/Alert";
import { DismissAlertSchema } from "@/lib/validations/alert.schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const body = await req.json();
    const parsed = DismissAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const update: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.status === "dismissed") {
      update.dismissed_by = parsed.data.dismissed_by ?? "unknown";
    }
    if (parsed.data.status === "resolved") {
      update.resolved_at = new Date();
    }

    const alert = await Alert.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ alert });
  } catch (err) {
    console.error("[PATCH /api/alerts/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
