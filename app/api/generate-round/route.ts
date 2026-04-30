import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { GEMINI_MODEL } from "@/lib/ai-provider"
import { FALLBACK_WORDS } from "@/lib/mock-data"

// Schema the model is constrained to. generateObject enforces this shape
// so the UI never has to parse free-form text.
const RoundSchema = z.object({
  word: z.string().min(2).max(24),
  definition: z.string().min(8).max(220),
  questions: z.array(z.string().min(6).max(140)).min(5).max(8),
})

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    word?: string
    difficulty?: "easy" | "medium" | "hard"
  }
  const { word, difficulty = "medium" } = body

  // Build a prompt depending on whether the host typed a word or
  // wants the AI to come up with one.
  const prompt = word
    ? `The secret word is "${word}". Return a JSON object with:
- "word": the same word, lower-cased.
- "definition": a single concise sentence (max 25 words) describing it without using the word itself.
- "questions": 6 short, neutral yes/no or short-answer questions a guesser could ask other players to deduce this word. Do NOT include the word in any question. Make them progressively more specific.`
    : `Pick a single common, family-friendly English noun suitable for a party guessing game (difficulty: ${difficulty}). Avoid proper nouns and brand names. Return a JSON object with:
- "word": the chosen word, lower-cased.
- "definition": a single concise sentence (max 25 words) describing the word without using it.
- "questions": 6 short yes/no or short-answer questions a guesser could ask other players to deduce the word. Do NOT include the word in any question. Make them progressively more specific.`

  try {
    const { object } = await generateObject({
      model: GEMINI_MODEL,
      schema: RoundSchema,
      prompt,
      // Gemini handles structured output well; keep temp moderate for variety.
      temperature: 0.7,
    })
    return NextResponse.json({ ok: true, ...object })
  } catch (error) {
    console.log("[v0] generate-round failed, using fallback:", error)
    // Graceful fallback: pick a random pre-baked word + question set so
    // the game stays playable even without AI access.
    const fallback = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
    const final = word
      ? {
          word: word.toLowerCase(),
          definition: `A ${word.toLowerCase()} — let your fellow players hint at the rest!`,
          questions: fallback.questions,
        }
      : fallback
    return NextResponse.json({ ok: true, fallback: true, ...final })
  }
}
