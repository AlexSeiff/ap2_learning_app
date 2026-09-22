// Datenmodell der Lern-App – wird von Server, Client und Tests gemeinsam genutzt.

export interface Section {
  id: string;
  title: string;
  level: number;
  markdown: string;
}

export type CardType = 'wissen' | 'abgrenzung' | 'rechnung' | 'anwendung' | 'falle';

export interface Flashcard {
  id: string;
  /** Deep Dive, zu dem die Karte gehört (fehlt bei Decks ohne eigenen Deep Dive, z. B. WiSo). */
  topicId?: string;
  kind: 'prueferfrage' | 'fachgespraech' | 'lernkarte';
  question: string;
  answer?: string;
  /** Nur Lernkarten aus der JSON-Datei: */
  deckId?: string;
  typ?: CardType;
  schwierigkeit?: number;
  tags?: string[];
}

export interface Deck {
  id: string;
  title: string;
  area: string;
  source: string;
  status: 'behandelt' | 'offen';
  topicId?: string;
  cardCount: number;
}

export interface Solution {
  markdown: string;
  /** Text des „Prüferkommentar"-Absatzes (Punktevergabe), falls vorhanden. */
  kommentar?: string;
  /** Bewertungskriterien aus einer Punktetabelle (| Element | P |), falls vorhanden. */
  criteria?: { label: string; points: number }[];
}

/** Alle Aufgabentypen – auch Grundlage für die zod-Prüfung der API-Anfragen. */
export const TASK_TYPES = ['offen', 'mc', 'lueckentext', 'zuordnung', 'rechnen'] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export interface Task {
  /** Global eindeutig, z. B. „01-A1" oder „gen-…". */
  id: string;
  /** Aufgabennummer wie auf dem Blatt, z. B. „A1". */
  code: string;
  topicId: string;
  block: string;
  points: number;
  markdown: string;
  solution?: Solution;
  type: TaskType;
  generated?: boolean;
  /** Nur für automatisch bewertbare (KI-generierte) Aufgaben. */
  auto?: AutoCheck;
}

export interface AutoCheck {
  options?: string[];
  correct?: number[];
  blanks?: string[];
  pairs?: { left: string; right: string }[];
  numeric?: { value: number; tolerance: number; unit?: string };
}

export interface ExamBlock {
  letter: string;
  title: string;
  points: number;
  intro: string;
  taskIds: string[];
}

export interface Exam {
  title: string;
  intro: string;
  /** Anlagen / Ausgangslage / Übungsdatenbank, die während der Klausur sichtbar sind. */
  attachments: Section[];
  blocks: ExamBlock[];
  totalPoints: number;
}

export interface Topic {
  id: string;
  number: number;
  title: string;
  week?: string;
  file: string;
  solutionFile?: string;
  sections: Section[];
  exam?: Exam;
  lernziele: string[];
}

export interface MaterialDoc {
  id: string;
  title: string;
  file: string;
  markdown: string;
}

export interface WeekPlan {
  kw: number;
  label: string;
  text: string;
}

export interface ImportIssue {
  file: string;
  message: string;
}

export interface Content {
  importedAt: string;
  topics: Topic[];
  tasks: Record<string, Task>;
  flashcards: Flashcard[];
  decks: Deck[];
  /** Lernhinweise aus der Lernkarten-Datei (meta.hinweise). */
  cardHints: string[];
  materials: MaterialDoc[];
  weeks: WeekPlan[];
  issues: ImportIssue[];
}
