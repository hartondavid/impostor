"use client"

import { useState, useRef, useEffect } from "react"
import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquarePlus } from "lucide-react"

export function SpokenWordsLog() {
  const { room, viewerId, addSpokenWord } = useGame()
  const { t } = useLanguage()
  const [text, setText] = useState("")
  const logEndRef = useRef<HTMLDivElement>(null)

  const words = room?.currentRound?.spokenWords || []

  // Auto-scroll to bottom when new words are added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [words.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      addSpokenWord(text)
      setText("")
    }
  }

  return (
    <div className="flex flex-col h-[400px] rounded-2xl border border-border bg-card overflow-hidden">
      <div className="bg-secondary/40 p-3 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          {t("spokenWordsLabel")}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
        {words.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("noWordsYet")}
          </div>
        ) : (
          words.map((w) => {
            const player = room?.players.find((p) => p.id === w.playerId)
            const isMe = w.playerId === viewerId

            return (
              <div
                key={w.id}
                className={`flex flex-col max-w-[85%] ${
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <span className="text-[10px] font-semibold uppercase text-muted-foreground mb-0.5 px-1">
                  {isMe ? t("you") : player?.name || "Unknown"}
                </span>
                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-secondary text-secondary-foreground rounded-tl-sm"
                  }`}
                >
                  {w.text}
                </div>
              </div>
            )
          })
        )}
        <div ref={logEndRef} />
      </div>

      <div className="p-3 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("typeWordPlaceholder")}
            className="flex-1 bg-background"
            maxLength={60}
          />
          <Button type="submit" disabled={!text.trim()} size="sm">
            {t("addWordBtn")}
          </Button>
        </form>
      </div>
    </div>
  )
}
