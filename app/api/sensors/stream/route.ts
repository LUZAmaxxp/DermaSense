import { NextRequest } from "next/server";
import { getMqttClient } from "@/lib/mqtt-client";
import { sensorStore } from "@/lib/mqtt-store";
import { getRedis, SENSOR_STREAM } from "@/lib/redis";
import type { SensorUpdate } from "@/types/sensor.types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const redis = getRedis();
  const encoder = new TextEncoder();
  const encode = (s: string) => encoder.encode(s);

  // ── Redis path — Vercel production (UPSTASH_REDIS_REST_URL is set) ──────────
  if (redis) {
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));

        // "$" means "only messages added after this connection"
        let lastId = "$";
        // Reconnect before Vercel's 60s function timeout
        const deadline = Date.now() + 55_000;

        while (!req.signal.aborted && Date.now() < deadline) {
          try {
            type StreamEntry = { id: string; data: Record<string, unknown> };
            const results = await redis.xread(
              SENSOR_STREAM,
              lastId,
              { count: 10 }
            ) as [string, StreamEntry[]][] | null;

            if (results && results.length > 0) {
              const [, entries] = results[0];
              for (const entry of entries) {
                lastId = entry.id;
                const update = JSON.parse(entry.data.payload as string) as SensorUpdate;
                controller.enqueue(
                  encode(`data: ${JSON.stringify({ type: "sensor-update", payload: update })}\n\n`)
                );
              }
            } else {
              // No new data — wait 1 second before polling again
              await new Promise<void>((resolve) => {
                const t = setTimeout(resolve, 1000);
                req.signal.addEventListener("abort", () => { clearTimeout(t); resolve(); });
              });
            }
          } catch (err) {
            // Redis error — brief backoff then retry
            console.error("[SSE] Redis xread error:", err);
            await new Promise<void>((r) => setTimeout(r, 2000));
          }
        }

        // Tell client to reconnect after 1s (SSE spec: retry field)
        controller.enqueue(encode(`retry: 1000\ndata: ${JSON.stringify({ type: "reconnect" })}\n\n`));
        controller.close();
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

  // ── EventEmitter path — local dev (no Redis configured) ─────────────────────
  getMqttClient(); // ensure MQTT connection is initialised

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      const onUpdate = (update: SensorUpdate) => {
        try {
          controller.enqueue(
            encode(`data: ${JSON.stringify({ type: "sensor-update", payload: update })}\n\n`)
          );
        } catch {
          // Client disconnected
        }
      };

      sensorStore.on("sensor-update", onUpdate);

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

