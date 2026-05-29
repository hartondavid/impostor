import type { Player, WordPack } from "./types"
import { WORD_PACKS_EN, getRandomWordPackEN } from "./mock-data-en"
import type { Language } from "./translations"

// Pool of fun mock player names used to populate a room when the
// real-time backend is not connected.
export const MOCK_NAMES = [
  "Maya", "Leo", "Iris", "Noah", "Zara",
  "Finn", "Aria", "Eli", "Nova", "Theo",
]

// Avatar accent colors – distinct palette for each player
const AVATAR_COLORS = [
  "#ef4444", "#3b82f6", "#22c55e", "#eab308",
  "#f97316", "#a855f7", "#ec4899", "#06b6d4",
  "#84cc16", "#8b5cf6", "#14b8a6", "#f43f5e"
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
    isImpostor: false,
    connected: true,
    score: 0,
    hasBeenImpostor: false,
    ...overrides,
  }
}

// Romanian themed word packs for The Impostor
export const WORD_PACKS_RO: WordPack[] = [
  // Locații
  { id: "plaja", category: "Locație", word: "Plajă" },
  { id: "spital",  category: "Locație", word: "Spital" },
  { id: "cazinou",  category: "Locație", word: "Cazinou" },
  { id: "submarin",  category: "Locație", word: "Submarin" },
  { id: "aeroport",  category: "Locație", word: "Aeroport" },
  { id: "inchisoare",  category: "Locație", word: "Închisoare" },
  { id: "circ",  category: "Locație", word: "Circ" },
  { id: "statie_spatiala",  category: "Locație", word: "Stație Spațială" },
  { id: "restaurant",  category: "Locație", word: "Restaurant" },
  { id: "banca",  category: "Locație", word: "Bancă" },
  { id: "muzeu",  category: "Locație", word: "Muzeu" },
  { id: "biblioteca",  category: "Locație", word: "Bibliotecă" },
  { id: "sala_sport",  category: "Locație", word: "Sală de Sport" },
  { id: "cinema",  category: "Locație", word: "Cinema" },
  { id: "ferma",  category: "Locație", word: "Fermă" },

  // Personaje / Profesii
  { id: "spion",  category: "Persoană", word: "Spion" },
  { id: "pirat",  category: "Persoană", word: "Pirat" },
  { id: "chirurg",  category: "Persoană", word: "Chirurg" },
  { id: "astronaut",  category: "Persoană", word: "Astronaut" },
  { id: "bucatar",  category: "Persoană", word: "Bucătar" },
  { id: "magician",  category: "Persoană", word: "Magician" },
  { id: "pompier",  category: "Persoană", word: "Pompier" },
  { id: "profesor",  category: "Persoană", word: "Profesor" },
  { id: "detectiv",  category: "Persoană", word: "Detectiv" },
  { id: "rege",  category: "Persoană", word: "Rege" },
  { id: "vampir",  category: "Persoană", word: "Vampir" },
  { id: "robot",  category: "Persoană", word: "Robot" },
  { id: "supererou",  category: "Persoană", word: "Supererou" },

  // Obiecte
  { id: "pizza_ro",  category: "Obiect", word: "Pizza" },
  { id: "telescop",  category: "Obiect", word: "Telescop" },
  { id: "parasuta",  category: "Obiect", word: "Parașută" },
  { id: "diamant",  category: "Obiect", word: "Diamant" },
  { id: "chitara",  category: "Obiect", word: "Chitară" },
  { id: "umbrela",  category: "Obiect", word: "Umbrelă" },
  { id: "busola",  category: "Obiect", word: "Busolă" },
  { id: "trofeu",  category: "Obiect", word: "Trofeu" },
  { id: "microscop", category: "Obiect", word: "Microscop" },
  { id: "lumanare",  category: "Obiect", word: "Lumânare" },

  // Evenimente
  { id: "nunta",  category: "Eveniment", word: "Nuntă" },
  { id: "olimpiada",  category: "Eveniment", word: "Olimpiadă" },
  { id: "inmormantare",  category: "Eveniment", word: "Înmormântare" },
  { id: "zi_nastere",  category: "Eveniment", word: "Zi de Naștere" },
  { id: "revelion",  category: "Eveniment", word: "Revelion" },
  { id: "absolvire",  category: "Eveniment", word: "Absolvire" },
  { id: "concert",  category: "Eveniment", word: "Concert" },
  { id: "cupa_mondiala", category: "Eveniment", word: "Cupa Mondială" },
]

export const WORD_PACKS: Record<Language, WordPack[]> = {
  en: WORD_PACKS_EN,
  ro: WORD_PACKS_RO,
}

// Used to generate a friendly room code
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Pick a random word pack for the given language
export function getRandomWordPack(lang: Language = "en"): WordPack {
  const pool = WORD_PACKS[lang]
  return pool[Math.floor(Math.random() * pool.length)]
}

// Find a specific word pack by ID
export function getWordPackById(id: string, lang: Language = "en"): WordPack | undefined {
  return WORD_PACKS[lang].find((p) => p.id === id)
}

// Pick next impostor using rotation logic:
// Everyone gets a turn before anyone repeats.
function pickNextImpostor(room: import("./types").Room): { player: Player; cycleReset: boolean } {
  const eligible = room.players

  if (eligible.length === 0) {
    return { player: room.players[0], cycleReset: false }
  }

  const notYetImpostor = eligible.filter((p) => !p.hasBeenImpostor)

  if (notYetImpostor.length > 0) {
    return {
      player: notYetImpostor[Math.floor(Math.random() * notYetImpostor.length)],
      cycleReset: false,
    }
  }

  return {
    player: eligible[Math.floor(Math.random() * eligible.length)],
    cycleReset: true,
  }
}

export { pickNextImpostor }
