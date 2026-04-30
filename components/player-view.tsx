"use client"

import { useGame } from "@/lib/game-context"
import { GameStatusBanner } from "@/components/game-status-banner"
import { PlayerList } from "@/components/player-list"
import { AnswerFeed } from "@/components/answer-feed"
import { Eye, Lock } from "lucide-react"

// Regular player's dashboard. Sees:
// - the secret word (the whole point of being a regular player)
// - who the guesser is
// - the question history (what's been asked)
export function PlayerView() {
  const { room, viewerId, guesser } = useGame()
  const round = room?.currentRound
  if (!room || !round) return null

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-5">
        <GameStatusBanner
          viewAs="player"
          title="Help the guesser discover the word"
          subtitle={`${guesser?.name ?? "The guesser"} can't see the word — only you and the rest of the room can.`}
        />

        {/* Secret word reveal — visible only to non-guessers. */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent"
          />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              The secret word
            </div>
            <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              {round.word}
            </p>
            {round.definition && (
              <p className="mt-3 max-w-xl text-pretty text-sm text-muted-foreground">
                {round.definition}
              </p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              <Eye className="mr-1 inline h-3 w-3" />
              The Guesser does <span className="font-semibold text-foreground">not</span> see this.
            </p>
          </div>
        </div>

        {/* What the guesser has asked so far */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Question history
          </h3>
          <AnswerFeed history={round.history} players={room.players} />
        </div>
      </section>

      <aside className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Room
        </h2>
        <PlayerList players={room.players} viewerId={viewerId} />
      </aside>
    </main>
  )
}
