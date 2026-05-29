"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { GameStatusBanner } from "@/components/game-status-banner"
import { PlayerList } from "@/components/player-list"
import { ShieldAlert, FastForward, Lock, Eye, Ghost } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DelegateHostCard } from "@/components/delegate-host"
import { SpokenWordsLog } from "@/components/spoken-words-log"
// Regular player's dashboard. Sees:
// - the secret word
// - the category
// - start voting button (if host)
export function PlayerView() {
  const { room, viewer, viewerId, openVoting, skipRound, hostEndRoundImpostorGuessed } = useGame()
  const { t, language } = useLanguage()
  const [isPeeking, setIsPeeking] = useState(false)

  const round = room?.currentRound
  if (!room || !round) return null

  const isHostPlayer = Boolean(viewerId && room.hostId === viewerId)
  const isImpostor = Boolean(viewer?.isImpostor)
  const secretWordDisplay = isImpostor ? t("impostor") : round.word
  const bannerViewAs = viewer?.isSpectator ? "spectator" : isHostPlayer ? "host" : "player"
  const title = viewer?.isSpectator ? t("spectatorTitle") : t("playerTitle")
  const subtitle = viewer?.isSpectator ? t("spectatorSubtitle") : `${t("playerSubtitle2")} ${t("playerSubtitle1")}`

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-5">
        <GameStatusBanner
          viewAs={bannerViewAs}
          title={title}
          subtitle={subtitle}
        />

        {/* Spectator Warning / Information Card */}
        {viewer?.isSpectator && (
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 text-blue-900 dark:text-blue-100">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent"
            />
            <div className="relative flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-500">
                <Ghost className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base">
                  {language === "ro" ? "Mod Spectator Activ" : "Spectator Mode Active"}
                </h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  {language === "ro"
                    ? "Ai fost eliminat prin vot deoarece ai fost considerat suspect. Acum poți urmări indiciile și evoluția jocului în timp real, dar nu mai poți scrie indicii și nu mai poți vota."
                    : "You were voted out because you were deemed suspicious. You can now follow the clues and see the game progress in real-time, but you cannot write clues or vote anymore."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Secret word reveal — visible only to regular players. */}
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
                {isPeeking ? secretWordDisplay : "••••••••"}
              </p>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              <Lock className="mr-1 inline h-3 w-3" />
              {t("revealInstruction")} <span className="font-semibold text-primary">{t("never")}</span> {t("seesThis")}
            </p>
          </div>
        </div>

        {/* Host Controls */}
        {isHostPlayer && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="mb-2 text-sm font-semibold text-primary">{t("hostControls")}</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              {t("hostControlsDesc")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => openVoting()}
                className="flex-1 sm:flex-none rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 border-none shadow-md shadow-primary/20 transition-all h-11 px-6"
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                {t("startVoting")}
              </Button>
              <Button
                onClick={skipRound}
                variant="outline"
                className="flex-1 sm:flex-none rounded-full h-11 px-6 border-border hover:bg-secondary transition-all"
              >
                <FastForward className="mr-2 h-4 w-4" />
                {t("skipRound")}
              </Button>
              <Button
                onClick={hostEndRoundImpostorGuessed}
                variant="outline"
                className="flex-1 sm:flex-none rounded-full font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all h-11 px-6"
                title={t("hostImpostorGuessedDesc")}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t("hostImpostorGuessed")}
              </Button>
            </div>
          </div>
        )}

        <SpokenWordsLog />
      </section>

      <aside className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("room")}
        </h2>
        <PlayerList players={room.players} viewerId={viewerId} hideGuesserBadge={true} />
        {isHostPlayer && (
          <div className="pt-4">
            <DelegateHostCard />
          </div>
        )}
      </aside>
    </main>
  )
}
