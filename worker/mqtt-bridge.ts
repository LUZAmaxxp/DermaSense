/**
 * DermaSense MQTT Bridge — deploy this on Railway (or any always-on Node.js host).
 *
 * This process maintains a persistent MQTT connection to HiveMQ,
 * validates ESP32 payloads, saves to MongoDB, runs alert logic,
 * and publishes updates to the Upstash Redis stream so Vercel SSE
 * clients can receive real-time sensor data.
 *
 * ── How to deploy on Railway ──────────────────────────────────────
 * 1. Connect your GitHub repo to Railway
 * 2. Create a new service → select "dermasense-nextjs" folder as root
 * 3. Set start command: npm run worker
 * 4. Add all env vars from .env.local in the Railway dashboard:
 *      MONGODB_URI, MQTT_BROKER_URL, MQTT_USERNAME, MQTT_PASSWORD,
 *      UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 * 5. Deploy — Railway keeps this process running 24/7
 * ──────────────────────────────────────────────────────────────────
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local for local testing; Railway injects env vars from dashboard
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { getMqttClient } from "../lib/mqtt-client";
import { getRedis, SENSOR_STREAM } from "../lib/redis";

const client = getMqttClient();

if (!client) {
  console.error("[Worker] MQTT_BROKER_URL is not set — cannot start. Check your env vars.");
  process.exit(1);
}

const redisEnabled = !!getRedis();

console.log("─".repeat(50));
console.log(" DermaSense MQTT Bridge");
console.log("─".repeat(50));
console.log(` MQTT broker : ${process.env.MQTT_BROKER_URL?.split("@")[1] ?? "(configured)"}`);
console.log(` MongoDB     : ${process.env.MONGODB_URI ? "configured" : "MISSING ⚠"}`);
console.log(` Redis stream: ${redisEnabled ? SENSOR_STREAM : "disabled (set UPSTASH_REDIS_REST_URL)"}`);
console.log("─".repeat(50));

// Keep process alive
process.stdin.resume();

process.on("SIGINT", () => {
  console.log("\n[Worker] SIGINT — shutting down gracefully.");
  client.end();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("[Worker] SIGTERM — shutting down gracefully.");
  client.end();
  process.exit(0);
});
