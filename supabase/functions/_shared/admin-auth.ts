import { corsHeaders } from "./cors.ts";
import { checkRateLimit } from "./rate-limit.ts";

const MIN_SECRET_LENGTH = 32;

const encoder = new TextEncoder();

function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  if (aBytes.byteLength !== bBytes.byteLength) {
    // Compare against self to keep constant time, then return false
    crypto.subtle.timingSafeEqual(aBytes, aBytes);
    return false;
  }

  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

/**
 * Validates admin access via the X-Admin-Secret header.
 * Returns an error Response if unauthorized, or null if authorized.
 * Requires the ADMIN_SECRET env var to be set (minimum 32 characters).
 */
export function requireAdmin(req: Request): Response | null {
  const secret = Deno.env.get("ADMIN_SECRET");
  if (!secret) {
    return new Response(
      JSON.stringify({ error: "ADMIN_SECRET is not configured on this deployment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    return new Response(
      JSON.stringify({ error: "ADMIN_SECRET is too short; minimum 32 characters required" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const adminRateResp = checkRateLimit(req, { maxRequests: 5, windowMs: 60_000 });
  if (adminRateResp) return adminRateResp;

  const provided = req.headers.get("x-admin-secret") || "";
  if (!timingSafeEqual(provided, secret)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: invalid or missing admin secret" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return null;
}
