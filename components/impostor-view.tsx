"use client"

import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { GameStatusBanner } from "@/components/game-status-banner"
import { PlayerList } from "@/components/player-list"
import { ShieldAlert } from "lucide-react"
import { SpokenWordsLog } from "@/components/spoken-words-log"

// Impostor's dashboard. They DO NOT see the secret word — only:
// - the category hint
// - the list of players
// - suspenseful UI
export function ImpostorView() {
  const { room, viewerId } = useGame()
  const { t } = useLanguage()

  const round = room?.currentRound

  if (!room || !round) return null

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <GameStatusBanner
          viewAs="impostor"
          title={t("impostorTitle")}
          subtitle={t("impostorSubtitle")}
        />

        <div className="relative overflow-hidden rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center shadow-lg shadow-destructive/10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent"
          />
          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20 text-destructive mb-6">
              <ShieldAlert className="h-8 w-8" />
            </div>
            
            <h2 className="text-sm font-semibold uppercase tracking-widest text-destructive mb-2">
              {t("impostorCategoryLabel")}
            </h2>
            
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-6">
              {round.category} {round.categoryEmoji}
            </div>

            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {t("impostorHint")}
            </p>
          </div>
        </div>

        <SpokenWordsLog />
      </section>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">{t("playersCount")}</h3>
          <PlayerList players={room.players} viewerId={viewerId} hideGuesserBadge={true} />
        </div>
      </aside>
    </main>
  )
}
