export type VerseReference = string;

export interface SupportingScripture {
  reference: VerseReference;
  text: string;
  theme: string;
}

export interface VerseContextCrossReference {
  reference: VerseReference;
  text: string;
  reason: string;
}

export interface VerseContextStudyNote {
  source: string;
  note: string;
}

export interface VerseContextResponse {
  reference: VerseReference;
  verseText: string;
  surroundingPassage: Array<{ verse: number; text: string }>;
  crossReferences: VerseContextCrossReference[];
  studyNotes: VerseContextStudyNote[];
  bookContext: string;
  explanation: string;
  lifeApplication: string;
  relatedThemes: string[];
}
