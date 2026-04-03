export interface ExtractedMemory {
  themes: string[];
  concerns: string[];
  spiritualGoals: string[];
  verses: string[];
  confidence: number;
}

export interface ChatMemoryContext {
  theme: string;
  verse_reference: string;
  frequency: number;
  note?: string | null;
  confidence?: number | null;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
}
