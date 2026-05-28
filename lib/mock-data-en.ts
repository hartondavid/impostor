import type { WordPack } from "./types"

// Themed word packs for The Impostor game.
// Each pack has an emoji, category name, and the secret word.
// The Impostor only sees the category — not the specific word.

export const WORD_PACKS_EN: WordPack[] = [
  // 🏖️ Locations
  { id: "beach", emoji: "🏖️", category: "Location", word: "Beach" },
  { id: "hospital", emoji: "🏥", category: "Location", word: "Hospital" },
  { id: "casino", emoji: "🎰", category: "Location", word: "Casino" },
  { id: "submarine", emoji: "🚢", category: "Location", word: "Submarine" },
  { id: "airport", emoji: "✈️", category: "Location", word: "Airport" },
  { id: "prison", emoji: "⛓️", category: "Location", word: "Prison" },
  { id: "circus", emoji: "🎪", category: "Location", word: "Circus" },
  { id: "space_station", emoji: "🚀", category: "Location", word: "Space Station" },
  { id: "restaurant", emoji: "🍽️", category: "Location", word: "Restaurant" },
  { id: "bank", emoji: "🏦", category: "Location", word: "Bank" },
  { id: "museum", emoji: "🏛️", category: "Location", word: "Museum" },
  { id: "library", emoji: "📚", category: "Location", word: "Library" },
  { id: "gym", emoji: "🏋️", category: "Location", word: "Gym" },
  { id: "cinema", emoji: "🎬", category: "Location", word: "Cinema" },
  { id: "farm", emoji: "🌾", category: "Location", word: "Farm" },
  { id: "jungle", emoji: "🌿", category: "Location", word: "Jungle" },
  { id: "volcano", emoji: "🌋", category: "Location", word: "Volcano" },
  { id: "supermarket", emoji: "🛒", category: "Location", word: "Supermarket" },
  { id: "school", emoji: "🏫", category: "Location", word: "School" },
  { id: "theater", emoji: "🎭", category: "Location", word: "Theater" },

  // 🧑‍💼 People / Professions
  { id: "spy", emoji: "🕵️", category: "Person", word: "Spy" },
  { id: "pirate", emoji: "🏴‍☠️", category: "Person", word: "Pirate" },
  { id: "surgeon", emoji: "👨‍⚕️", category: "Person", word: "Surgeon" },
  { id: "astronaut", emoji: "👨‍🚀", category: "Person", word: "Astronaut" },
  { id: "chef", emoji: "👨‍🍳", category: "Person", word: "Chef" },
  { id: "magician", emoji: "🎩", category: "Person", word: "Magician" },
  { id: "firefighter", emoji: "🚒", category: "Person", word: "Firefighter" },
  { id: "teacher", emoji: "👨‍🏫", category: "Person", word: "Teacher" },
  { id: "detective", emoji: "🔍", category: "Person", word: "Detective" },
  { id: "king", emoji: "👑", category: "Person", word: "King" },
  { id: "rockstar", emoji: "🎸", category: "Person", word: "Rockstar" },
  { id: "vampire", emoji: "🧛", category: "Person", word: "Vampire" },
  { id: "robot", emoji: "🤖", category: "Person", word: "Robot" },
  { id: "clown", emoji: "🤡", category: "Person", word: "Clown" },
  { id: "superhero", emoji: "🦸", category: "Person", word: "Superhero" },

  // 🍕 Objects / Things
  { id: "pizza", emoji: "🍕", category: "Object", word: "Pizza" },
  { id: "telescope", emoji: "🔭", category: "Object", word: "Telescope" },
  { id: "parachute", emoji: "🪂", category: "Object", word: "Parachute" },
  { id: "diamond", emoji: "💎", category: "Object", word: "Diamond" },
  { id: "guitar", emoji: "🎸", category: "Object", word: "Guitar" },
  { id: "umbrella", emoji: "☂️", category: "Object", word: "Umbrella" },
  { id: "submarine_sandwich", emoji: "🥖", category: "Object", word: "Sandwich" },
  { id: "compass", emoji: "🧭", category: "Object", word: "Compass" },
  { id: "syringe", emoji: "💉", category: "Object", word: "Syringe" },
  { id: "crown", emoji: "👑", category: "Object", word: "Crown" },
  { id: "bomb", emoji: "💣", category: "Object", word: "Bomb" },
  { id: "trophy", emoji: "🏆", category: "Object", word: "Trophy" },
  { id: "microscope", emoji: "🔬", category: "Object", word: "Microscope" },
  { id: "candle", emoji: "🕯️", category: "Object", word: "Candle" },
  { id: "map", emoji: "🗺️", category: "Object", word: "Map" },

  // 🎉 Events
  { id: "wedding", emoji: "💍", category: "Event", word: "Wedding" },
  { id: "olympics", emoji: "🏅", category: "Event", word: "Olympics" },
  { id: "funeral", emoji: "⚰️", category: "Event", word: "Funeral" },
  { id: "birthday", emoji: "🎂", category: "Event", word: "Birthday Party" },
  { id: "new_year", emoji: "🎆", category: "Event", word: "New Year's Eve" },
  { id: "graduation", emoji: "🎓", category: "Event", word: "Graduation" },
  { id: "carnival", emoji: "🎡", category: "Event", word: "Carnival" },
  { id: "concert", emoji: "🎤", category: "Event", word: "Concert" },
  { id: "world_cup", emoji: "⚽", category: "Event", word: "World Cup" },
  { id: "elections", emoji: "🗳️", category: "Event", word: "Election" },

  // 🐾 Animals
  { id: "penguin", emoji: "🐧", category: "Animal", word: "Penguin" },
  { id: "shark", emoji: "🦈", category: "Animal", word: "Shark" },
  { id: "elephant", emoji: "🐘", category: "Animal", word: "Elephant" },
  { id: "chameleon", emoji: "🦎", category: "Animal", word: "Chameleon" },
  { id: "eagle", emoji: "🦅", category: "Animal", word: "Eagle" },
  { id: "sloth", emoji: "🦥", category: "Animal", word: "Sloth" },
  { id: "octopus", emoji: "🐙", category: "Animal", word: "Octopus" },
  { id: "wolf", emoji: "🐺", category: "Animal", word: "Wolf" },
]

// Helper: pick a random word pack
export function getRandomWordPackEN(): WordPack {
  return WORD_PACKS_EN[Math.floor(Math.random() * WORD_PACKS_EN.length)]
}

// Get all packs for a given category
export function getPacksByCategory(category: string): WordPack[] {
  return WORD_PACKS_EN.filter((p) => p.category === category)
}

// All distinct categories
export const CATEGORIES_EN = [...new Set(WORD_PACKS_EN.map((p) => p.category))]
