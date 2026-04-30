"use client"

import { useMemo, useState } from "react"
import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { GameStatusBanner } from "@/components/game-status-banner"
import { QuestionCard } from "@/components/question-card"
import { AnswerFeed } from "@/components/answer-feed"
import { PlayerList } from "@/components/player-list"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { CheckCircle2, Send } from "lucide-react"
import { toast } from "sonner"

// Guesser's dashboard. They DO NOT see the secret word — only:
// - the next suggested question
// - the list of players to ask
// - their question/answer history
// - a final guess input
export function GuesserView() {
  const { room, askPlayer, skipQuestion, submitGuess, currentQuestion } =
    useGame()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [guess, setGuess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const round = room?.currentRound
  const askedIds = useMemo(() => {
    return new Set(round?.history.map((h) => h.toPlayerId) ?? [])
  }, [round?.history])

  if (!room || !round) return null

  // Players the guesser can ask = everyone except themselves.
  const askable = room.players.filter((p) => p.id !== round.guesserId)

  const onAsk = () => {
    if (!currentQuestion) {
      toast.error("Nu există o întrebare sugerată acum.")
      return
    }
    if (!selectedPlayerId) {
      toast.error("Alege întâi un jucător.")
      return
    }
    const player = room.players.find((p) => p.id === selectedPlayerId)
    askPlayer(currentQuestion.text, selectedPlayerId)
    skipQuestion()
    setSelectedPlayerId(null)
    toast(`${player?.name ?? "Jucătorul"} răspunde verbal.`)
  }

  const onSubmitGuess = () => {
    if (guess.trim().length < 2) {
      toast.error("Scrie verbul ghicit înainte de a trimite.")
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      submitGuess(guess.trim())
      setSubmitting(false)
    }, 250)
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <GameStatusBanner
          viewAs="guesser"
          title="Tu ești Ghicitorul"
          subtitle="Pune întrebări jucătorilor și ghicește verbul secret. Verbul real este înlocuit peste tot cu „a tipota”. Ascultă răspunsurile verbale ca să-ți dai seama."
        />

        <QuestionCard
          question={currentQuestion}
          total={round.questions.length}
          current={round.currentQuestionIndex}
          onSkip={skipQuestion}
          onAsk={selectedPlayerId ? onAsk : undefined}
          disabled={!selectedPlayerId}
        />

        {!selectedPlayerId && (
          <p className="text-xs text-muted-foreground">
            Sfat: alege un jucător din dreapta pentru a activa „Folosește
            această întrebare”.
          </p>
        )}

        {/* Final guess */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="guess">Verbul tău (ghicire finală)</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="guess"
                  placeholder="ex. a alerga"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmitGuess()
                  }}
                  className="flex-1"
                />
                <Button onClick={onSubmitGuess} disabled={submitting}>
                  {submitting ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Trimite
                    </>
                  )}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </div>

        {/* History */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Istoric · {round.history.length} întrebări puse
          </h3>
          <AnswerFeed history={round.history} players={room.players} />
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Jucători</h3>
            <span className="text-xs text-muted-foreground">
              Apasă pentru a selecta
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {askedIds.size} din {askable.length} întrebați
          </p>
          <div className="mt-3">
            <PlayerList
              players={askable}
              askedIds={askedIds}
              onPlayerClick={(p) => setSelectedPlayerId(p.id)}
            />
          </div>
          {selectedPlayerId && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-2 text-xs text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Selected: {askable.find((p) => p.id === selectedPlayerId)?.name}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Round progress</span>
          <ul className="mt-2 space-y-1">
            <li>
              Questions used:{" "}
              <span className="text-foreground">
                {round.questions.filter((q) => q.skipped || q.used).length}
              </span>{" "}
              / {round.questions.length}
            </li>
            <li>
              Players asked:{" "}
              <span className="text-foreground">{askedIds.size}</span> /{" "}
              {askable.length}
            </li>
          </ul>
        </div>
      </aside>
    </main>
  )
}
