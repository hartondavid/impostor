"use client"

import type { Player } from "@/lib/types"
import { Crown, Eye, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlayerListProps {
  players: Player[]
  // Highlight the local viewer's player
  viewerId?: string | null
  // When provided, makes each row clickable (used by the guesser to pick someone to ask)
  onPlayerClick?: (player: Player) => void
  // Players whose ids are in this set get a "asked" indicator
  askedIds?: Set<string>
}

// Reusable list of players. Used in lobby + guesser dashboard + result screen.
export function PlayerList({
  players,
  viewerId,
  onPlayerClick,
  askedIds,
}: PlayerListProps) {
  return (
    <ul role="list" className="flex flex-col gap-2">
      {players.map((p) => {
        const isViewer = p.id === viewerId
        const asked = askedIds?.has(p.id)
        const interactive = Boolean(onPlayerClick)
        const initial = p.name.charAt(0).toUpperCase()

        return (
          <li key={p.id}>
            <button
              type="button"
              disabled={!interactive}
              onClick={() => onPlayerClick?.(p)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl border border-border bg-card/60 p-3 text-left transition-colors",
                interactive
                  ? "hover:border-primary/40 hover:bg-card cursor-pointer"
                  : "cursor-default",
                isViewer && "ring-1 ring-primary/40",
              )}
            >
              <div
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `color-mix(in oklab, ${p.avatarColor} 25%, transparent)`,
                  color: p.avatarColor,
                }}
              >
                {initial}
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                    p.connected ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                  aria-label={p.connected ? "online" : "offline"}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2 truncate text-sm font-medium">
                  {p.name}
                  {isViewer && (
                    <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      You
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {p.isHost && (
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Crown className="h-3 w-3" /> Host
                    </span>
                  )}
                  {p.isGuesser && (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <Eye className="h-3 w-3" /> Guesser
                    </span>
                  )}
                  {!p.isHost && !p.isGuesser && (
                    <span className="inline-flex items-center gap-1">
                      <Wifi className="h-3 w-3" /> Player
                    </span>
                  )}
                </span>
              </div>

              {asked && (
                <span className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Asked
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
