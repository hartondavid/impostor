"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RoomHeader } from "@/components/room-header"
import { PlayerList } from "@/components/player-list"
import { ShieldAlert, RotateCcw, Trophy, XCircle, Search } from "lucide-react"

export function ResultsScreen() {
  const { room, newRound, viewerId, submitImpostorGuess } = useGame()
  const { t } = useLanguage()
  const [guess, setGuess] = useState("")

  const round = room?.currentRound
  if (!room || !round) return null

  const impostor = room.players.find((p) => p.id === round.impostorId)
  const isImpostorCaught = round.impostorCaught
  const isViewerImpostor = viewerId === round.impostorId
  const impostorWon = round.impostorGuessedWord || !isImpostorCaught
  
  // If caught, but hasn't guessed yet, Impostor gets a chance
  const needsLastChance = isImpostorCaught && round.impostorGuessedWord === undefined

  return (
    <div className="min-h-screen">
      <RoomHeader />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          
          {/* Main Status Card */}
          <div
            className={`relative overflow-hidden rounded-2xl border p-8 ${impostorWon
              ? "border-destructive/40 bg-destructive/5" // Impostor won (red)
              : "border-primary/40 bg-primary/5" // Players won (green)
              }`}
          >
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent ${impostorWon ? "from-destructive/20" : "from-primary/20"
                }`}
            />
            <div className="relative">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-4">
                {impostorWon ? (
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
                {isImpostorCaught ? t("impostorCaught") : t("impostorEscaped")}
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

              {/* Last Chance Guess UI (Only for Impostor if caught) */}
              {needsLastChance && (
                <div className="mt-8 p-6 rounded-xl border border-accent/40 bg-accent/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-accent" />
                    <h3 className="font-bold text-lg text-accent">{t("impostorLastChance")}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("impostorLastChanceDesc")}
                  </p>
                  
                  {isViewerImpostor ? (
                    <div className="flex gap-2">
                      <Input 
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder={t("impostorGuessPlaceholder")}
                        className="bg-background"
                      />
                      <Button 
                        onClick={() => submitImpostorGuess(guess)}
                        disabled={!guess.trim()}
                        className="bg-accent hover:bg-accent/90 text-black font-bold"
                      >
                        {t("impostorGuessSubmit")}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                      <div className="animate-pulse h-2 w-2 rounded-full bg-accent" />
                      <span className="text-sm text-muted-foreground">Waiting for Impostor to guess...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Show the guess if they made one */}
              {round.impostorGuess && (
                <div className={`mt-8 p-4 rounded-xl border flex items-center justify-between ${round.impostorGuessedWord ? "border-destructive/40 bg-destructive/10" : "border-primary/40 bg-primary/10"}`}>
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Impostor's Guess</div>
                    <div className="text-xl font-bold">"{round.impostorGuess}"</div>
                  </div>
                  <div className="text-right">
                    {round.impostorGuessedWord ? (
                      <span className="text-sm font-bold text-destructive">{t("impostorGuessCorrect")}</span>
                    ) : (
                      <span className="text-sm font-bold text-primary">{t("impostorGuessWrong")}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Next Round CTA */}
              {!needsLastChance && viewerId === room.hostId && (
                <div className="mt-8">
                  <Button onClick={newRound} size="lg" className="w-full sm:w-auto font-bold">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t("nextRound")}
                  </Button>
                </div>
              )}
            </div>
          </div>

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
