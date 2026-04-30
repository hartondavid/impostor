"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { RoomHeader } from "@/components/room-header"
import { GameStatusBanner } from "@/components/game-status-banner"
import { PlayerList } from "@/components/player-list"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Sparkles, Type, AlertCircle } from "lucide-react"
import { toast } from "sonner"

// Host-only screen for choosing the secret word. Two paths:
// 1) Generate with Gemini
// 2) Type a custom word — Gemini still generates definition + questions for it
export function HostSetup() {
  const {
    room,
    viewerId,
    guesser,
    isGeneratingWord,
    aiError,
    generateAIRound,
    startRound,
  } = useGame()
  const [mode, setMode] = useState<"gemini" | "manual">("gemini")
  const [manualWord, setManualWord] = useState("")

  if (!room) return null
  const isViewerHost = room.hostId === viewerId

  const onGenerate = async () => {
    const result = await generateAIRound()
    if (!result) {
      toast.error("Couldn't reach Gemini — used a fallback word.")
      return
    }
    if (result.fallback) toast("Used a fallback word for this round.")
    else toast.success(`Gemini picked a word.`)
    startRound(result.word, result.definition, result.questions, "gemini")
  }

  const onManualStart = async () => {
    if (manualWord.trim().length < 2) {
      toast.error("Please type a word with at least 2 letters.")
      return
    }
    const result = await generateAIRound(manualWord.trim())
    if (!result) return
    startRound(result.word, result.definition, result.questions, "manual")
  }

  return (
    <div className="min-h-screen">
      <RoomHeader />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <GameStatusBanner
            viewAs="host"
            title={
              isViewerHost
                ? "Pick a secret word for this round"
                : `Hosting on behalf of ${room.players.find((p) => p.isHost)?.name ?? "host"} (demo)`
            }
            subtitle={`The Guesser is ${guesser?.name ?? "—"}. They won't see the word — only the rest of you will.`}
          />

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-2 sm:grid-cols-2">
              <ModeTile
                active={mode === "gemini"}
                onClick={() => setMode("gemini")}
                icon={<Sparkles className="h-4 w-4 text-primary" />}
                title="Generate with Gemini"
                description="Let AI choose a fitting word + helper questions."
              />
              <ModeTile
                active={mode === "manual"}
                onClick={() => setMode("manual")}
                icon={<Type className="h-4 w-4 text-accent" />}
                title="Enter word manually"
                description="Type your own. Gemini fills in the hints."
              />
            </div>

            <div className="mt-6">
              {mode === "manual" ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="word">Secret word</FieldLabel>
                    <Input
                      id="word"
                      placeholder="e.g. lighthouse"
                      value={manualWord}
                      onChange={(e) => setManualWord(e.target.value)}
                      maxLength={24}
                      autoFocus
                    />
                    <FieldDescription>
                      One noun works best. Avoid proper names.
                    </FieldDescription>
                  </Field>
                  <Button
                    onClick={onManualStart}
                    disabled={isGeneratingWord || manualWord.trim().length < 2}
                    size="lg"
                    className="mt-2"
                  >
                    {isGeneratingWord && <Spinner className="mr-2 h-4 w-4" />}
                    Start round with this word
                  </Button>
                </FieldGroup>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll ask Gemini for a balanced, family-friendly word
                    along with 6 progressive questions to help the Guesser.
                  </p>
                  <Button
                    onClick={onGenerate}
                    disabled={isGeneratingWord}
                    size="lg"
                    className="mt-4"
                  >
                    {isGeneratingWord ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Asking Gemini…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate & start round
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {aiError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  AI request failed: {aiError}. We&apos;ll fall back to a
                  pre-written word if needed.
                </span>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Players ({room.players.length})
          </h2>
          <PlayerList players={room.players} viewerId={viewerId} />
        </aside>
      </main>
    </div>
  )
}

function ModeTile({
  active,
  onClick,
  icon,
  title,
  description,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${
        active
          ? "border-primary/60 bg-primary/10"
          : "border-border bg-secondary/40 hover:bg-secondary/60"
      }`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background">
        {icon}
      </div>
      <div className="font-semibold">{title}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  )
}
