import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Optional: rate limiting only activates when Upstash env vars are set, so
// the app still runs (unlimited) in local dev / demos without a Redis
// account. Wire up UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN for
// production (free tier at upstash.com works fine for this).
let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    analytics: true,
    prefix: "kotoba-connect",
  });
  return limiter;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  request: Request,
  bucket: string
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number }> {
  const rl = getLimiter();
  if (!rl) return { allowed: true };

  const ip = getClientIp(request);
  const { success, reset } = await rl.limit(`${bucket}:${ip}`);
  if (success) return { allowed: true };

  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
}
