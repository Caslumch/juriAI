import { Redis } from "@upstash/redis";
import { config } from "@/config";

function createRedisClient(): Redis | null {
  if (!config.UPSTASH_REDIS_REST_URL || !config.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: config.UPSTASH_REDIS_REST_URL,
    token: config.UPSTASH_REDIS_REST_TOKEN,
  });
}

export const redis = createRedisClient();
