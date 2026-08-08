import { createReadStream, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedDir = join(root, "supabase", "seed");
const manifest = JSON.parse(readFileSync(join(seedDir, "manifest.json"), "utf8"));
const oldTestament = new Set(["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalm", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"]);

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

async function sha256(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

async function inspect(file, keyFor, onRow) {
  const keys = new Set();
  let count = 0;
  const input = createInterface({ input: createReadStream(join(seedDir, file)).pipe(createGunzip()), crlfDelay: Infinity });
  let first = true;
  for await (const line of input) {
    if (first) { first = false; continue; }
    if (!line) continue;
    const row = parseCsvLine(line);
    const key = keyFor(row);
    if (keys.has(key)) throw new Error(`${file}: duplicate ${key}`);
    keys.add(key);
    count += 1;
    onRow?.(row);
  }
  return count;
}

for (const [file, expectedHash] of Object.entries(manifest.sha256)) {
  const actualHash = await sha256(join(seedDir, file));
  if (actualHash !== expectedHash) throw new Error(`${file}: checksum mismatch`);
}

let ot = 0;
let nt = 0;
const verses = await inspect("bible_verses.csv.gz", (r) => `${r[1]}:${r[2]}:${r[3]}`, (r) => oldTestament.has(r[1]) ? ot += 1 : nt += 1);
const crossReferences = await inspect("cross_references.csv.gz", (r) => `${r[1]}=>${r[2]}`);
const studyNotes = await inspect("study_notes.csv.gz", (r) => r[1]);

const actual = { bible_verses: verses, old_testament: ot, new_testament: nt, cross_references: crossReferences, study_notes: studyNotes };
for (const [name, count] of Object.entries(manifest.counts)) {
  if (actual[name] !== count) throw new Error(`${name}: expected ${count}, found ${actual[name]}`);
}
console.log(JSON.stringify(actual, null, 2));
