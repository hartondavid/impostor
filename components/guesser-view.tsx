"use client"

import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { GameStatusBanner } from "@/components/game-status-banner"
import { QuestionCard } from "@/components/question-card"
import { PlayerList } from "@/components/player-list"
import { Trophy } from "lucide-react"

// Guesser's dashboard. They DO NOT see the secret verb — only:
// - the next suggested question
// - the list of players
// - "I guessed the word" button
export function GuesserView() {
  const { room, viewerId, skipQuestion, guessedCorrectly, currentQuestion } = useGame()
  const { t } = useLanguage()

  const round = room?.currentRound

  if (!room || !round) return null

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <GameStatusBanner
          viewAs="guesser"
          title={t("guesserTitle")}
          subtitle={t("guesserSubtitle")}
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
          <h3 className="text-sm font-semibold mb-3">{t("playersCount")}</h3>
          <PlayerList players={room.players} viewerId={viewerId} />
        </div>
      </aside>
    </main>
  )
}

