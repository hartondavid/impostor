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

// Fallback word + question set used when Gemini is unavailable. Words are
// Romanian verbs (acțiuni). The verb itself is replaced with conjugated
// forms of the codename "a tipota" inside each question.
export const FALLBACK_WORDS: Array<{
  word: string
  definition: string
  questions: string[]
}> = [
  {
    word: "a alerga",
    definition: "O activitate fizică în care te deplasezi rapid pe jos.",
    questions: [
      "Îți place să tipotezi?",
      "Tipotezi des în timpul săptămânii?",
      "Ai tipotat ieri?",
      "Tipotezi singur sau cu prietenii?",
      "Ai tipota și pe ploaie?",
      "De ce tipotezi de obicei?",
    ],
  },
  {
    word: "a dansa",
    definition: "Te miști în ritmul muzicii, de unul singur sau cu altcineva.",
    questions: [
      "Tipotezi când auzi muzică?",
      "Ai tipotat la o nuntă vreodată?",
      "Tipotezi mai bine singur sau în pereche?",
      "Ai vrea să înveți să tipotezi mai bine?",
      "Tipotezi și acasă, fără public?",
      "Tipotezi pe orice gen de muzică?",
    ],
  },
  {
    word: "a găti",
    definition: "Pregătești mâncare folosind ingrediente, foc și diverse ustensile.",
    questions: [
      "Îți place să tipotezi acasă?",
      "Ai tipotat azi?",
      "Tipotezi pentru tine sau pentru alții?",
      "Tipotezi după rețete sau improvizezi?",
      "Cât de des tipotezi într-o săptămână?",
      "Ai tipota pentru o cină romantică?",
    ],
  },
  {
    word: "a citi",
    definition: "Parcurgi un text pentru a înțelege ideile autorului.",
    questions: [
      "Tipotezi în pat seara?",
      "Ai tipotat ceva interesant săptămâna asta?",
      "Tipotezi pe hârtie sau pe ecran?",
      "Tipotezi în liniște sau cu muzică?",
      "Ai tipotat vreodată o noapte întreagă?",
      "Tipotezi și ficțiune, și non-ficțiune?",
    ],
  },
  {
    word: "a cânta",
    definition: "Produci sunete muzicale folosind vocea sau un instrument.",
    questions: [
      "Tipotezi sub duș?",
      "Ai tipotat vreodată în public?",
      "Tipotezi mai mult singur sau cu alții?",
      "Tipotezi când ești fericit?",
      "Ai tipota la karaoke?",
      "Ai tipotat azi cel puțin o dată?",
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

// Used to generate a friendly room code like "WORD-3F2A"
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Compares a guess to the secret verb. Lenient: ignores the leading
// particle "a ", whitespace, case, and trailing punctuation.
export function isCorrectVerbGuess(guess: string, secret: string): boolean {
  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/^a\s+/, "")
      .replace(/[\s.,!?]+$/, "")
  return normalize(guess) === normalize(secret)
}
