"use client"

import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, LogOut, Sparkles } from "lucide-react"
import { toast } from "sonner"

// Persistent header for any in-room screen.
// Shows the room code (with copy), live status pill and a leave button.
export function RoomHeader() {
  const { room, leaveRoom, viewAs } = useGame()

  if (!room) return null

  const statusLabel: Record<typeof room.status, string> = {
    waiting: "Waiting for players",
    ready: "Ready to start",
    in_progress: "Round in progress",
    round_finished: "Round finished",
  }

  const statusColor: Record<typeof room.status, string> = {
    waiting: "bg-muted text-muted-foreground",
    ready: "bg-accent/15 text-accent border border-accent/30",
    in_progress: "bg-primary/15 text-primary border border-primary/30",
    round_finished: "bg-destructive/15 text-destructive border border-destructive/30",
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(room.code)
      toast.success("Room code copied to clipboard")
    } catch {
      toast.error("Could not copy code")
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Word Hunt
            </span>
            <span className="font-mono text-sm font-semibold tracking-wider">
              {room.code}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onCopy}
            aria-label="Copy room code"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-flex ${statusColor[room.status]}`}
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-current" />
            {statusLabel[room.status]}
          </Badge>
          <Badge
            variant="outline"
            className="hidden rounded-full border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground md:inline-flex"
          >
            Viewing as {viewAs}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={leaveRoom}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            Leave
          </Button>
        </div>
      </div>
    </header>
  )
}
