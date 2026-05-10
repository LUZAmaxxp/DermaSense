import { NextResponse } from "next/server";
import { sensorStore } from "@/lib/mqtt-store";
import { getMqttClient } from "@/lib/mqtt-client";

export async function GET() {
  const client = getMqttClient();
  const connected = sensorStore.isConnected();

  return NextResponse.json({
    status: connected ? "connected" : "disconnected",
    broker: process.env.MQTT_BROKER_URL?.replace(/^ssl:\/\//, "").split(":")[0] ?? "not configured",
    client_id: process.env.MQTT_CLIENT_ID ?? "not configured",
    has_client: !!client,
  });
}
