import { createReadStream, existsSync, readFileSync, writeFileSync } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedDir = join(root, "supabase", "seed");
const checkpointPath = join(seedDir, ".checkpoint.json");
const expected = { bible_verses: 31102, cross_references: 341542, study_notes: 765 };
const batchSize = Number(process.env.SEED_BATCH_SIZE || 500);

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') { value += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { values.push(value); value = ""; }
    else value += char;
  }
  values.push(value);
  return values;
}

async function readRows(file, columns) {
  const rows = [];
  const lines = createInterface({ input: createReadStream(join(seedDir, file)).pipe(createGunzip()), crlfDelay: Infinity });
  let first = true;
  for await (const line of lines) {
    if (first) { first = false; continue; }
    if (!line) continue;
    const values = parseCsvLine(line);
    rows.push(Object.fromEntries(columns.map((column, index) => [column, values[index]])));
  }
  return rows;
}

function checkpoint() {
  if (!existsSync(checkpointPath)) return { target: url };
  const state = JSON.parse(readFileSync(checkpointPath, "utf8"));
  return state.target === url ? state : { target: url };
}

function saveCheckpoint(value) {
  writeFileSync(checkpointPath, `${JSON.stringify({ ...value, target: url }, null, 2)}\n`);
}

async function requestEmbeddings(input) {
  const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000);
  const maxRetries = Number(process.env.AI_REQUEST_MAX_RETRIES || 2);
  const model = process.env.OPENROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small";
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        signal: controller.signal,
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json", "HTTP-Referer": "https://shepherdai.app", "X-Title": "Shepherd AI" },
        body: JSON.stringify({ model, dimensions: 768, input }),
      });
      if (response.ok) return response.json();
      const details = await response.text();
      if (response.status < 500 && response.status !== 429) throw new Error(`OpenRouter embeddings failed (${response.status}): ${details}`);
      if (attempt === maxRetries) throw new Error(`OpenRouter embeddings failed (${response.status}): ${details}`);
    } catch (error) {
      if (attempt === maxRetries) throw error;
    } finally {
      clearTimeout(timeout);
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }
  throw new Error("Embedding request exhausted retries");
}

async function seedTable(table, file, columns, transform) {
  const rows = (await readRows(file, columns)).map(transform);
  if (rows.length !== expected[table]) throw new Error(`${table}: expected ${expected[table]} rows, found ${rows.length}`);
  const state = checkpoint();
  let offset = state[table] || 0;
  while (offset < rows.length) {
    const { error } = await supabase.from(table).upsert(rows.slice(offset, offset + batchSize));
    if (error) throw error;
    offset = Math.min(offset + batchSize, rows.length);
    saveCheckpoint({ ...checkpoint(), [table]: offset });
    console.log(`${table}: ${offset}/${rows.length}`);
  }
}

async function embedVerses() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is required for embeddings");
  let offset = checkpoint().embeddings || 0;
  while (offset < expected.bible_verses) {
    const { data, error } = await supabase.from("bible_verses").select("id,book,chapter,verse_number,text").order("id").range(offset, offset + 99);
    if (error) throw error;
    if (!data?.length) break;
    const payload = await requestEmbeddings(data.map((row) => row.text));
    const vectors = payload.data?.sort((a, b) => a.index - b.index).map((item) => item.embedding);
    if (!vectors || vectors.length !== data.length || vectors.some((vector) => vector.length !== 768 || vector.some((n) => !Number.isFinite(n)))) {
      throw new Error("OpenRouter returned an invalid embedding batch");
    }
    const { error: updateError } = await supabase.from("bible_verses").upsert(data.map((row, index) => ({ ...row, embedding: vectors[index] })));
    if (updateError) throw updateError;
    offset += data.length;
    saveCheckpoint({ ...checkpoint(), embeddings: offset });
    console.log(`embeddings: ${offset}/${expected.bible_verses}`);
  }
}

async function validate() {
  for (const [table, count] of Object.entries(expected)) {
    const { count: actual, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) throw error;
    if (actual !== count) throw new Error(`${table}: expected ${count}, found ${actual}`);
  }
  const { count: embedded, error } = await supabase.from("bible_verses").select("*", { count: "exact", head: true }).not("embedding", "is", null);
  if (error) throw error;
  if (embedded !== expected.bible_verses) throw new Error(`embeddings: expected ${expected.bible_verses}, found ${embedded}`);
  console.log("Reference-data validation passed.");
}

const mode = process.argv[2] || "all";
if (mode === "data" || mode === "all") {
  await seedTable("bible_verses", "bible_verses.csv.gz", ["id", "book", "chapter", "verse_number", "text", "embedding", "fts"], (r) => ({ id: r.id, book: r.book, chapter: Number(r.chapter), verse_number: Number(r.verse_number), text: r.text }));
  await seedTable("cross_references", "cross_references.csv.gz", ["id", "from_verse", "to_verse", "weight"], (r) => ({ ...r, weight: Number(r.weight) }));
  await seedTable("study_notes", "study_notes.csv.gz", ["id", "verse_reference", "note_text"], (r) => r);
}
if (mode === "embeddings" || mode === "all") await embedVerses();
if (mode === "validate" || mode === "all") await validate();
