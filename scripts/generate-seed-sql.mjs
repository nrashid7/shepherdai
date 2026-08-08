import { createReadStream, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedDir = join(root, "supabase", "seed");
const outputDir = join(root, ".seed-sql");
const batchSize = Number(process.env.SEED_SQL_BATCH_SIZE || 5000);

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

async function rows(file, columns, transform) {
  const result = [];
  const lines = createInterface({ input: createReadStream(join(seedDir, file)).pipe(createGunzip()), crlfDelay: Infinity });
  let first = true;
  for await (const line of lines) {
    if (first) { first = false; continue; }
    if (!line) continue;
    const values = parseCsvLine(line);
    result.push(transform(Object.fromEntries(columns.map((column, index) => [column, values[index]]))));
  }
  return result;
}

function emit(table, data, definition, columns) {
  for (let offset = 0; offset < data.length; offset += batchSize) {
    const batch = data.slice(offset, offset + batchSize);
    const index = String(offset / batchSize).padStart(4, "0");
    const sql = `insert into public.${table} (${columns.join(", ")})\n` +
      `select ${columns.join(", ")} from jsonb_to_recordset($seed$${JSON.stringify(batch)}$seed$::jsonb) as x(${definition})\n` +
      `on conflict (id) do update set ${columns.filter((column) => column !== "id").map((column) => `${column} = excluded.${column}`).join(", ")};\n`;
    writeFileSync(join(outputDir, `${table}-${index}.sql`), sql);
  }
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

emit("bible_verses", await rows("bible_verses.csv.gz", ["id", "book", "chapter", "verse_number", "text", "embedding", "fts"], (r) => ({ id: r.id, book: r.book, chapter: Number(r.chapter), verse_number: Number(r.verse_number), text: r.text })), "id uuid, book text, chapter integer, verse_number integer, text text", ["id", "book", "chapter", "verse_number", "text"]);
emit("cross_references", await rows("cross_references.csv.gz", ["id", "from_verse", "to_verse", "weight"], (r) => ({ id: r.id, from_verse: r.from_verse, to_verse: r.to_verse, weight: Number(r.weight) })), "id uuid, from_verse text, to_verse text, weight integer", ["id", "from_verse", "to_verse", "weight"]);
emit("study_notes", await rows("study_notes.csv.gz", ["id", "verse_reference", "note_text"], (r) => r), "id uuid, verse_reference text, note_text text", ["id", "verse_reference", "note_text"]);

console.log(`Generated SQL batches in ${outputDir}`);
