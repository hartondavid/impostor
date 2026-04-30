// Core entity types for the multiplayer word-guessing game.

export type RoomStatus = "waiting" | "ready" | "in_progress" | "round_finished"

export type WordSource = "manual" | "gemini"

export interface Player {
  id: string
  name: string
  avatarColor: string // tailwind-friendly accent for the avatar
  isHost: boolean
  isGuesser: boolean
  connected: boolean
  // Aggregated score across rounds (won rounds as guesser or assist)
  score: number
}

export interface QuestionItem {
  id: string
  // The hint/question shown to the guesser to help them deduce the word
  text: string
  // Optional short definition or category attached to the hint
  hint?: string
  used: boolean
  skipped: boolean
}

export interface AnswerEntry {
  id: string
  // The guesser's question to a specific player
  question: string
  // The id of the player it was directed to
  toPlayerId: string
  // Players answer verbally (out loud) — no written answer is stored.
  createdAt: number
}

export interface Round {
  id: string
  // The secret word for this round
  word: string
  source: WordSource
  // Short definition (often AI generated) shared with non-guessers
  definition?: string
  // The id of the player who is the guesser this round
  guesserId: string
  // Generated hints/questions visible to the guesser
  questions: QuestionItem[]
  // Index of the current visible question for the guesser
  currentQuestionIndex: number
  // Q&A history during the round
  history: AnswerEntry[]
  // The guesser's submitted final guess (if any)
  finalGuess?: string
  // Whether the guesser won this round
  won?: boolean
  startedAt: number
  endedAt?: number
}

export interface Room {
  code: string
  hostId: string
  status: RoomStatus
  players: Player[]
  currentRound?: Round
  // History of completed rounds
  pastRounds: Round[]
  createdAt: number
}

// Which screen the local viewer is currently rendering.
export type Screen =
  | "landing"
  | "lobby"
  | "host_setup"
  | "in_game"
  | "round_result"

// In our demo the same browser can switch perspective between roles.
export type ViewAs = "host" | "guesser" | "player"
