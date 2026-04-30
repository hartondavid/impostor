"use client"

import type { AnswerEntry, Player } from "@/lib/types"
import { ArrowRight, MessageSquare } from "lucide-react"

interface AnswerFeedProps {
  history: AnswerEntry[]
  players: Player[]
}

// Live transcript of every question the guesser has asked and the
// answers received. Renders in newest-first order for quick scanning.
export function AnswerFeed({ history, players }: AnswerFeedProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No questions asked yet</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Pick a player below and use a suggested question — their answer will
          show up here.
        </p>
      </div>
    )
  }

  const ordered = [...history].reverse()

  return (
    <ul className="flex flex-col gap-3">
      {ordered.map((entry) => {
        const player = players.find((p) => p.id === entry.toPlayerId)
        return (
          <li
            key={entry.id}
            className="rounded-xl border border-border bg-card p-3.5"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-semibold uppercase tracking-wider text-primary">
                Asked
              </span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium text-foreground">
                {player?.name ?? "Player"}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              {entry.question}
            </p>
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-secondary/40 p-2.5">
              <span className="mt-0.5 rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                Reply
              </span>
              <p className="text-sm leading-relaxed">{entry.answer}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
