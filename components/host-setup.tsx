"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
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
import { Sparkles, Type, AlertCircle, Shuffle, UserCheck, Crown } from "lucide-react"
import { toast } from "sonner"
import type { Player } from "@/lib/types"
import { DelegateHostCard } from "@/components/delegate-host"
import { VERB_POOL } from "@/lib/mock-data"

// Host-only screen for choosing the secret verb and managing players.
// Three panels:
//  1) Guesser selection — random roll or manual pick from the list
//  2) Word configuration — AI-generate or type manually
//  3) Delegate host — transfer the host crown to someone else
export function HostSetup() {
  const {
    room,
    viewerId,
    guesser,
    isGeneratingWord,
    genError,
    generateWord,
    startRound,
    assignGuesser,
    setGuesser,
    delegateHost,
  } = useGame()

  const { t, language } = useLanguage()
  const [mode, setMode] = useState<"auto" | "manual">("auto")
  const [manualWord, setManualWord] = useState("")
  const [guesserMode, setGuesserMode] = useState<"random" | "pick">("random")
  const [gameLanguage, setGameLanguage] = useState<"en" | "ro">(language as "en" | "ro")
  const [aiPreview, setAiPreview] = useState<{ word: string, questions: string[], language: "en" | "ro" } | null>(null)

  if (!room) return null
  const isViewerHost = room.hostId === viewerId

  // Players eligible to be guesser (anyone except the current host)
  const eligiblePlayers = room.players.filter((p) => p.id !== room.hostId)

  const onGenerate = async () => {
    if (!guesser) return
    const result = await generateWord(undefined, gameLanguage)
    if (!result) {
      toast.error(t("hostGenErrorFallback"))
      return
    }
    toast.success(t("hostWordSelected"))
    startRound(result.word, result.questions, "random", gameLanguage)
  }

  const onGeneratePreview = async () => {
    if (!guesser) return
    const result = await generateWord(undefined, gameLanguage)
    if (!result) {
      toast.error(t("hostGenErrorFallback"))
      return
    }
    toast.success(t("hostWordSelected"))
    setAiPreview({ ...result, language: gameLanguage })
  }

  const onStartAiPreview = () => {
    if (!aiPreview) return
    startRound(aiPreview.word, aiPreview.questions, "random", aiPreview.language)
  }

  const onManualStart = async () => {
    if (!guesser) return
    if (manualWord.trim().length < 2) {
      toast.error(t("hostMinLengthError"))
      return
    }
    const result = await generateWord(manualWord, gameLanguage)
    if (!result) {
      toast.error(t("hostGenErrorFallback"))
      return
    }
    startRound(result.word, result.questions, "manual", gameLanguage)
  }

  // ── Guesser handlers ──
  const onRandomGuesser = async () => {
    await assignGuesser()
    toast.success(t("hostRandomGuesserSuccess"))
  }

  const onPickGuesser = async (player: Player) => {
    await setGuesser(player.id)
    toast.success(`${player.name} ${t("hostGuesserSelected")}`)
  }

  if (!isViewerHost) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <Spinner className="h-8 w-8 mx-auto text-primary" />
          <h2 className="text-xl font-semibold">{t("hostDelegated")}</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {t("hostDelegatedDesc")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <RoomHeader />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {/* ── Status banner ── */}
          <GameStatusBanner
            viewAs="host"
            title={
              isViewerHost
                ? t("hostConfigureRound")
                : `${t("hostIsDemo")} ${room.players.find((p) => p.isHost)?.name ?? "host"} (demo)`
            }
            subtitle={
              guesser
                ? `${t("hostCurrentGuesserDesc1")} ${guesser.name}. ${t("hostCurrentGuesserDesc2")}`
                : t("hostNoGuesser")
            }
          />

          {/* ── Game Content Language selection panel ── */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-base">{t("hostDataLanguage")}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant={gameLanguage === "en" ? "default" : "outline"}
                onClick={() => setGameLanguage("en")}
                size="lg"
              >
                English
              </Button>
              <Button
                variant={gameLanguage === "ro" ? "default" : "outline"}
                onClick={() => setGameLanguage("ro")}
                size="lg"
              >
                Română
              </Button>
            </div>
          </div>

          {/* ── Guesser selection panel ── */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-base">{t("hostChooseGuesser")}</h2>

            <div className="grid gap-2 sm:grid-cols-2">
              <ModeTile
                active={guesserMode === "random"}
                onClick={() => setGuesserMode("random")}
                icon={<Shuffle className="h-4 w-4 text-primary" />}
                title={t("hostChooseRandom")}
                description={t("hostRandomDesc")}
              />
              <ModeTile
                active={guesserMode === "pick"}
                onClick={() => setGuesserMode("pick")}
                icon={<UserCheck className="h-4 w-4 text-accent" />}
                title={t("hostChooseManual")}
                description={t("hostManualDesc")}
              />
            </div>

            {guesserMode === "random" ? (
              <div className="pt-1">
                {guesser && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    {t("hostCurrentGuesserLabel")}{" "}
                    <span className="font-semibold text-foreground">{guesser.name}</span>
                  </p>
                )}
                <Button onClick={onRandomGuesser} variant="outline">
                  <Shuffle className="mr-2 h-4 w-4" />
                  {t("hostChooseRandom")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-muted-foreground">
                  {t("hostClickToMakeGuesser")}
                </p>
                <PlayerList
                  players={eligiblePlayers}
                  viewerId={viewerId}
                  onPlayerClick={onPickGuesser}
                  hideGuesserBadge={false}
                  rowAction={(p) =>
                    p.isGuesser ? (
                      <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                        {t("hostPicked")}
                      </span>
                    ) : null
                  }
                />
              </div>
            )}
          </div>

          {/* ── Word selection panel ── */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-base">{t("hostChooseWord")}</h2>

            <div className="grid gap-2 sm:grid-cols-2">
              <ModeTile
                active={mode === "auto"}
                onClick={() => setMode("auto")}
                icon={<Sparkles className="h-4 w-4 text-primary" />}
                title={t("hostGenerateRandom")}
                description={t("hostGenerateRandomDesc")}
              />
              <ModeTile
                active={mode === "manual"}
                onClick={() => setMode("manual")}
                icon={<Type className="h-4 w-4 text-accent" />}
                title={t("hostInputManual")}
                description={t("hostInputManualDesc")}
              />
            </div>

            <div className="mt-2">
              {mode === "manual" ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="word">{t("hostSecretWord")}</FieldLabel>
                    <Input
                      id="word"
                      placeholder={t("hostWordPlaceholder")}
                      value={manualWord}
                      onChange={(e) => setManualWord(e.target.value)}
                      maxLength={24}
                      autoFocus
                    />
                    <FieldDescription>
                      {t("hostWordHint")}
                    </FieldDescription>
                  </Field>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const pool = VERB_POOL[gameLanguage] || VERB_POOL["en"]
                      const randomWord = pool[Math.floor(Math.random() * pool.length)]
                      setManualWord(randomWord)
                    }}
                    className="w-fit"
                  >
                    <Shuffle className="mr-2 h-4 w-4" />
                    {t("hostChooseRandom")}
                  </Button>
                  <Button
                    onClick={onManualStart}
                    disabled={isGeneratingWord || manualWord.trim().length < 2 || !guesser}
                    size="lg"
                    className="mt-2"
                  >
                    {isGeneratingWord && <Spinner className="mr-2 h-4 w-4" />}
                    {t("hostStartWithWord")}
                  </Button>
                  {!guesser && (
                    <p className="text-xs text-destructive mt-1">{t("hostPickGuesserFirst")}</p>
                  )}
                </FieldGroup>
              ) : (
                <div className="space-y-4 pt-1">
                  <p className="text-sm text-muted-foreground">
                    {t("hostGenWaitDesc")}
                  </p>

                  {aiPreview && (
                    <div className="p-4 rounded-xl border border-border bg-secondary/40">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("hostSecretWord")}</p>
                      <p className="font-bold text-lg">{aiPreview.word}</p>
                    </div>
                  )}

                  <div className="flex flex-col items-start gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onGeneratePreview}
                      disabled={isGeneratingWord}
                      className="w-fit"
                    >
                      {isGeneratingWord ? (
                        <Spinner className="mr-2 h-4 w-4" />
                      ) : (
                        <Shuffle className="mr-2 h-4 w-4" />
                      )}
                      {t("hostGenerateWord")}
                    </Button>

                    <Button
                      onClick={onStartAiPreview}
                      disabled={!aiPreview || !guesser || isGeneratingWord}
                      size="lg"
                      className="w-fit"
                    >
                      {t("hostGenAndStart")}
                    </Button>
                  </div>
                  {!guesser && (
                    <p className="text-xs text-destructive mt-2">{t("hostPickGuesserFirst")}</p>
                  )}
                </div>
              )}
            </div>

            {genError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {t("hostGenFailed1")} {genError}. {t("hostGenFailed2")}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── Right sidebar: players + delegate host ── */}
        <aside className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("playersCount")} ({room.players.length})
            </h2>
            <PlayerList
              players={room.players}
              viewerId={viewerId}
              hideGuesserBadge={false}
            />
          </div>

          {/* Delegate host section — only shown to the current host */}
          <DelegateHostCard />
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
      className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${active
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
