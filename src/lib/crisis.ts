const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "self-harm",
  "self harm", "don't want to live", "want to die", "hurting myself",
  "no reason to live", "better off dead",
];

export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((k) => lower.includes(k));
}
