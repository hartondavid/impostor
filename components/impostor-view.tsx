"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { GameStatusBanner } from "@/components/game-status-banner"
import { PlayerList } from "@/components/player-list"
import { ShieldAlert, Lock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SpokenWordsLog } from "@/components/spoken-words-log"
import { AdBanner } from "@/components/ad-banner"

// Impostor's dashboard. They DO NOT see the secret word — only:
// - the category hint
// - the list of players
// - suspenseful UI
export function ImpostorView() {
  const { room, viewerId,viewer } = useGame()
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
          subtitle={`${t("playerSubtitle2")} ${t("playerSubtitle1")}`}
        />

        {/* Secret word reveal — mimicked for Impostor to blend in. */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
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
                className="h-10 w-10 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary active:scale-95"
                onMouseEnter={() => setIsPeeking(true)}
                onMouseLeave={() => setIsPeeking(false)}
                onTouchStart={(e) => {
                  e.preventDefault()
                  setIsPeeking(true)
                }}
                onTouchEnd={() => setIsPeeking(false)}
                aria-label="Peek word"
              >
                <Eye className={`h-6 w-6 ${isPeeking ? "text-primary" : ""}`} />
              </Button>
            </div>

            <div className="mt-3 flex flex-col gap-1">
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {round.category} {round.categoryEmoji}
              </span>
              <p
                className={`font-mono text-4xl font-bold tracking-tight transition-all duration-300 sm:text-5xl ${isPeeking ? "text-primary blur-0 opacity-100" : "text-muted-foreground/20 blur-md opacity-50 select-none"
                  }`}
              >
                {isPeeking ? t("impostor") : "••••••••"}
              </p>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              <Lock className="mr-1 inline h-3 w-3" />
              {t("revealInstruction")} <span className="font-semibold text-primary">{t("never")}</span> {t("seesThis")}
            </p>
          </div>
        </div>

        <SpokenWordsLog />
      </section>

      <aside className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("room")}
        </h2>
        <PlayerList players={room.players} viewerId={viewerId} hideGuesserBadge={true} />
        <AdBanner variant="compact" className="opacity-90" />
      </aside>
    </main>
  )
}
