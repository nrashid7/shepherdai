import { corsHeaders } from "./cors.ts";

/**
 * Validates admin access via the X-Admin-Secret header.
 * Returns a 401 Response if unauthorized, or null if authorized.
 * Requires the ADMIN_SECRET env var to be set.
 */
export function requireAdmin(req: Request): Response | null {
  const secret = Deno.env.get("ADMIN_SECRET");
  if (!secret) {
    return new Response(
      JSON.stringify({ error: "ADMIN_SECRET is not configured on this deployment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const provided = req.headers.get("x-admin-secret");
  if (provided !== secret) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: invalid or missing admin secret" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return null;
}
