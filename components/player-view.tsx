"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { GameStatusBanner } from "@/components/game-status-banner"
import { PlayerList } from "@/components/player-list"
import { Eye, Lock, FastForward, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DelegateHostCard } from "@/components/delegate-host"

// Regular player's dashboard. Sees:
// - the secret verb (the whole point of being a regular player)
// - who the guesser is
// - the question history (what's been asked)
export function PlayerView() {
  const { room, viewer, viewerId, guesser, forceEndRound, guessedCorrectly } = useGame()
  const { t } = useLanguage()
  const [isPeeking, setIsPeeking] = useState(false)

  const round = room?.currentRound
  if (!room || !round) return null

  const isHostPlayer = Boolean(viewer?.isHost)
  const bannerViewAs = isHostPlayer ? "host" : "player"

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-5">
        <GameStatusBanner
          viewAs={bannerViewAs}
          title={t("playerTitle")}
          subtitle={`${guesser?.name ?? t("playerSubtitle2")} ${t("playerSubtitle1")}`}
        />

        {/* Secret verb reveal — visible only to non-guessers. */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent"
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" />
                {t("secretWordLabel")}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary active:scale-95"
                onMouseEnter={() => setIsPeeking(true)}
                onMouseLeave={() => setIsPeeking(false)}
                onTouchStart={(e) => {
                  e.preventDefault()
                  setIsPeeking(true)
                }}
                onTouchEnd={() => setIsPeeking(false)}
                aria-label="Peek word"
              >
                <Eye className={`h-4 w-4 ${isPeeking ? "text-primary" : ""}`} />
              </Button>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <p
                className={`font-mono text-4xl font-bold tracking-tight transition-all duration-300 sm:text-5xl ${isPeeking ? "text-primary blur-0 opacity-100" : "text-muted-foreground/20 blur-md opacity-50 select-none"
                  }`}
              >
                {isPeeking ? round.word : "••••••••"}
              </p>
            </div>

            {round.definition && (
              <p className="mt-3 max-w-xl text-pretty text-sm text-muted-foreground">
                {round.definition}
              </p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              <Lock className="mr-1 inline h-3 w-3" />
              {t("revealInstruction")} <span className="font-semibold text-foreground">{t("never")}</span> {t("seesThis")}
            </p>
          </div>
        </div>

        {/* Host Controls */}
        {viewer?.isHost && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="mb-2 text-sm font-semibold text-primary">{t("hostControls")}</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              {t("hostControlsDesc")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => guessedCorrectly()}
                className="flex-1 sm:flex-none rounded-full font-bold bg-[#a3e635] text-black hover:bg-[#bef264] border-none shadow-md shadow-[#a3e635]/10 transition-all h-11 px-6"
              >
                <Trophy className="mr-2 h-4 w-4" />
                {t("wordGuessed")}
              </Button>
              <Button
                onClick={forceEndRound}
                variant="outline"
                className="flex-1 sm:flex-none rounded-full h-11 px-6 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
              >
                <FastForward className="mr-2 h-4 w-4" />
                {t("skipRound")}
              </Button>
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("room")}
        </h2>
        <PlayerList players={room.players} viewerId={viewerId} />
        <div className="pt-4">
          <DelegateHostCard />
        </div>
      </aside>
    </main>
  )
}
