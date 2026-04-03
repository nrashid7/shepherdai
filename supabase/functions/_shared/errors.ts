import { corsHeaders } from "./cors.ts";

export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return jsonResponse({
      error: error.message,
      code: error.code,
      details: error.details ?? null,
    }, error.status);
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  console.error("Unhandled function error:", error);
  return jsonResponse({
    error: "Internal server error",
    code: "internal_error",
    details: message,
  }, 500);
}

export function mapProviderStatus(status: number): AppError {
  if (status === 429) {
    return new AppError(429, "rate_limited", "Rate limit exceeded. Please try again shortly.");
  }
  if (status === 402) {
    return new AppError(402, "usage_limit_reached", "Usage limit reached. Please add credits.");
  }
  if (status >= 500) {
    return new AppError(502, "upstream_error", "AI service is temporarily unavailable.");
  }
  return new AppError(500, "ai_service_error", "AI service error");
}
