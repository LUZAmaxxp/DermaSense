/**
 * Server-side MQTT client singleton.
 * Connects to HiveMQ broker, subscribes to all patient sensor topics,
 * validates payloads, saves to MongoDB, runs alert logic, and emits
 * events to the SSE store.
 *
 * Uses `global` pattern so it survives Next.js hot-reload in dev
 * and serverless cold starts on Vercel.
 */
import mqtt, { MqttClient } from "mqtt";
import { SensorPayloadSchema } from "./validations/sensor.schema";
import { computeAllZones, computeSafetyScore } from "./utils/pressure";
import { sensorStore } from "./mqtt-store";
import { getRedis, SENSOR_STREAM } from "./redis";
import { connectDB } from "./mongodb";
import { SensorReading } from "@/models/SensorReading";
import { Alert } from "@/models/Alert";

declare global {
  // eslint-disable-next-line no-var
  var _mqttClient: MqttClient | null;
}

const BROKER_URL   = process.env.MQTT_BROKER_URL   ?? "";
const USERNAME     = process.env.MQTT_USERNAME      ?? "";
const PASSWORD     = process.env.MQTT_PASSWORD      ?? "";
// Append a random suffix so each Vercel/worker instance gets a unique client ID.
// Sharing the same ID causes HiveMQ to kick the previous connection out on every
// reconnect, creating an infinite disconnect loop when multiple instances run.
const CLIENT_ID    = `${process.env.MQTT_CLIENT_ID ?? "dermasense-server"}-${Math.random().toString(36).slice(2, 8)}`;
const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX  ?? "dermasense";

export function getMqttClient(): MqttClient | null {
  if (!BROKER_URL) return null;
  if (global._mqttClient) return global._mqttClient;

  const client = mqtt.connect(BROKER_URL, {
    username: USERNAME,
    password: PASSWORD,
    clientId: CLIENT_ID,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  });

  client.on("connect", () => {
    console.log("[MQTT] Connected to broker");
    client.subscribe(`${TOPIC_PREFIX}/+/sensors`, { qos: 1 }, (err) => {
      if (err) console.error("[MQTT] Subscribe error:", err);
      else console.log(`[MQTT] Subscribed to ${TOPIC_PREFIX}/+/sensors`);
    });
    sensorStore.setConnected(true);
  });

  client.on("reconnect", () => {
    console.log("[MQTT] Reconnecting…");
    sensorStore.setConnected(false);
  });

  client.on("error", (err) => {
    console.error("[MQTT] Error:", err.message);
    sensorStore.setConnected(false);
  });

  client.on("message", async (topic, payload) => {
    try {
      const raw = JSON.parse(payload.toString());

      // Validate with Zod — never trust ESP32 data blindly
      const parsed = SensorPayloadSchema.safeParse(raw);
      if (!parsed.success) {
        console.warn("[MQTT] Invalid payload:", parsed.error.flatten());
        return;
      }

      // Runtime length guard — discard malformed matrices
      if (parsed.data.matrix.length !== 10) {
        console.warn(`[MQTT] Invalid matrix length ${parsed.data.matrix.length}, expected 10. Discarding.`);
        return;
      }

      const data = parsed.data;
      const zones = computeAllZones(data.matrix);
      const safety_score = computeSafetyScore(data.matrix);

      await connectDB();

      // Persist reading
      await SensorReading.create({
        patient_id: data.patient_id,
        timestamp: new Date(data.ts),
        matrix: data.matrix,
        zones,
        position: data.pos,
        humidity: data.hum,
        esp32_uptime_ms: data.uptime,
      });

      // Alert logic: create DB alert when zone crosses repositionnement threshold
      for (const [zoneName, stats] of Object.entries(zones)) {
        if (stats.avg >= 32) {
          const severity = stats.avg >= 40 ? "critical" : "warning";
          // Only create alert if no active alert exists for same patient+zone
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

      // Push to SSE store (local dev EventEmitter)
      const update = {
        patient_id:  data.patient_id,
        timestamp:   data.ts,
        matrix:      data.matrix,
        zones,
        position:    data.pos,
        humidity:    data.hum,
        safety_score,
        alert_level: data.alert_level,
      };
      sensorStore.emit("sensor-update", update);

      // Publish to Redis stream for Vercel SSE clients (production)
      const redis = getRedis();
      if (redis) {
        await redis.xadd(SENSOR_STREAM, "*", { payload: JSON.stringify(update) });
      }
    } catch (err) {
      console.error("[MQTT] Processing error:", err);
    }
  });

  global._mqttClient = client;
  return client;
}
