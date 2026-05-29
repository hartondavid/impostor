"use client"

import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { PlayerList } from "@/components/player-list"
import { RoomHeader } from "@/components/room-header"
import { Spinner } from "@/components/ui/spinner"
import { Play } from "lucide-react"
import { toast } from "sonner"
import { DelegateHostCard } from "@/components/delegate-host"
import { AdBanner } from "@/components/ad-banner"

export function Lobby() {
  const { room, viewerId, setScreen } = useGame()
  const { t } = useLanguage()

  if (!room) return null

  const host = room.players.find((p) => p.isHost)
  const isViewerHost = host?.id === viewerId
  const playersLocal = room.players.length

  const onStart = () => {
    if (room.players.length < 3) {
      toast.error(t("needMorePlayers"))
      return
    }
    setScreen("host_setup")
  }

  return (
    <div className="min-h-screen">
      <RoomHeader />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("lobby")}
            </span>
            <h1 className="mt-3 text-pretty text-3xl font-semibold sm:text-4xl">
              {t("shareRoomCode")}
            </h1>
            <p className="mt-2 text-pretty text-muted-foreground">
              {t("lobbyDesc1")} <span className="text-foreground">{t("lobbyDesc2")}</span>
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatTile label={t("players")} value={String(playersLocal)} />
              <StatTile
                label={t("status")}
                value={room.status === "waiting" ? t("waiting") : t("ready")}
              />
              <StatTile label={t("roundsPlayed")} value={String(room.pastRounds.length)} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {isViewerHost && (
                <>
                  <Button onClick={onStart} size="lg" className="w-full sm:w-auto text-base">
                    <Play className="mr-2 h-4 w-4" />
                    {t("startGame")}
                  </Button>
                </>
              )}
              {!isViewerHost && (
                <div className="flex w-full flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner className="h-4 w-4" />
                    {t("waitingForHost")} <span className="font-semibold text-foreground">{host?.name}</span> {t("toStartGame")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("inTheRoom")}
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {playersLocal} {t("connected")}
            </span>
          </div>
          <PlayerList
            players={room.players}
            viewerId={viewerId}
          />
          <AdBanner variant="compact" className="opacity-90" />
          {isViewerHost && (
            <div className="pt-4">
              <DelegateHostCard />
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}
