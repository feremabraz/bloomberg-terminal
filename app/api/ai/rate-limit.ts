import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Rate limit configuration
type RateLimitConfig = {
  maxRequests: number; // Maximum requests per window
  windowInSeconds: number; // Time window in seconds
};

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = { maxRequests: 10, windowInSeconds: 60 }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Get IP address from request headers
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "anonymous";
  
  // Create a unique key for this IP and endpoint
  const key = `rate-limit:ai:${ip}`;
  
  // Get current count and timestamp
  const now = Math.floor(Date.now() / 1000);
  const windowExpiry = now + config.windowInSeconds;
  
  // Use Redis to track request count
  const count = await redis.incr(key);
  
  // Get TTL for the key
  const ttl = await redis.ttl(key);
  const expiry = ttl > 0 ? Math.floor(Date.now() / 1000) + ttl : windowExpiry;
  
  // Set expiry if this is the first request in the window
  if (count === 1) {
    await redis.expire(key, config.windowInSeconds);
  }
  
  // Calculate time until reset
  const reset = expiry || windowExpiry;
  const remaining = Math.max(0, config.maxRequests - count);
  
  return {
    success: count <= config.maxRequests,
    limit: config.maxRequests,
    remaining,
    reset
  };
}
