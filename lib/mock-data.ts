import type { Player, WordPack } from "./types"
import { WORD_PACKS_EN, getRandomWordPackEN } from "./mock-data-en"
import type { Language } from "./translations"

// Pool of fun mock player names used to populate a room when the
// real-time backend is not connected.
export const MOCK_NAMES = [
  "Maya", "Leo", "Iris", "Noah", "Zara",
  "Finn", "Aria", "Eli", "Nova", "Theo",
]

// Avatar accent colors – kept minimal & on-brand.
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
  { id: "plaja", emoji: "🏖️", category: "Locație", word: "Plajă" },
  { id: "spital", emoji: "🏥", category: "Locație", word: "Spital" },
  { id: "cazinou", emoji: "🎰", category: "Locație", word: "Cazinou" },
  { id: "submarin", emoji: "🚢", category: "Locație", word: "Submarin" },
  { id: "aeroport", emoji: "✈️", category: "Locație", word: "Aeroport" },
  { id: "inchisoare", emoji: "⛓️", category: "Locație", word: "Închisoare" },
  { id: "circ", emoji: "🎪", category: "Locație", word: "Circ" },
  { id: "statie_spatiala", emoji: "🚀", category: "Locație", word: "Stație Spațială" },
  { id: "restaurant", emoji: "🍽️", category: "Locație", word: "Restaurant" },
  { id: "banca", emoji: "🏦", category: "Locație", word: "Bancă" },
  { id: "muzeu", emoji: "🏛️", category: "Locație", word: "Muzeu" },
  { id: "biblioteca", emoji: "📚", category: "Locație", word: "Bibliotecă" },
  { id: "sala_sport", emoji: "🏋️", category: "Locație", word: "Sală de Sport" },
  { id: "cinema", emoji: "🎬", category: "Locație", word: "Cinema" },
  { id: "ferma", emoji: "🌾", category: "Locație", word: "Fermă" },

  // Personaje / Profesii
  { id: "spion", emoji: "🕵️", category: "Persoană", word: "Spion" },
  { id: "pirat", emoji: "🏴‍☠️", category: "Persoană", word: "Pirat" },
  { id: "chirurg", emoji: "👨‍⚕️", category: "Persoană", word: "Chirurg" },
  { id: "astronaut", emoji: "👨‍🚀", category: "Persoană", word: "Astronaut" },
  { id: "bucatar", emoji: "👨‍🍳", category: "Persoană", word: "Bucătar" },
  { id: "magician", emoji: "🎩", category: "Persoană", word: "Magician" },
  { id: "pompier", emoji: "🚒", category: "Persoană", word: "Pompier" },
  { id: "profesor", emoji: "👨‍🏫", category: "Persoană", word: "Profesor" },
  { id: "detectiv", emoji: "🔍", category: "Persoană", word: "Detectiv" },
  { id: "rege", emoji: "👑", category: "Persoană", word: "Rege" },
  { id: "vampir", emoji: "🧛", category: "Persoană", word: "Vampir" },
  { id: "robot", emoji: "🤖", category: "Persoană", word: "Robot" },
  { id: "supererou", emoji: "🦸", category: "Persoană", word: "Supererou" },

  // Obiecte
  { id: "pizza_ro", emoji: "🍕", category: "Obiect", word: "Pizza" },
  { id: "telescop", emoji: "🔭", category: "Obiect", word: "Telescop" },
  { id: "parasuta", emoji: "🪂", category: "Obiect", word: "Parașută" },
  { id: "diamant", emoji: "💎", category: "Obiect", word: "Diamant" },
  { id: "chitara", emoji: "🎸", category: "Obiect", word: "Chitară" },
  { id: "umbrela", emoji: "☂️", category: "Obiect", word: "Umbrelă" },
  { id: "busola", emoji: "🧭", category: "Obiect", word: "Busolă" },
  { id: "trofeu", emoji: "🏆", category: "Obiect", word: "Trofeu" },
  { id: "microscop", emoji: "🔬", category: "Obiect", word: "Microscop" },
  { id: "lumanare", emoji: "🕯️", category: "Obiect", word: "Lumânare" },

  // Evenimente
  { id: "nunta", emoji: "💍", category: "Eveniment", word: "Nuntă" },
  { id: "olimpiada", emoji: "🏅", category: "Eveniment", word: "Olimpiadă" },
  { id: "inmormantare", emoji: "⚰️", category: "Eveniment", word: "Înmormântare" },
  { id: "zi_nastere", emoji: "🎂", category: "Eveniment", word: "Zi de Naștere" },
  { id: "revelion", emoji: "🎆", category: "Eveniment", word: "Revelion" },
  { id: "absolvire", emoji: "🎓", category: "Eveniment", word: "Absolvire" },
  { id: "concert", emoji: "🎤", category: "Eveniment", word: "Concert" },
  { id: "cupa_mondiala", emoji: "⚽", category: "Eveniment", word: "Cupa Mondială" },
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
  const eligible = room.players.filter((p) => !p.isHost)

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
