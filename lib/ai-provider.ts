// Abstraction layer for the AI provider used to generate words, definitions
// and helper questions. Currently backed by Gemini via the Vercel AI Gateway,
// but the contract is intentionally minimal so it can be swapped for any other
// provider (OpenAI, Claude, a local model, etc.) without touching the UI.

export interface GeneratedRound {
  word: string
  definition: string
  questions: string[]
}

export interface AIProvider {
  /** Generate a fresh secret word + definition + helper questions. */
  generateRound(opts?: { difficulty?: "easy" | "medium" | "hard" }): Promise<GeneratedRound>
  /** Given a word (e.g. typed by the host), generate definition + questions for it. */
  generateForWord(word: string): Promise<Omit<GeneratedRound, "word">>
}

// Model used for all generations. The Vercel AI Gateway zero-config
// supports Google Gemini models, so no API key is required.
export const GEMINI_MODEL = "google/gemini-3-flash"
