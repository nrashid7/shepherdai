import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { extractToolArguments, generateJson } from "../_shared/ai.ts";
import { createServiceRoleClient, getAppEnv } from "../_shared/env.ts";
import { AppError, jsonResponse, toErrorResponse } from "../_shared/errors.ts";
import { getRelevantVersesForTheme } from "../_shared/retrieval.ts";
import { parseDevotionalRequest, validateDevotionalAiOutput } from "../_shared/schema.ts";

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  try {
    const env = getAppEnv();
    const { topic, days } = parseDevotionalRequest(await req.json());
    const sb = createServiceRoleClient(env);
    const supporting = await getRelevantVersesForTheme(sb, topic, { limit: Math.max(7, days * 2) });
    if (supporting.length === 0) {
      throw new AppError(404, "scripture_not_found", "No scripture results were found for this topic");
    }

    const scriptureList = supporting.slice(0, 14).map((s) => `${s.reference}: "${s.text}"`).join("\n");

    let ai: ReturnType<typeof validateDevotionalAiOutput> | null = null;
    try {
      const rawAi = await generateJson<unknown>(env, {
        model: env.modelPolicy.devotional,
        messages: [
          {
            role: "system",
            content:
              "You create devotionals using only scripture provided in the prompt. You may explain and apply but never invent scripture.",
          },
          {
            role: "user",
            content:
              `Create a ${days}-day devotional about "${topic}".\n` +
              `Use this authoritative scripture list from database only:\n${scriptureList}\n\n` +
              "Return JSON: { topic, days: [{ day, title, theme, primaryVerseReference, supportingVerseReferences, reflection, actionStep, prayer }] }",
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_devotional_payload",
            description: "Create devotional scaffold fields",
            parameters: {
              type: "object",
              properties: {
                topic: { type: "string" },
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "number" },
                      title: { type: "string" },
                      theme: { type: "string" },
                      primaryVerseReference: { type: "string" },
                      supportingVerseReferences: { type: "array", items: { type: "string" } },
                      reflection: { type: "string" },
                      actionStep: { type: "string" },
                      prayer: { type: "string" },
                    },
                    required: ["day", "title", "theme", "primaryVerseReference", "reflection", "actionStep", "prayer"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["days"],
              additionalProperties: false,
            },
          },
        }],
        toolChoice: { type: "function", function: { name: "create_devotional_payload" } },
      });

      const parsed = extractToolArguments<unknown>(rawAi);
      ai = validateDevotionalAiOutput(parsed || {});
    } catch (e) {
      console.warn("devotional AI failed; returning DB-authoritative fallback:", e);
    }

    const byRef = new Map(supporting.map((s) => [s.reference, s]));
    const devotionalDays = (ai?.days || []).slice(0, days).map((d, idx) => {
      const primary = byRef.get(d.primaryVerseReference) || supporting[idx % supporting.length];
      const supportRefs = (d.supportingVerseReferences || [])
        .map((ref) => byRef.get(ref))
        .filter((v): v is { reference: string; text: string; theme: string } => Boolean(v))
        .slice(0, 4);
      return {
        day: d.day || idx + 1,
        title: d.title,
        theme: d.theme || topic,
        primaryVerse: { reference: primary.reference, text: primary.text },
        supportingVerses: supportRefs.map((s) => ({ reference: s.reference, text: s.text })),
        reflection: d.reflection,
        actionStep: d.actionStep,
        prayer: d.prayer,
      };
    });

    const fallbackDays = Array.from({ length: days }).map((_, idx) => {
      const primary = supporting[idx % supporting.length];
      const supportingVerses = supporting.slice(idx + 1, idx + 5).map((s) => ({ reference: s.reference, text: s.text }));
      return {
        day: idx + 1,
        title: `${topic}: Day ${idx + 1}`,
        theme: topic,
        primaryVerse: { reference: primary.reference, text: primary.text },
        supportingVerses,
        reflection: `Read ${primary.reference} slowly. Consider one specific way this speaks to your life today.`,
        actionStep: "Choose one small, concrete act of faithfulness you can do today.",
        prayer: "God, guide me as I reflect on Your Word today. Help me respond with trust and obedience. Amen.",
      };
    });

    return jsonResponse({
      topic: ai?.topic || topic,
      days: devotionalDays.length > 0 ? devotionalDays : fallbackDays,
    });
  } catch (e) {
    return toErrorResponse(e);
  }
});
