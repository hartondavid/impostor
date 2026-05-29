import type { WordPack } from "./types"

// Themed word packs for The Impostor game.
// Each pack has an emoji, category name, and the secret word.
// The Impostor only sees the category — not the specific word.

export const WORD_PACKS_EN: WordPack[] = [
  // 🏖️ Locations
  { id: "beach",  category: "Location", word: "Beach" },
  { id: "hospital", category: "Location", word: "Hospital" },
  { id: "casino",  category: "Location", word: "Casino" },
  { id: "submarine",  category: "Location", word: "Submarine" },
  { id: "airport",  category: "Location", word: "Airport" },
  { id: "prison",  category: "Location", word: "Prison" },
  { id: "circus",  category: "Location", word: "Circus" },
  { id: "space_station",  category: "Location", word: "Space Station" },
  { id: "restaurant",  category: "Location", word: "Restaurant" },
  { id: "bank",  category: "Location", word: "Bank" },
  { id: "museum",  category: "Location", word: "Museum" },
  { id: "library",  category: "Location", word: "Library" },
  { id: "gym",  category: "Location", word: "Gym" },
  { id: "cinema",  category: "Location", word: "Cinema" },
  { id: "farm",  category: "Location", word: "Farm" },
  { id: "jungle",  category: "Location", word: "Jungle" },
  { id: "volcano",  category: "Location", word: "Volcano" },
  { id: "supermarket",  category: "Location", word: "Supermarket" },
  { id: "school",  category: "Location", word: "School" },
  { id: "theater",  category: "Location", word: "Theater" },

  // 🧑‍💼 People / Professions
  { id: "spy",  category: "Person", word: "Spy" },
  { id: "pirate",  category: "Person", word: "Pirate" },
  { id: "surgeon",  category: "Person", word: "Surgeon" },
  { id: "astronaut",  category: "Person", word: "Astronaut" },
  { id: "chef",  category: "Person", word: "Chef" },
  { id: "magician",  category: "Person", word: "Magician" },
  { id: "firefighter",  category: "Person", word: "Firefighter" },
  { id: "teacher",  category: "Person", word: "Teacher" },
  { id: "detective",  category: "Person", word: "Detective" },
  { id: "king",  category: "Person", word: "King" },
  { id: "rockstar",  category: "Person", word: "Rockstar" },
  { id: "vampire",  category: "Person", word: "Vampire" },
  { id: "robot",  category: "Person", word: "Robot" },
  { id: "clown",  category: "Person", word: "Clown" },
  { id: "superhero", category: "Person", word: "Superhero" },

  // 🍕 Objects / Things
  { id: "pizza",  category: "Object", word: "Pizza" },
  { id: "telescope",  category: "Object", word: "Telescope" },
  { id: "parachute",  category: "Object", word: "Parachute" },
  { id: "diamond",  category: "Object", word: "Diamond" },
  { id: "guitar",  category: "Object", word: "Guitar" },
  { id: "umbrella", emoji: "☂️", category: "Object", word: "Umbrella" },
  { id: "submarine_sandwich",  category: "Object", word: "Sandwich" },
  { id: "compass",  category: "Object", word: "Compass" },
  { id: "syringe",  category: "Object", word: "Syringe" },
  { id: "crown",  category: "Object", word: "Crown" },
  { id: "bomb",  category: "Object", word: "Bomb" },
  { id: "trophy",  category: "Object", word: "Trophy" },
  { id: "microscope",  category: "Object", word: "Microscope" },
  { id: "candle",  category: "Object", word: "Candle" },
  { id: "map",  category: "Object", word: "Map" },

  // 🎉 Events
  { id: "wedding",  category: "Event", word: "Wedding" },
  { id: "olympics",  category: "Event", word: "Olympics" },
  { id: "funeral",  category: "Event", word: "Funeral" },
  { id: "birthday",  category: "Event", word: "Birthday Party" },
  { id: "new_year",  category: "Event", word: "New Year's Eve" },
  { id: "graduation",  category: "Event", word: "Graduation" },
  { id: "carnival",  category: "Event", word: "Carnival" },
  { id: "concert",  category: "Event", word: "Concert" },
  { id: "world_cup",  category: "Event", word: "World Cup" },
  { id: "elections",  category: "Event", word: "Election" },

  // 🐾 Animals
  { id: "penguin", category: "Animal", word: "Penguin" },
  { id: "shark",  category: "Animal", word: "Shark" },
  { id: "elephant",  category: "Animal", word: "Elephant" },
  { id: "chameleon",  category: "Animal", word: "Chameleon" },
  { id: "eagle",  category: "Animal", word: "Eagle" },
  { id: "sloth",  category: "Animal", word: "Sloth" },
  { id: "octopus", category: "Animal", word: "Octopus" },
  { id: "wolf",  category: "Animal", word: "Wolf" },
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
