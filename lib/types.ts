// Core entity types for The Impostor — a social deduction party game.

export type RoomStatus = "waiting" | "ready" | "in_progress" | "voting" | "round_finished"

export type WordSource = "manual" | "random"

export interface Player {
  id: string
  name: string
  avatarColor: string // tailwind-friendly accent for the avatar
  isHost: boolean
  isImpostor: boolean
  connected: boolean
  // Aggregated score across rounds
  score: number
  // Tracks whether this player has already been the impostor in the current cycle
  hasBeenImpostor: boolean
  isSpectator?: boolean
}

export interface WordPack {
  id: string
  // The emoji/icon for the category
  emoji: string
  // The category name (shown to Impostor as their only clue)
  category: string
  // The specific secret word (shown to all players except the Impostor)
  word: string
}

export interface SpokenWord {
  id: string
  playerId: string
  text: string
  timestamp: number
}

export interface Round {
  id: string
  // The secret word for this round
  word: string
  // The category (shown to the Impostor as a clue)
  category: string
  // The emoji for the category
  categoryEmoji: string
  source: WordSource
  language?: "en" | "ro"
  // The id of the player who is the Impostor this round
  impostorId: string
  // Votes map: voterId -> targetId
  votes: Record<string, string>
  // Log of words/clues spoken during the round
  spokenWords: SpokenWord[]
  // Whether voting phase is active
  votingOpen: boolean
  // Whether the impostor correctly guessed the word at the end
  impostorGuessedWord?: boolean
  // The Impostor's last-chance guess text
  impostorGuess?: string
  // Whether the players caught the Impostor (majority vote)
  impostorCaught?: boolean
  startedAt: number
  endedAt?: number
}

export interface Room {
  code: string
  hostId: string
  // The player who created the room
  firstHostId: string
  status: RoomStatus
  players: Player[]
  currentRound?: Round
  // History of completed rounds
  pastRounds: Round[]
  createdAt: number
  roundSkipped?: boolean
}

// Which screen the local viewer is currently rendering.
export type Screen =
  | "landing"
  | "lobby"
  | "host_setup"
  | "in_game"
  | "voting"
  | "round_result"

// In our demo the same browser can switch perspective between roles.
export type ViewAs = "host" | "impostor" | "player" | "spectator"
