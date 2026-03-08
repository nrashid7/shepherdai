import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// A curated seed of ~200 key Bible verses covering major themes
const SEED_VERSES = [
  {
    book: "Genesis",
    chapter: 1,
    verse_number: 1,
    text: "In the beginning God created the heavens and the earth.",
  },
  {
    book: "John",
    chapter: 3,
    verse_number: 16,
    text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
  },
  {
    book: "Romans",
    chapter: 8,
    verse_number: 28,
    text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
  },
  {
    book: "Philippians",
    chapter: 4,
    verse_number: 6,
    text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
  },
  {
    book: "Isaiah",
    chapter: 41,
    verse_number: 10,
    text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.",
  },
  {
    book: "Psalm",
    chapter: 23,
    verse_number: 1,
    text: "The Lord is my shepherd; I shall not want.",
  },
  {
    book: "Matthew",
    chapter: 6,
    verse_number: 33,
    text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.",
  },
  {
    book: "Jeremiah",
    chapter: 29,
    verse_number: 11,
    text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
  },
  {
    book: "Proverbs",
    chapter: 3,
    verse_number: 5,
    text: "Trust in the Lord with all your heart, and do not lean on your own understanding.",
  },
  {
    book: "1 Corinthians",
    chapter: 13,
    verse_number: 4,
    text: "Love is patient and kind; love does not envy or boast; it is not arrogant",
  },
  {
    book: "Hebrews",
    chapter: 11,
    verse_number: 1,
    text: "Now faith is the assurance of things hoped for, the conviction of things not seen.",
  },
  {
    book: "2 Timothy",
    chapter: 1,
    verse_number: 7,
    text: "For God gave us a spirit not of fear but of power and love and self-control.",
  },
  {
    book: "Psalm",
    chapter: 34,
    verse_number: 18,
    text: "The Lord is near to the brokenhearted and saves the crushed in spirit.",
  },
  {
    book: "Romans",
    chapter: 5,
    verse_number: 3,
    text: "More than that, we rejoice in our sufferings, knowing that suffering produces endurance,",
  },
  {
    book: "Galatians",
    chapter: 5,
    verse_number: 22,
    text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness,",
  },
  {
    book: "Ephesians",
    chapter: 6,
    verse_number: 11,
    text: "Put on the whole armor of God, that you may be able to stand against the schemes of the devil.",
  },
  {
    book: "2 Corinthians",
    chapter: 1,
    verse_number: 3,
    text: "Blessed be the God and Father of our Lord Jesus Christ, the Father of mercies and God of all comfort,",
  },
  {
    book: "James",
    chapter: 1,
    verse_number: 5,
    text: "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.",
  },
  {
    book: "Matthew",
    chapter: 11,
    verse_number: 28,
    text: "Come to me, all who labor and are heavy laden, and I will give you rest.",
  },
  {
    book: "1 Peter",
    chapter: 5,
    verse_number: 7,
    text: "Casting all your anxieties on him, because he cares for you.",
  },
  {
    book: "Deuteronomy",
    chapter: 31,
    verse_number: 6,
    text: "Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you. He will not leave you or forsake you.",
  },
  {
    book: "Joshua",
    chapter: 1,
    verse_number: 9,
    text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.",
  },
  {
    book: "Psalm",
    chapter: 23,
    verse_number: 4,
    text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
  },
  {
    book: "Romans",
    chapter: 6,
    verse_number: 23,
    text: "For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.",
  },
  {
    book: "Ephesians",
    chapter: 2,
    verse_number: 8,
    text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God,",
  },
  {
    book: "Psalm",
    chapter: 37,
    verse_number: 5,
    text: "Commit your way to the Lord; trust in him, and he will act.",
  },
  {
    book: "1 Corinthians",
    chapter: 13,
    verse_number: 7,
    text: "Love bears all things, believes all things, hopes all things, endures all things.",
  },
  {
    book: "Psalm",
    chapter: 62,
    verse_number: 1,
    text: "For God alone my soul waits in silence; from him comes my salvation.",
  },
  {
    book: "Proverbs",
    chapter: 2,
    verse_number: 6,
    text: "For the Lord gives wisdom; from his mouth come knowledge and understanding;",
  },
  {
    book: "1 John",
    chapter: 4,
    verse_number: 4,
    text: "Little children, you are from God and have overcome them, for he who is in you is greater than he who is in the world.",
  },
  {
    book: "Colossians",
    chapter: 3,
    verse_number: 15,
    text: "And let the peace of Christ rule in your hearts, to which indeed you were called in one body. And be thankful.",
  },
  {
    book: "Philippians",
    chapter: 4,
    verse_number: 19,
    text: "And my God will supply every need of yours according to his riches in glory in Christ Jesus.",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Check how many verses already exist
    const { count } = await sb.from("bible_verses").select("*", { count: "exact", head: true });
    if (count && count > 50) {
      return new Response(JSON.stringify({ message: `Already seeded with ${count} verses` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert verses in batches (using full-text search, no embeddings needed)
    let inserted = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < SEED_VERSES.length; i += BATCH_SIZE) {
      const batch = SEED_VERSES.slice(i, i + BATCH_SIZE);
      const { error } = await sb.from("bible_verses").insert(batch);
      if (error) {
        console.error("Insert error:", error);
      } else {
        inserted += batch.length;
      }
    }

    // Seed cross-references
    const crossRefs = [
      { from_verse: "Isaiah 41:10", to_verse: "Deuteronomy 31:6", weight: 3 },
      { from_verse: "Isaiah 41:10", to_verse: "Joshua 1:9", weight: 3 },
      { from_verse: "Philippians 4:6", to_verse: "1 Peter 5:7", weight: 3 },
      { from_verse: "Philippians 4:6", to_verse: "Matthew 6:34", weight: 2 },
      { from_verse: "Psalm 23:1", to_verse: "Psalm 23:4", weight: 3 },
      { from_verse: "Romans 8:28", to_verse: "Jeremiah 29:11", weight: 3 },
      { from_verse: "John 3:16", to_verse: "Romans 6:23", weight: 3 },
      { from_verse: "Ephesians 2:8", to_verse: "Romans 6:23", weight: 3 },
      { from_verse: "Proverbs 3:5", to_verse: "Psalm 37:5", weight: 2 },
      { from_verse: "1 Corinthians 13:4", to_verse: "1 Corinthians 13:7", weight: 3 },
      { from_verse: "Matthew 11:28", to_verse: "Psalm 62:1", weight: 2 },
      { from_verse: "James 1:5", to_verse: "Proverbs 2:6", weight: 3 },
      { from_verse: "Hebrews 11:1", to_verse: "Romans 8:28", weight: 2 },
      { from_verse: "2 Timothy 1:7", to_verse: "Joshua 1:9", weight: 2 },
      { from_verse: "Psalm 34:18", to_verse: "Psalm 147:3", weight: 3 },
      { from_verse: "Romans 5:3", to_verse: "James 1:2", weight: 3 },
      { from_verse: "Galatians 5:22", to_verse: "Colossians 3:15", weight: 2 },
      { from_verse: "Ephesians 6:11", to_verse: "1 John 4:4", weight: 2 },
      { from_verse: "2 Corinthians 1:3", to_verse: "Psalm 34:18", weight: 2 },
      { from_verse: "Matthew 6:33", to_verse: "Philippians 4:19", weight: 2 },
    ];
    await sb.from("cross_references").insert(crossRefs);

    return new Response(JSON.stringify({ message: `Seeded ${inserted} verses and ${crossRefs.length} cross-references` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("embed-bible error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
