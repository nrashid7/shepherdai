import { corsHeaders } from "./cors.ts";

const requestLog = new Map<string, number[]>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, timestamps] of requestLog) {
    const filtered = timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) {
      requestLog.delete(key);
    } else {
      requestLog.set(key, filtered);
    }
  }
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "unknown";
}

/**
 * Sliding-window rate limiter. Returns a 429 Response if the client has
 * exceeded the allowed request count, or null if the request is within limits.
 */
export function checkRateLimit(
  req: Request,
  opts?: { maxRequests?: number; windowMs?: number },
): Response | null {
  const maxRequests = opts?.maxRequests ?? 20;
  const windowMs = opts?.windowMs ?? 60_000;

  cleanupStaleEntries(windowMs);

  const ip = getClientIp(req);
  const now = Date.now();
  const cutoff = now - windowMs;

  const timestamps = requestLog.get(ip) || [];
  const recent = timestamps.filter((t) => t > cutoff);
  recent.push(now);
  requestLog.set(ip, recent);

  if (recent.length > maxRequests) {
    const retryAfter = Math.ceil(windowMs / 1000);
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      },
    );
  }

  return null;
}
