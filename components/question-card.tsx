"use client"

import type { QuestionItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { SkipForward, MessageCircleQuestion } from "lucide-react"

interface QuestionCardProps {
  question: QuestionItem | null
  total: number
  current: number
  onSkip: () => void
  onAsk?: () => void
  // Disabled state used when the guesser has already asked all players or
  // is waiting for an answer.
  disabled?: boolean
}

// The big "what to ask next" card shown at the top of the guesser view.
export function QuestionCard({
  question,
  total,
  current,
  onSkip,
  onAsk,
  disabled,
}: QuestionCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <MessageCircleQuestion className="h-4 w-4 text-primary" />
          Suggested question
        </div>
        <span className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
          {Math.min(current + 1, total)} / {total}
        </span>
      </div>

      <p className="mt-3 text-balance text-xl font-semibold leading-snug sm:text-2xl">
        {question?.text ?? "No more suggestions — trust your instincts!"}
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {onAsk && (
          <Button
            onClick={onAsk}
            disabled={disabled || !question}
            className="flex-1"
          >
            Use this question
          </Button>
        )}
        <Button
          onClick={onSkip}
          variant="outline"
          disabled={disabled || !question}
          className="flex-1 bg-transparent"
        >
          <SkipForward className="mr-2 h-4 w-4" /> Skip
        </Button>
      </div>
    </div>
  )
}
