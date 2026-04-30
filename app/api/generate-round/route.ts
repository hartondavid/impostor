import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { GEMINI_MODEL } from "@/lib/ai-provider"
import { FALLBACK_WORDS } from "@/lib/mock-data"

// Schema the model is constrained to. generateObject enforces this shape
// so the UI never has to parse free-form text.
const RoundSchema = z.object({
  word: z.string().min(2).max(32),
  definition: z.string().min(8).max(220),
  questions: z.array(z.string().min(6).max(160)).min(5).max(8),
})

// Conjugation cheatsheet shown to the model so it knows how to replace
// the secret verb with the codename "a tipota" while keeping each sentence
// grammatically natural in Romanian.
const TIPOTA_GUIDE = `
Codename verb: "a tipota" (regular, conjugated like "a lucra").
Use the form that matches the original verb's tense / person:
- Infinitiv: a tipota
- Prezent: tipotez, tipotezi, tipotează, tipotăm, tipotați, tipotează
- Perfect compus: am tipotat, ai tipotat, a tipotat, am tipotat, ați tipotat, au tipotat
- Imperfect: tipotam, tipotai, tipota, tipotam, tipotați, tipotau
- Viitor: voi tipota, vei tipota, va tipota, vom tipota, veți tipota, vor tipota
- Conjunctiv: să tipotez, să tipotezi, să tipoteze, să tipotăm, să tipotați, să tipoteze
- Condițional: aș tipota, ai tipota, ar tipota
- Gerunziu: tipotând
- Participiu: tipotat / tipotată
`.trim()

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    word?: string
    difficulty?: "easy" | "medium" | "hard"
  }
  const { word, difficulty = "medium" } = body

  // The game uses Romanian action verbs. The secret verb is hidden behind
  // the codename "tipota" in every question. Players answer verbally.
  const sharedRules = `
You are running a Romanian party game. The secret word is always a Romanian ACTION VERB (e.g. "a alerga", "a dansa", "a citi", "a găti", "a cânta"). It must be a single common verb suitable for everyone (no slang, no profanity, no proper nouns, family-friendly).

Output rules (JSON):
- "word": the secret verb in its infinitive form, lower-cased, including the particle "a " (e.g. "a alerga").
- "definition": one short Romanian sentence describing the action without using the verb itself or any of its conjugated forms. Max 25 words.
- "questions": exactly 6 Romanian questions a Guesser would ask another player to deduce the secret verb. Each question is addressed to the player ("tu" / "voi"). The original verb MUST be replaced with the correct conjugated form of the codename verb "a tipota" so that the sentence stays grammatical. NEVER include the real verb (or any of its conjugated forms) anywhere in the questions or in the definition. Make the questions progressively more specific (general → narrow). Mix tenses naturally (prezent, perfect compus, viitor, conjunctiv).

${TIPOTA_GUIDE}

Examples (if the secret verb were "a alerga"):
- "Îți place să tipotezi?"
- "De ce tipotezi de obicei?"
- "Ai tipotat ieri?"
- "Tipotezi singur sau cu prietenii?"
- "Cât de des tipotezi într-o săptămână?"
- "Ai tipota pe vreme rea?"
`.trim()

  const prompt = word
    ? `${sharedRules}\n\nThe host has chosen the secret verb: "${word}". Use this exact verb (normalize to its infinitive "a <verb>"). Generate the definition and the 6 questions for it.`
    : `${sharedRules}\n\nPick a fresh Romanian action verb (difficulty: ${difficulty}). Generate the word + definition + 6 questions.`

  try {
    const { object } = await generateObject({
      model: GEMINI_MODEL,
      schema: RoundSchema,
      prompt,
      temperature: 0.8,
    })

    // Defensive cleanup: strip any accidental occurrences of the real verb
    // root from questions/definition, replacing them with a "tipota"
    // placeholder. This protects against the model leaking the answer.
    const cleaned = sanitizeRound(object)
    return NextResponse.json({ ok: true, ...cleaned })
  } catch (error) {
    console.log("[v0] generate-round failed, using fallback:", error)
    const fallback =
      FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
    const final = word
      ? {
          word: normalizeVerb(word),
          definition: `Verbul secret descrie o acțiune. Lasă-i pe ceilalți jucători să ofere indicii.`,
          questions: fallback.questions,
        }
      : fallback
    return NextResponse.json({ ok: true, fallback: true, ...final })
  }
}

// Ensure a verb is in the form "a <root>".
function normalizeVerb(input: string): string {
  const v = input.trim().toLowerCase()
  return v.startsWith("a ") ? v : `a ${v}`
}

// Replace the verb root inside questions / definition with a tipota form,
// to guarantee the secret never leaks. We don't try to be morphologically
// perfect — we just neutralize the leak and let the AI's intended sentence
// stand otherwise.
function sanitizeRound(obj: {
  word: string
  definition: string
  questions: string[]
}) {
  const word = normalizeVerb(obj.word)
  const root = word.replace(/^a\s+/, "")
  // Build a regex that matches the verb root plus any short suffix
  // (catches conjugations like "alerg", "alergi", "alerga", "alergat").
  const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, "\\$1")
  const re = new RegExp(`\\b${escaped}\\w{0,4}\\b`, "giu")

  const replaceLeak = (text: string) =>
    text.replace(re, "tipotează").replace(/\ba\s+tipotează\b/gi, "a tipota")

  return {
    word,
    definition: replaceLeak(obj.definition),
    questions: obj.questions.map(replaceLeak),
  }
}
