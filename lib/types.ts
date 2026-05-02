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
  // Tracks whether this player has already been the guesser in the current cycle
  hasBeenGuesser: boolean
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
  // Whether the guesser won this round
  won?: boolean
  startedAt: number
  endedAt?: number
}

export interface Room {
  code: string
  hostId: string
  // The player who created the room — they can never become a guesser
  firstHostId: string
  status: RoomStatus
  players: Player[]
  currentRound?: Round
  // History of completed rounds
  pastRounds: Round[]
  createdAt: number
  // When true, the next newRound() call keeps the current guesser unchanged (host skipped the round)
  roundSkipped?: boolean
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
