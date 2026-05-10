import { NextRequest, NextResponse } from "next/server";
import { getMqttClient } from "@/lib/mqtt-client";
import { z } from "zod";

const PublishSchema = z.object({
  topic: z.string().min(1).max(200),
  payload: z.record(z.string(), z.unknown()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PublishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const client = getMqttClient();
    if (!client) {
      return NextResponse.json({ error: "MQTT client not initialized" }, { status: 503 });
    }

    const { topic, payload } = parsed.data;
    client.publish(topic, JSON.stringify(payload), { qos: 1 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/mqtt/publish]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
