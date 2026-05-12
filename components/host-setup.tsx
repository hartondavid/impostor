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
import { Sparkles, AlertCircle, Shuffle, UserCheck } from "lucide-react"
import { toast } from "sonner"
import type { Player } from "@/lib/types"
import { DelegateHostCard } from "@/components/delegate-host"

// Host-only screen for choosing the secret verb and managing players.
// Three panels:
//  1) Guesser selection — random roll or manual pick from the list
//  2) Word configuration — optional typed seed or empty + Generate + Start round
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
  } = useGame()

  const { t, language } = useLanguage()
  const [guesserMode, setGuesserMode] = useState<"random" | "pick">("random")
  const [gameLanguage, setGameLanguage] = useState<"en" | "ro">(language as "en" | "ro")
  const [autoVerbSeed, setAutoVerbSeed] = useState("")

  if (!room) return null
  const isViewerHost = room.hostId === viewerId

  // Players eligible to be guesser (anyone except the current host)
  const eligiblePlayers = room.players.filter((p) => p.id !== room.hostId)

  const onGeneratePreview = async () => {
    if (!guesser) return
    const result = await generateWord(autoVerbSeed.trim() || undefined, gameLanguage)
    if (!result) {
      toast.error(t("hostGenErrorFallback"))
      return
    }
    toast.success(t("hostWordSelected"))
    setAutoVerbSeed(result.word)
  }

  /**
   * Secret verb always comes from the input at click time (min. 2 characters).
   * Regenerates questions so edits after "Generate" still match the typed verb.
   */
  const onStartRound = async () => {
    if (!guesser || isGeneratingWord) return
    const trimmed = autoVerbSeed.trim()
    if (trimmed.length < 2) return

    const result = await generateWord(trimmed, gameLanguage)
    if (!result) {
      toast.error(t("hostGenErrorFallback"))
      return
    }
    setAutoVerbSeed(result.word)
    startRound(result.word, result.questions, "manual", gameLanguage)
  }

  const trimmedVerb = autoVerbSeed.trim()
  const canStartRound = !!guesser && !isGeneratingWord && trimmedVerb.length >= 2

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

            <div className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="ai-verb-seed">{t("hostVerbOrGenerate")}</FieldLabel>
                  <Input
                    id="ai-verb-seed"
                    placeholder={t("hostVerbPlaceholderOptional")}
                    value={autoVerbSeed}
                    onChange={(e) => setAutoVerbSeed(e.target.value)}
                    maxLength={48}
                  />
                  <FieldDescription>{t("hostVerbOrGenerateHint")}</FieldDescription>
                </Field>
              </FieldGroup>

              <Button
                type="button"
                variant="outline"
                onClick={onGeneratePreview}
                disabled={isGeneratingWord || !guesser}
                className="w-full sm:w-fit"
              >
                {isGeneratingWord ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {t("hostGenerateWord")}
              </Button>

              <Button
                onClick={() => void onStartRound()}
                disabled={!canStartRound}
                size="lg"
                className="w-full sm:w-fit"
              >
                {t("hostGenAndStart")}
              </Button>
            </div>

            {!guesser && (
              <p className="text-xs text-destructive">{t("hostPickGuesserFirst")}</p>
            )}

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
