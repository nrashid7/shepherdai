import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { extractToolArguments, generateJson } from "../_shared/ai.ts";
import { createServiceRoleClient, getAppEnv } from "../_shared/env.ts";
import { AppError, jsonResponse, toErrorResponse } from "../_shared/errors.ts";
import { getRelevantVersesForTheme } from "../_shared/retrieval.ts";
import { parsePrayerRequest, validatePrayerAiOutput } from "../_shared/schema.ts";

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  const rateLimitResp = checkRateLimit(req);
  if (rateLimitResp) return rateLimitResp;

  try {
    const env = getAppEnv();
    const { emotion, topic } = parsePrayerRequest(await req.json());
    const seed = emotion || topic || "general";

    const sb = createServiceRoleClient(env);
    const supportingScriptures = await getRelevantVersesForTheme(sb, seed, { limit: 7 });
    if (supportingScriptures.length === 0) {
      throw new AppError(404, "scripture_not_found", "No supporting scripture found for this request");
    }

    const scriptureBlock = supportingScriptures
      .slice(0, 7)
      .map((s) => `- ${s.reference}: "${s.text}"`)
      .join("\n");

    const aiPayload = await generateJson<unknown>(env, {
      model: env.modelPolicy.prayer,
      messages: [
        {
          role: "system",
          content:
            "You write pastoral prayers grounded in the provided scripture list. Use only provided verses as sources and do not invent scripture.",
        },
        {
          role: "user",
          content:
            `Topic: ${topic || "not provided"}\nEmotion: ${emotion || "not provided"}\n` +
            `Supporting scripture from database:\n${scriptureBlock}\n\n` +
            "Return JSON with {topic, emotion, prayer, encouragement}.",
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "generate_prayer_payload",
          description: "Return prayer response fields only",
          parameters: {
            type: "object",
            properties: {
              topic: { type: "string" },
              emotion: { type: "string" },
              prayer: { type: "string" },
              encouragement: { type: "string" },
            },
            required: ["prayer", "encouragement"],
            additionalProperties: false,
          },
        },
      }],
      toolChoice: { type: "function", function: { name: "generate_prayer_payload" } },
    });

    let aiResult: { topic?: string; emotion?: string; prayer: string; encouragement: string } | null = null;
    try {
      const raw = extractToolArguments<unknown>(aiPayload);
      aiResult = validatePrayerAiOutput(raw || {});
    } catch (e) {
      console.warn("prayer AI failed; returning DB-authoritative fallback:", e);
    }

    const leadVerse = supportingScriptures[0];
    const fallbackPrayer =
      `God, You see my heart today.\n\n` +
      `As I reflect on ${leadVerse?.reference || "Your Word"}, help me lean on Your presence and promises. ` +
      `Give me peace, wisdom, and courage for the next step.\n\n` +
      `Amen.`;
    const fallbackEncouragement =
      `Take a slow breath and return to ${leadVerse?.reference || "scripture"}. ` +
      `You are not alone, and you can bring this honestly to God.`;

    return jsonResponse({
      topic: aiResult?.topic || topic || seed,
      emotion: aiResult?.emotion || emotion || null,
      supportingScriptures: supportingScriptures.slice(0, 7),
      prayer: aiResult?.prayer || fallbackPrayer,
      encouragement: aiResult?.encouragement || fallbackEncouragement,
    });
  } catch (e) {
    return toErrorResponse(e);
  }
});
