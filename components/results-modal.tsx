"use client"

import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { RoomHeader } from "@/components/room-header"
import { PlayerList } from "@/components/player-list"
import { CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react"
import { DelegateHostCard } from "@/components/delegate-host"

// End-of-round screen. Shows whether the guesser won, the secret word,
// the # of questions used, and a CTA to start a new round (rotates guesser).
export function ResultsScreen() {
  const { room, newRound, viewerId } = useGame()
  const round = room?.currentRound
  if (!room || !round) return null

  const guesser = room.players.find((p) => p.id === round.guesserId)
  const won = round.won
  const skipped = round.questions.filter((q) => q.skipped).length

  return (
    <div className="min-h-screen">
      <RoomHeader />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-5">
          <div
            className={`relative overflow-hidden rounded-2xl border p-8 ${won
                ? "border-primary/40 bg-primary/5"
                : "border-destructive/40 bg-destructive/5"
              }`}
          >
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent ${won ? "from-primary/20" : "from-destructive/20"
                }`}
            />
            <div className="relative">
              <div className="flex items-center gap-2">
                {won ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Trophy className="h-3.5 w-3.5" />
                    Guesser wins!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive">
                    <XCircle className="h-3.5 w-3.5" />
                    So close!
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-pretty text-4xl font-semibold sm:text-5xl">
                {won ? `${guesser?.name ?? "Guesser"} cracked it.` : "Better luck next round."}
              </h1>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ResultStat
                  label="Secret word"
                  value={round.word}
                  mono
                />
                <ResultStat label="Suggestions skipped" value={String(skipped)} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={newRound} size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Next Round
                </Button>
              </div>
            </div>
          </div>

          {round.definition && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Definition
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed">
                {round.definition}
              </p>
            </div>
          )}
        </section>

        <aside className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Scoreboard
          </h2>
          <PlayerList
            players={[...room.players].sort((a, b) => b.score - a.score)}
            viewerId={viewerId}
          />
          <div className="pt-4">
            <DelegateHostCard />
          </div>
        </aside>
      </main>
    </div>
  )
}

function ResultStat({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-semibold ${mono ? "font-mono lowercase tracking-tight" : "tabular-nums"}`}
      >
        {value}
      </div>
    </div>
  )
}
