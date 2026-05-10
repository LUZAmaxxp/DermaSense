import { NextRequest } from "next/server";
import { getMqttClient } from "@/lib/mqtt-client";
import { sensorStore } from "@/lib/mqtt-store";
import type { SensorUpdate } from "@/types/sensor.types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Ensure MQTT client is initialized
  getMqttClient();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connected event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      const onUpdate = (update: SensorUpdate) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "sensor-update", payload: update })}\n\n`)
          );
        } catch {
          // Client disconnected
        }
      };

      sensorStore.on("sensor-update", onUpdate);

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        sensorStore.off("sensor-update", onUpdate);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
