"use client"

import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { RoomHeader } from "@/components/room-header"
import { PlayerList } from "@/components/player-list"
import { ShieldAlert, RotateCcw, Trophy } from "lucide-react"
import { AdBanner } from "@/components/ad-banner"

export function ResultsScreen() {
  const { room, newRound, viewerId } = useGame()
  const { t } = useLanguage()

  const round = room?.currentRound
  if (!room || !round) return null

  const impostor = room.players.find((p) => p.id === round.impostorId)
  const isImpostorCaught = round.impostorCaught
  const isSkipped = room.roundSkipped
  // Impostorul câștigă DOAR dacă nu a fost prins
  const impostorWon = !isImpostorCaught && !isSkipped
  const playersWon = isImpostorCaught && !isSkipped

  return (
    <div className="min-h-screen">
      <RoomHeader />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          
          {/* Main Status Card */}
          <div
            className={`relative overflow-hidden rounded-2xl border p-8 ${
              isSkipped
                ? "border-border bg-secondary/20"
                : impostorWon
                ? "border-destructive/40 bg-destructive/5"
                : "border-primary/40 bg-primary/5"
            }`}
          >
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent ${
                isSkipped
                  ? "from-secondary/20"
                  : impostorWon
                  ? "from-destructive/20"
                  : "from-primary/20"
              }`}
            />
            <div className="relative">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-4">
                {isSkipped ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <RotateCcw className="h-4 w-4" />
                    {t("roundSkippedResult")}
                  </span>
                ) : impostorWon ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-destructive">
                    <ShieldAlert className="h-4 w-4" />
                    {t("impostorWins")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    <Trophy className="h-4 w-4" />
                    {t("playersWin")}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-pretty text-4xl font-bold sm:text-5xl mb-2">
                {isSkipped
                  ? t("roundSkippedResult")
                  : isImpostorCaught
                  ? t("impostorCaught")
                  : t("impostorEscaped")}
              </h1>

              {/* Secret Reveal */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <ResultStat
                  label={t("secretWordReveal")}
                  value={round.word}
                  subtext={`${round.category} ${round.categoryEmoji}`}
                />
                <ResultStat 
                  label={t("impostorWasLabel")} 
                  value={impostor?.name || "Unknown"}
                  highlight={impostorWon}
                />
              </div>

              {/* Next Round CTA */}
              {viewerId === room.hostId && (
                <div className="mt-8">
                  <Button onClick={newRound} size="lg" className="w-full sm:w-auto font-bold">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t("nextRound")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <AdBanner />

        </section>

        <aside className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("scoreboard")}
            </h2>
            <PlayerList
              players={[...room.players].sort((a, b) => b.score - a.score)}
              viewerId={viewerId}
              hideGuesserBadge={false}
            />
          </div>
        </aside>
      </main>
    </div>
  )
}

function ResultStat({
  label,
  value,
  subtext,
  highlight,
}: {
  label: string
  value: string
  subtext?: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-xl border border-border p-4 ${highlight ? "bg-destructive/10 border-destructive/20" : "bg-background/40"}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div className={`text-2xl font-black tracking-tight ${highlight ? "text-destructive" : ""}`}>
        {value}
      </div>
      {subtext && (
        <div className="mt-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">
          {subtext}
        </div>
      )}
    </div>
  )
}
