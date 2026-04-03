import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsHeaders } from "../_shared/cors.ts";
import { streamText } from "../_shared/ai.ts";
import { getAppEnv, createServiceRoleClient } from "../_shared/env.ts";
import { jsonResponse, toErrorResponse } from "../_shared/errors.ts";
import { parseChatRequest } from "../_shared/schema.ts";
import { getCrossReferences, getStudyNotes, searchVersesByQuery } from "../_shared/retrieval.ts";

const BASE_SYSTEM_PROMPT = `You are Shepherd AI, a scripture-grounded Christian companion.

Scripture authority policy:
- Treat retrieved scripture content as authoritative.
- Do not invent verse text or references.
- If uncertain, state uncertainty instead of fabricating.

Output requirements:
1. Brief compassionate acknowledgement
2. 2-3 scripture passages with accurate references and exact wording
3. Explanation grounded in those passages
4. 1-2 related cross references
5. One reflection question
6. One short prayer

Safety:
- Never claim to speak as God.
- Never provide medical or psychological advice.
- If user expresses crisis/self-harm risk, compassionately encourage immediate support from trusted people and local crisis services.`;

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  try {
    const env = getAppEnv();
    const body = await req.json();
    const { messages, user_memories } = parseChatRequest(body);
    const sb = createServiceRoleClient(env);

    let ragContext = "";
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    if (lastUserMsg) {
      try {
        const verses = await searchVersesByQuery(sb, lastUserMsg, { limit: 5 });
        if (verses.length > 0) {
          const refs = verses.map((v) => `${v.book} ${v.chapter}:${v.verse_number}`);
          const crossRefCollections = await Promise.all(refs.map((r) => getCrossReferences(sb, r)));
          const noteCollections = await Promise.all(refs.map((r) => getStudyNotes(sb, r)));
          ragContext = "\n\n--- AUTHORITATIVE SCRIPTURE CONTEXT (DATABASE) ---\n";
          for (const verse of verses) {
            ragContext += `${verse.book} ${verse.chapter}:${verse.verse_number} — "${verse.text}"\n`;
          }
          const crossRefs = crossRefCollections.flat();
          if (crossRefs.length > 0) {
            ragContext += "\nRelated cross-references:\n";
            for (const cr of crossRefs.slice(0, 12)) {
              ragContext += `- ${cr.from_verse} -> ${cr.to_verse}\n`;
            }
          }
          const notes = noteCollections.flat();
          if (notes.length > 0) {
            ragContext += "\nStudy notes:\n";
            for (const note of notes.slice(0, 10)) {
              ragContext += `- ${note.verse_reference}: ${note.note_text}\n`;
            }
          }
          ragContext += "--- END AUTHORITATIVE CONTEXT ---\n";
        }
      } catch (error) {
        console.error("Non-fatal chat retrieval error:", error);
      }
    }

    let memoryContext = "";
    if (user_memories && user_memories.length > 0) {
      memoryContext = "\n\n--- USER MEMORY CONTEXT ---\n";
      for (const memory of user_memories) {
        memoryContext += `- ${memory.theme}: ${memory.verse_reference} (${memory.frequency}x)\n`;
      }
      memoryContext += "--- END USER MEMORY ---\n";
    }

    const response = await streamText(env, {
      model: env.modelPolicy.chat,
      messages: [
        { role: "system", content: BASE_SYSTEM_PROMPT + ragContext + memoryContext },
        ...messages,
      ],
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
});
