"use client"

import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { GameStatusBanner } from "@/components/game-status-banner"
import { QuestionCard } from "@/components/question-card"
import { PlayerList } from "@/components/player-list"
import { Trophy } from "lucide-react"

// Guesser's dashboard. They DO NOT see the secret word — only:
// - the next suggested question
// - the list of players
// - "I guessed the word" button
export function GuesserView() {
  const { room, viewerId, skipQuestion, guessedCorrectly, currentQuestion } = useGame()

  const round = room?.currentRound

  if (!room || !round) return null

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <GameStatusBanner
          viewAs="guesser"
          title="Tu ești Ghicitorul"
          subtitle="Pune întrebări jucătorilor și ghicește verbul secret. Verbul real este înlocuit peste tot cu „a tipota”."
        />

        <QuestionCard
          question={currentQuestion}
          total={round.questions.length}
          current={round.currentQuestionIndex}
          onSkip={skipQuestion}
        />

      </section>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Jucători</h3>
          <PlayerList players={room.players} viewerId={viewerId} />
        </div>
      </aside>
    </main>
  )
}

