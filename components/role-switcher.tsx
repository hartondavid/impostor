"use client"

import { useGame } from "@/lib/game-context"
import { Crown, Eye, Users } from "lucide-react"
import { cn } from "@/lib/utils"

// Floating bottom switcher: lets the demo user toggle between
// guesser / regular player perspectives during a round.
// In a real multiplayer build this would be replaced by a real socket-based role.
export function RoleSwitcher() {
  const { viewAs, setViewAs, room, viewerId } = useGame()
  if (!room?.currentRound) return null

  const isHost = room.hostId === viewerId

  const options = [
    { v: "guesser" as const, icon: Eye, label: "Guesser" },
    { v: "player" as const, icon: Users, label: "Player" },
    ...(isHost
      ? [{ v: "host" as const, icon: Crown, label: "Host" }]
      : []),
  ]

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-lg backdrop-blur">
        <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Preview as
        </span>
        {options.map(({ v, icon: Icon, label }) => (
          <button
            key={v}
            onClick={() => setViewAs(v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              viewAs === v
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={viewAs === v}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
