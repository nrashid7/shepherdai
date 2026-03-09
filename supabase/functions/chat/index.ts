import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_SYSTEM_PROMPT = `You are a Bible-based assistant called Shepherd AI that explains scripture and helps users reflect spiritually.

You must only use real Bible verses. Never invent or fabricate Bible verses.
Always cite verse references accurately (e.g., "Isaiah 41:10").
Explain context and connect passages using cross-references.
Speak with compassion and encouragement.
Never claim to speak as God.
Never provide medical or psychological advice.

If a user expresses crisis signals or self-harm, respond compassionately and encourage contacting a trusted friend, pastor, family member, or crisis helpline.

Every response must follow this structure:
1. **Acknowledgement** - Briefly acknowledge the user's situation with compassion
2. **Scripture Passages** - Provide 2-3 relevant Bible verses with full reference and text, formatted as blockquotes
3. **Explanation** - Explain the passages and how they relate to the user's situation
4. **Cross-References** - Mention 1-2 additional related verses
5. **Reflection Question** - Ask a thoughtful question for personal reflection
6. **Prayer** - Provide a personalized prayer grounded in the verses, formatted in italics

Format scripture references in bold. Use markdown formatting throughout.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, user_memories } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // RAG: Retrieve relevant verses using full-text search
    let ragContext = "";
    try {
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
      if (lastUserMsg) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey);

        const { data: verses } = await sb.rpc("search_verses", {
          query: lastUserMsg,
          match_count: 5,
        });

        if (verses && verses.length > 0) {
          // Get cross-references for matched verses
          const verseRefs = verses.map((v: any) => `${v.book} ${v.chapter}:${v.verse_number}`);
          const { data: crossRefs } = await sb
            .from("cross_references")
            .select("*")
            .in("from_verse", verseRefs);

          // Get study notes for matched verses
          const { data: studyNotes } = await sb
            .from("study_notes")
            .select("*")
            .in("verse_reference", verseRefs);

          ragContext = "\n\n--- RETRIEVED SCRIPTURE CONTEXT (use these as primary sources) ---\n";
          for (const v of verses) {
            ragContext += `\n${v.book} ${v.chapter}:${v.verse_number} — "${v.text}"`;
          }
          if (crossRefs && crossRefs.length > 0) {
            ragContext += "\n\nRelated cross-references:";
            for (const cr of crossRefs) {
              ragContext += `\n- ${cr.from_verse} → ${cr.to_verse}`;
            }
          }
          if (studyNotes && studyNotes.length > 0) {
            ragContext += "\n\nStudy notes:";
            for (const sn of studyNotes) {
              ragContext += `\n- ${sn.verse_reference}: ${sn.note_text}`;
            }
          }
          ragContext += "\n--- END RETRIEVED CONTEXT ---\n";
        }
      }
    } catch (ragErr) {
      console.error("RAG retrieval error (non-fatal):", ragErr);
    }

    // Inject user memories for personalization
    let memoryContext = "";
    if (user_memories && Array.isArray(user_memories) && user_memories.length > 0) {
      memoryContext = "\n\n--- USER SPIRITUAL CONTEXT ---\nThis user has previously explored these themes:";
      for (const m of user_memories) {
        memoryContext += `\n- ${m.theme}: ${m.verse_reference} (referenced ${m.frequency} times)`;
        if (m.note) memoryContext += ` — "${m.note}"`;
      }
      memoryContext += "\nYou may reference these past themes when relevant to provide continuity.\n--- END USER CONTEXT ---\n";
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + ragContext + memoryContext;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
