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
import { Sparkles, Type, AlertCircle, Shuffle, UserCheck, Crown } from "lucide-react"
import { toast } from "sonner"
import type { Player } from "@/lib/types"
import { DelegateHostCard } from "@/components/delegate-host"

// Host-only screen for choosing the secret word and managing players.
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

  const [mode, setMode] = useState<"auto" | "manual">("auto")
  const [manualWord, setManualWord] = useState("")
  const [guesserMode, setGuesserMode] = useState<"random" | "pick">("random")

  if (!room) return null
  const isViewerHost = room.hostId === viewerId

  // Players eligible to be guesser (anyone except the current host)
  const eligiblePlayers = room.players.filter((p) => p.id !== room.hostId)

  // ── Word handlers ──
  const onGenerate = async () => {
    const result = await generateWord()
    if (!result) {
      toast.error("Couldn't generate a word. Using fallback.")
      return
    }
    toast.success("Cuvânt random selectat.")
    startRound(result.word, result.definition, result.questions, "gemini")
  }

  const onManualStart = async () => {
    if (manualWord.trim().length < 2) {
      toast.error("Scrie un cuvânt cu cel puțin 2 litere.")
      return
    }
    const result = await generateWord(manualWord.trim())
    if (!result) return
    startRound(result.word, result.definition, result.questions, "manual")
  }

  // ── Guesser handlers ──
  const onRandomGuesser = async () => {
    await assignGuesser()
    toast.success("Ghicitor ales random!")
  }

  const onPickGuesser = async (player: Player) => {
    await setGuesser(player.id)
    toast.success(`${player.name} a fost selectat ca ghicitor.`)
  }

  if (!isViewerHost) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <Spinner className="h-8 w-8 mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Rolul de gazdă a fost delegat</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Nu mai ai acces la setările jocului. Vei fi redirecționat către lobby imediat.
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
                ? "Configurează runda"
                : `Gazda este ${room.players.find((p) => p.isHost)?.name ?? "host"} (demo)`
            }
            subtitle={
              guesser
                ? `Ghicitorul curent: ${guesser.name}. Jucătorii vor afla cine ghicește abia după ce pornești runda.`
                : "Niciun ghicitor ales încă."
            }
          />

          {/* ── Guesser selection panel ── */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-base">Alege ghicitorul</h2>

            <div className="grid gap-2 sm:grid-cols-2">
              <ModeTile
                active={guesserMode === "random"}
                onClick={() => setGuesserMode("random")}
                icon={<Shuffle className="h-4 w-4 text-primary" />}
                title="Alege random"
                description="Aplicația alege random un jucator eligibil."
              />
              <ModeTile
                active={guesserMode === "pick"}
                onClick={() => setGuesserMode("pick")}
                icon={<UserCheck className="h-4 w-4 text-accent" />}
                title="Alege manual"
                description="Selectează tu un jucator din listă."
              />
            </div>

            {guesserMode === "random" ? (
              <div className="pt-1">
                {guesser && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    Ghicitor actual:{" "}
                    <span className="font-semibold text-foreground">{guesser.name}</span>
                  </p>
                )}
                <Button onClick={onRandomGuesser} variant="outline">
                  <Shuffle className="mr-2 h-4 w-4" />
                  {guesser ? "Alege random" : "Alege random"}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-muted-foreground">
                  Apasă pe un jucător pentru a-l face ghicitor.
                </p>
                <PlayerList
                  players={eligiblePlayers}
                  viewerId={viewerId}
                  onPlayerClick={onPickGuesser}
                  hideGuesserBadge={false}
                  rowAction={(p) =>
                    p.isGuesser ? (
                      <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                        Ales
                      </span>
                    ) : null
                  }
                />
              </div>
            )}
          </div>

          {/* ── Word selection panel ── */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-base">Alege cuvântul secret</h2>

            <div className="grid gap-2 sm:grid-cols-2">
              <ModeTile
                active={mode === "auto"}
                onClick={() => setMode("auto")}
                icon={<Sparkles className="h-4 w-4 text-primary" />}
                title="Generează random"
                description="Aplicatia alege automat un verb românesc."
              />
              <ModeTile
                active={mode === "manual"}
                onClick={() => setMode("manual")}
                icon={<Type className="h-4 w-4 text-accent" />}
                title="Introdu manual"
                description="Scrie propriul cuvânt. Noi generăm indiciile."
              />
            </div>

            <div className="mt-2">
              {mode === "manual" ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="word">Cuvântul secret</FieldLabel>
                    <Input
                      id="word"
                      placeholder="ex. a alerga"
                      value={manualWord}
                      onChange={(e) => setManualWord(e.target.value)}
                      maxLength={24}
                      autoFocus
                    />
                    <FieldDescription>
                      Un verb la infinitiv funcționează cel mai bine.
                    </FieldDescription>
                  </Field>
                  <Button
                    onClick={onManualStart}
                    disabled={isGeneratingWord || manualWord.trim().length < 2 || !guesser}
                    size="lg"
                    className="mt-2"
                  >
                    {isGeneratingWord && <Spinner className="mr-2 h-4 w-4" />}
                    Începe runda cu acest cuvânt
                  </Button>
                  {!guesser && (
                    <p className="text-xs text-destructive mt-1">Alege mai întâi un ghicitor.</p>
                  )}
                </FieldGroup>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Vom alege un verb echilibrat împreună cu întrebări amuzante pentru ghicitor.
                  </p>
                  <Button
                    onClick={onGenerate}
                    disabled={isGeneratingWord || !guesser}
                    size="lg"
                    className="mt-4"
                  >
                    {isGeneratingWord ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Se generează…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generează și începe runda
                      </>
                    )}
                  </Button>
                  {!guesser && (
                    <p className="text-xs text-destructive mt-2">Alege mai întâi un ghicitor.</p>
                  )}
                </div>
              )}
            </div>

            {genError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Generarea a eșuat: {genError}. Încearcă din nou sau scrie un cuvânt manual.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── Right sidebar: players + delegate host ── */}
        <aside className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Jucători ({room.players.length})
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
