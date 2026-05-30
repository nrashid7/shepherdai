import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { extractToolArguments, generateJson } from "../_shared/ai.ts";
import { createServiceRoleClient, getAppEnv } from "../_shared/env.ts";
import { AppError, jsonResponse, toErrorResponse } from "../_shared/errors.ts";
import { parseReference, toReference } from "../_shared/reference.ts";
import { findVerseByReference, getCrossReferences, getStudyNotes, getSurroundingPassage } from "../_shared/retrieval.ts";
import { parseVerseContextRequest, validateVerseContextAiOutput } from "../_shared/schema.ts";

type VerseContextResponse = {
  reference: string;
  verseText: string;
  surroundingPassage: Array<{ verse: number; text: string }>;
  crossReferences: Array<{ reference: string; text: string; reason: string }>;
  studyNotes: Array<{ source: string; note: string }>;
  bookContext: string;
  explanation: string;
  lifeApplication: string;
  relatedThemes: string[];
};

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  const rateLimitResp = checkRateLimit(req);
  if (rateLimitResp) return rateLimitResp;

  try {
    const env = getAppEnv();
    const { reference } = parseVerseContextRequest(await req.json());
    const sb = createServiceRoleClient(env);
    const parsedRef = parseReference(reference);

    const mainVerse = await findVerseByReference(sb, reference);
    if (!mainVerse) {
      throw new AppError(404, "verse_not_found", `Verse unavailable in database: ${reference}`);
    }

    const [surroundingPassage, crossRefs, studyNotes] = await Promise.all([
      getSurroundingPassage(sb, parsedRef.book, parsedRef.chapter, parsedRef.verse, 2),
      getCrossReferences(sb, toReference(parsedRef.book, parsedRef.chapter, parsedRef.verse)),
      getStudyNotes(sb, toReference(parsedRef.book, parsedRef.chapter, parsedRef.verse)),
    ]);

    const crossRefItems = await Promise.all(
      crossRefs.slice(0, 8).map(async (cr) => {
        const linkedRef = cr.from_verse === reference ? cr.to_verse : cr.from_verse;
        const linkedVerse = await findVerseByReference(sb, linkedRef);
        return {
          reference: linkedRef,
          text: linkedVerse?.text || "",
          reason: cr.weight != null ? `Cross-reference strength: ${cr.weight}` : "Related passage",
        };
      }),
    );

    let ai = { bookContext: "", explanation: "", lifeApplication: "", relatedThemes: [] as string[] };
    try {
      const aiRaw = await generateJson<unknown>(env, {
        model: env.modelPolicy.verseContext,
        messages: [
          {
            role: "system",
            content:
              "You are a Bible study assistant. Scripture is already provided from database. " +
              "Do not generate new verse text or references; only explain context and life application.",
          },
          {
            role: "user",
            content:
              `Reference: ${reference}\n` +
              `Verse text: "${mainVerse.text}"\n` +
              `Surrounding passage: ${JSON.stringify(surroundingPassage)}\n` +
              `Cross references: ${JSON.stringify(crossRefItems.map((x) => ({ reference: x.reference, text: x.text })))}\n` +
              `Study notes: ${JSON.stringify(studyNotes.map((n) => n.note_text))}\n\n` +
              "Return JSON {bookContext, explanation, lifeApplication, relatedThemes}.",
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "explain_verse_context",
            description: "Explain verse context using provided scripture",
            parameters: {
              type: "object",
              properties: {
                bookContext: { type: "string" },
                explanation: { type: "string" },
                lifeApplication: { type: "string" },
                relatedThemes: { type: "array", items: { type: "string" } },
              },
              required: ["bookContext", "explanation", "lifeApplication", "relatedThemes"],
              additionalProperties: false,
            },
          },
        }],
        toolChoice: { type: "function", function: { name: "explain_verse_context" } },
      });

      const aiParsed = extractToolArguments<unknown>(aiRaw);
      ai = validateVerseContextAiOutput(aiParsed || {});
    } catch (e) {
      console.warn("verse-context AI failed; returning DB-authoritative fallback:", e);
    }

    const payload: VerseContextResponse = {
      reference,
      verseText: mainVerse.text,
      surroundingPassage,
      crossReferences: crossRefItems,
      studyNotes: studyNotes.map((n) => ({ source: "study_notes", note: n.note_text })),
      bookContext: ai.bookContext,
      explanation: ai.explanation,
      lifeApplication: ai.lifeApplication,
      relatedThemes: ai.relatedThemes,
    };

    return jsonResponse(payload);
  } catch (e) {
    return toErrorResponse(e);
  }
});
