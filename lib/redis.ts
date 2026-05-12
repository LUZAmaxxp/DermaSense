import { Redis } from "@upstash/redis";

declare global {
  // eslint-disable-next-line no-var
  var _redisClient: Redis | undefined;
}

/** Redis stream key for real-time sensor updates */
export const SENSOR_STREAM = "dermasense:sensor:stream";

/**
 * Returns the Upstash Redis client, or null if UPSTASH_REDIS_REST_URL is not set.
 * Returns null in local dev so EventEmitter fallback is used automatically.
 */
export function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  if (global._redisClient) return global._redisClient;

  global._redisClient = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  });

  return global._redisClient;
}
