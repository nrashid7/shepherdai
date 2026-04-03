import { AppEnv } from "./env.ts";
import { AppError, mapProviderStatus } from "./errors.ts";

type OpenRouterMessage = { role: "system" | "user" | "assistant"; content: string };

type OpenRouterOptions = {
  model: string;
  messages: OpenRouterMessage[];
  stream?: boolean;
  tools?: unknown[];
  toolChoice?: unknown;
  temperature?: number;
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: { retries?: number; retryDelayMs?: number },
): Promise<T> {
  const retries = options?.retries ?? 1;
  const retryDelayMs = options?.retryDelayMs ?? 300;
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs * (attempt + 1)));
      attempt += 1;
    }
  }
  throw lastError;
}

async function openRouterRequest(env: AppEnv, options: OpenRouterOptions): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.requestTimeoutMs);
  try {
    return await fetch(env.openRouterBaseUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.openRouterReferer,
        "X-Title": env.openRouterTitle,
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        stream: options.stream ?? false,
        tools: options.tools,
        tool_choice: options.toolChoice,
        temperature: options.temperature,
      }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AppError(504, "ai_timeout", "AI request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function streamText(env: AppEnv, options: OpenRouterOptions): Promise<Response> {
  return withRetry(async () => {
    const response = await openRouterRequest(env, { ...options, stream: true });
    if (!response.ok || !response.body) {
      const body = await response.text();
      console.error("OpenRouter stream error:", response.status, body);
      throw mapProviderStatus(response.status);
    }
    return response;
  }, { retries: env.maxRetries });
}

export async function generateText(env: AppEnv, options: OpenRouterOptions): Promise<string> {
  const data = await generateJson<Record<string, unknown>>(env, options);
  const message = extractMessageContent(data);
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  throw new AppError(500, "invalid_ai_output", "AI returned empty text content");
}

export function safeParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function generateJson<T>(env: AppEnv, options: OpenRouterOptions): Promise<T> {
  const response = await withRetry(async () => {
    const res = await openRouterRequest(env, options);
    if (!res.ok) {
      const body = await res.text();
      console.error("OpenRouter error:", res.status, body);
      throw mapProviderStatus(res.status);
    }
    return res;
  }, { retries: env.maxRetries });

  const data = await response.json();
  return data as T;
}

export function extractToolArguments<T>(payload: unknown): T | null {
  const toolArgs = extractToolArgs(payload);
  if (typeof toolArgs === "string") {
    const parsed = safeParseJson<T>(toolArgs);
    if (parsed) return parsed;
  }

  const content = extractMessageContent(payload);
  if (typeof content === "string") {
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const target = fenced ? fenced[1].trim() : content.trim();
    const parsed = safeParseJson<T>(target);
    if (parsed) return parsed;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function extractMessageContent(payload: unknown): unknown {
  const root = asRecord(payload);
  const choices = Array.isArray(root.choices) ? root.choices : [];
  const first = asRecord(choices[0]);
  const message = asRecord(first.message);
  return message.content;
}

function extractToolArgs(payload: unknown): unknown {
  const root = asRecord(payload);
  const choices = Array.isArray(root.choices) ? root.choices : [];
  const first = asRecord(choices[0]);
  const message = asRecord(first.message);
  const toolCalls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
  const tool = asRecord(toolCalls[0]);
  const fn = asRecord(tool.function);
  return fn.arguments;
}
