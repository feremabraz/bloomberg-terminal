import { Redis } from "@upstash/redis"

// Use new environment variable names with fallback to old names for backward compatibility
const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

// Create a more robust Redis client with error handling
let redisClient: Redis

try {
  redisClient = new Redis({
    url: url,
    token: token,
    retry: {
      retries: 3,
      backoff: (retryCount) => Math.min(Math.exp(retryCount) * 50, 1000),
    },
  })
  console.log("Redis client initialized")
} catch (error) {
  console.error("Failed to initialize Redis client:", error)
  // Create a fallback Redis client that will gracefully fail
  redisClient = {
    get: async () => null,
    set: async () => null,
    ping: async () => {
      throw new Error("Redis not available")
    },
  } as unknown as Redis
}

export const redis = redisClient
