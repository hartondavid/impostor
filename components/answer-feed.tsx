"use client"

import type { AnswerEntry, Player } from "@/lib/types"
import { ArrowRight, MessageSquare, Mic } from "lucide-react"

interface AnswerFeedProps {
  history: AnswerEntry[]
  players: Player[]
}

// Live transcript of every question the guesser has asked. Players answer
// VERBALLY (out loud), so we don't store a written reply — we just record
// which player got the question. Newest first for quick scanning.
export function AnswerFeed({ history, players }: AnswerFeedProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Nicio întrebare încă</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Alege un jucător și folosește o întrebare sugerată — el îți va
          răspunde cu voce tare.
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
                Întrebare
              </span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium text-foreground">
                {player?.name ?? "Jucător"}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              {entry.question}
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-secondary/40 px-2.5 py-2 text-xs text-muted-foreground">
              <Mic className="h-3.5 w-3.5 text-accent" />
              <span>Răspuns verbal — ascultă răspunsul jucătorului.</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
