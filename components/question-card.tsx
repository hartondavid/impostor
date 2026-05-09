"use client"

import type { QuestionItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { SkipForward, MessageCircleQuestion, Plus, Loader2 } from "lucide-react"

interface QuestionCardProps {
  question: QuestionItem | null
  total: number
  current: number
  onSkip: () => void
}

// The big "what to ask next" card shown at the top of the guesser view.
export function QuestionCard({
  question,
  total,
  current,
  onSkip,
}: QuestionCardProps) {
  const { getMoreQuestions, isGeneratingQuestions } = useGame()
  const { t } = useLanguage()

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <MessageCircleQuestion className="h-4 w-4 text-primary" />
          {t("suggestedQuestion")}
        </div>
        <span className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
          {Math.min(current + 1, total)} / {total}
        </span>
      </div>

      <p className="mt-3 text-balance text-xl font-semibold leading-snug sm:text-2xl">
        {question?.text ?? t("noMoreSuggestions")}
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {question ? (
          <Button
            onClick={onSkip}
            variant="outline"
            className="flex-1 bg-transparent border-primary/20 hover:bg-primary/5 text-primary"
          >
            <SkipForward className="mr-2 h-4 w-4" /> {t("nextQuestion")}
          </Button>
        ) : (
          <Button
            onClick={getMoreQuestions}
            disabled={isGeneratingQuestions}
            className="flex-1"
          >
            {isGeneratingQuestions ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {t("generateMoreQuestions")}
          </Button>
        )}
      </div>
    </div>
  )
}
