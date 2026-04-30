import type { Player, QuestionItem } from "./types"

// Pool of fun mock player names used to populate a room when the
// real-time backend is not connected. Keeps the demo feeling alive.
export const MOCK_NAMES = [
  "Maya",
  "Leo",
  "Iris",
  "Noah",
  "Zara",
  "Finn",
  "Aria",
  "Eli",
  "Nova",
  "Theo",
]

// Avatar accent colors – kept minimal & on-brand (lime / amber / coral / muted).
const AVATAR_COLORS = [
  "var(--primary)",
  "var(--accent)",
  "var(--destructive)",
  "var(--muted-foreground)",
]

export function makeMockPlayer(
  index: number,
  overrides: Partial<Player> = {},
): Player {
  return {
    id: `p_${Math.random().toString(36).slice(2, 9)}`,
    name: MOCK_NAMES[index % MOCK_NAMES.length],
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    isHost: false,
    isGuesser: false,
    connected: true,
    score: 0,
    ...overrides,
  }
}

// Fallback word + question set used when Gemini is unavailable.
// Keeps the game playable in offline/demo mode.
export const FALLBACK_WORDS: Array<{
  word: string
  definition: string
  questions: string[]
}> = [
  {
    word: "lighthouse",
    definition: "A tall structure on the coast that emits light to guide ships.",
    questions: [
      "Is it found near the ocean?",
      "Does it provide guidance or direction?",
      "Is it usually tall and cylindrical?",
      "Does it produce light?",
      "Is it often associated with sailors or ships?",
      "Can it be a tourist attraction?",
    ],
  },
  {
    word: "telescope",
    definition: "An instrument used to observe distant objects, especially in space.",
    questions: [
      "Is it used to look at something far away?",
      "Is it commonly used at night?",
      "Does it involve lenses or mirrors?",
      "Is it associated with science or astronomy?",
      "Can it be handheld or mounted?",
      "Has it been used for centuries?",
    ],
  },
  {
    word: "volcano",
    definition: "A mountain or hill with a vent through which lava and gases erupt.",
    questions: [
      "Is it a natural geological feature?",
      "Can it be dangerous?",
      "Does it involve heat?",
      "Is it usually shaped like a mountain?",
      "Has it shaped islands and continents?",
      "Are there active examples around the world?",
    ],
  },
  {
    word: "compass",
    definition: "An instrument with a magnetized needle that shows direction.",
    questions: [
      "Is it a small handheld tool?",
      "Does it help you find your way?",
      "Does it use magnetism?",
      "Is it useful for hikers or sailors?",
      "Does it always point in a specific direction?",
      "Has it been used for navigation for centuries?",
    ],
  },
]

export function makeQuestionItems(texts: string[]): QuestionItem[] {
  return texts.map((text, i) => ({
    id: `q_${i}_${Math.random().toString(36).slice(2, 6)}`,
    text,
    used: false,
    skipped: false,
  }))
}

// Lightweight Q&A simulation – when a guesser asks a player something,
// we generate a plausible "yes / no / kind of" answer based on the word.
// In a real app this would come from the actual player.
export function simulateAnswer(question: string, word: string): string {
  const q = question.toLowerCase()
  const w = word.toLowerCase()
  if (q.includes(w)) return "Yes — but I can't say that out loud!"
  if (q.startsWith("is it") || q.startsWith("does it") || q.startsWith("can it")) {
    // 70% yes, 20% kind of, 10% no
    const r = Math.random()
    if (r < 0.7) return "Yes."
    if (r < 0.9) return "Kind of."
    return "No."
  }
  return "Hmm, sort of — think about it differently."
}

// Used to generate a friendly room code like "WORD-3F2A"
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
