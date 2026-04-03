import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type ModelPolicy = {
  chat: string;
  prayer: string;
  devotional: string;
  verseContext: string;
};

export type AppEnv = {
  openRouterApiKey: string;
  openRouterBaseUrl: string;
  openRouterReferer: string;
  openRouterTitle: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  requestTimeoutMs: number;
  maxRetries: number;
  modelPolicy: ModelPolicy;
};

const DEFAULT_MODELS: ModelPolicy = {
  chat: "google/gemini-3-flash-preview",
  prayer: "anthropic/claude-haiku-4.5",
  devotional: "anthropic/claude-haiku-4.5",
  verseContext: "google/gemini-3-flash-preview",
};

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function getAppEnv(): AppEnv {
  return {
    openRouterApiKey: requireEnv("OPENROUTER_API_KEY"),
    openRouterBaseUrl: Deno.env.get("OPENROUTER_BASE_URL") || "https://openrouter.ai/api/v1/chat/completions",
    openRouterReferer: Deno.env.get("OPENROUTER_HTTP_REFERER") || "https://shepherdai.app",
    openRouterTitle: Deno.env.get("OPENROUTER_X_TITLE") || "Shepherd AI",
    supabaseUrl: requireEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    requestTimeoutMs: Number(Deno.env.get("AI_REQUEST_TIMEOUT_MS") || 25000),
    maxRetries: Number(Deno.env.get("AI_REQUEST_MAX_RETRIES") || 1),
    modelPolicy: {
      chat: Deno.env.get("MODEL_CHAT") || DEFAULT_MODELS.chat,
      prayer: Deno.env.get("MODEL_PRAYER") || DEFAULT_MODELS.prayer,
      devotional: Deno.env.get("MODEL_DEVOTIONAL") || DEFAULT_MODELS.devotional,
      verseContext: Deno.env.get("MODEL_VERSE_CONTEXT") || DEFAULT_MODELS.verseContext,
    },
  };
}

export function createServiceRoleClient(env: AppEnv) {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
}
