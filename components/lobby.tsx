"use client"

import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { PlayerList } from "@/components/player-list"
import { RoomHeader } from "@/components/room-header"
import { Spinner } from "@/components/ui/spinner"
import { Eye, Play, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { DelegateHostCard } from "@/components/delegate-host"

// Lobby = pre-game waiting room. Host can add fake players (for demo / testing
// without a backend) and start the game once at least one other player is in.
export function Lobby() {
  const {
    room,
    viewerId,
    viewAs,
    setViewAs,
    assignGuesser,
    setScreen,
    startRound,
    isGeneratingWord,
  } = useGame()

  if (!room) return null

  const host = room.players.find((p) => p.isHost)
  const isViewerHost = host?.id === viewerId
  const playersLocal = room.players.length

  const onStart = () => {
    if (room.players.length < 2) {
      toast.error("Need at least 2 players to start")
      return
    }
    assignGuesser()
    setScreen("host_setup")
  }



  return (
    <div className="min-h-screen">
      <RoomHeader />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        {/* Left: hero / instructions */}
        <section className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Lobby
            </span>
            <h1 className="mt-3 text-pretty text-3xl font-semibold sm:text-4xl">
              Share your room code, then start the hunt.
            </h1>
            <p className="mt-2 text-pretty text-muted-foreground">
              Odată ce toată lumea e în sală, gazda alege un Ghicitor și un cuvânt secret.{" "}
              <span className="text-foreground">Jucătorii află cine ghicește abia când runda pornește.</span>
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatTile label="Players" value={String(playersLocal)} />
              <StatTile
                label="Status"
                value={room.status === "waiting" ? "Waiting" : "Ready"}
              />
              <StatTile label="Rounds played" value={String(room.pastRounds.length)} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {isViewerHost && (
                <>
                  <Button onClick={onStart} size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Start game
                  </Button>
                </>
              )}
              {!isViewerHost && (
                <div className="flex w-full flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner className="h-4 w-4" />
                    Waiting for host {host?.name} to start the game…
                  </div>
                </div>
              )}
            </div>
          </div>


        </section>

        {/* Right: player list */}
        <aside className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              In the room
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {playersLocal} connected
            </span>
          </div>
          <PlayerList
            players={room.players}
            viewerId={viewerId}
            hideGuesserBadge={!isViewerHost}
          />
          <div className="pt-4">
            <DelegateHostCard />
          </div>
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
