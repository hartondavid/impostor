"use client"

import { useGame } from "@/lib/game-context"
import { Player } from "@/lib/types"
import { Crown } from "lucide-react"
import { toast } from "sonner"

export function DelegateHostCard() {
  const { room, viewerId, delegateHost } = useGame()

  if (!room) return null

  const isViewerHost = room.hostId === viewerId
  const delegateCandidates = room.players.filter((p) => !p.isHost)

  if (!isViewerHost || delegateCandidates.length === 0) return null

  const onDelegateHost = async (player: Player) => {
    await delegateHost(player.id)
    toast.success(`${player.name} este noul host!`)
  }

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold text-accent">Deleagă rolul de gazdă</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Transferă corona de gazdă unui alt jucător.
      </p>
      <ul className="flex flex-col gap-2">
        {delegateCandidates.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onDelegateHost(p)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card/60 px-3 py-2 text-left text-sm transition-colors hover:border-accent/40 hover:bg-card"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: `color-mix(in oklab, ${p.avatarColor} 25%, transparent)`,
                  color: p.avatarColor,
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 font-medium">{p.name}</span>
              <Crown className="h-3.5 w-3.5 text-accent opacity-60" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
