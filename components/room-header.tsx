"use client"

import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, LogOut, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

export function RoomHeader() {
  const { room, leaveRoom, viewAs, viewerId } = useGame()
  const { t } = useLanguage()

  if (!room) return null

  const statusLabel: Record<typeof room.status, string> = {
    waiting: t("waitingForPlayers"),
    ready: t("readyToStart"),
    in_progress: t("roundInProgress"),
    voting: t("votingInProgress"),
    round_finished: t("roundFinished"),
  }

  const statusColor: Record<typeof room.status, string> = {
    waiting: "bg-muted text-muted-foreground",
    ready: "bg-accent/15 text-accent border border-accent/30",
    in_progress: "bg-primary/15 text-primary border border-primary/30",
    voting: "bg-destructive/15 text-destructive border border-destructive/30",
    round_finished: "bg-destructive/15 text-destructive border border-destructive/30",
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(room.code)
      toast.success(t("codeCopied"))
    } catch {
      toast.error(t("codeError"))
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/90 text-white shadow-sm shadow-destructive/30">
            <ShieldAlert className="h-4 w-4" aria-hidden />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("appName")}
            </span>
            <button
              className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-widest hover:text-primary transition-colors"
              onClick={onCopy}
              aria-label="Copy room code"
            >
              {room.code}
              <Copy className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewerId === room.hostId && (
            <Badge className="hidden rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold text-accent sm:inline-flex">
              {t("youAreTheHostBadge")}
            </Badge>
          )}
          <Badge
            className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-flex ${statusColor[room.status]}`}
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-current" />
            {statusLabel[room.status]}
          </Badge>
          <LanguageSelector />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={leaveRoom}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            {t("leave")}
          </Button>
        </div>
      </div>
    </header>
  )
}
