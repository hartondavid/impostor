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
import { Sparkles, AlertCircle, Shuffle, Users } from "lucide-react"
import { toast } from "sonner"
import { DelegateHostCard } from "@/components/delegate-host"
import { CATEGORIES_EN } from "@/lib/mock-data-en"
import type { WordPack } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdBanner } from "@/components/ad-banner"

// Host-only screen for choosing the secret word/category.
// Guesser (Impostor) selection is now automatic and secret upon starting the round.
export function HostSetup() {
  const {
    room,
    viewerId,
    isGeneratingWord,
    genError,
    generateWord,
    startRound,
  } = useGame()

  const { t, language } = useLanguage()
  const [gameLanguage, setGameLanguage] = useState<"en" | "ro">(language as "en" | "ro")
  
  // Word pack selection
  const [selectedPack, setSelectedPack] = useState<WordPack | null>(null)
  const [customWord, setCustomWord] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [activeTab, setActiveTab] = useState("custom")

  if (!room) return null
  const isViewerHost = room.hostId === viewerId

  const onGeneratePreview = async () => {
    const result = await generateWord(undefined, undefined, gameLanguage)
    if (!result) {
      toast.error(t("hostGenErrorFallback"))
      return
    }
    toast.success(t("hostWordSelected"))
    setSelectedPack(result)
    setCustomWord("")
    setCustomCategory("")
  }

  const onStartRound = async () => {
    if (room.players.length < 3) {
      toast.error(t("hostMinPlayersError"))
      return
    }

    if (activeTab === "custom") {
      if (customWord.trim().length < 2) {
        toast.error(t("hostNoWordWarning") || "Please enter a word.");
        return;
      }
      const pack = await generateWord(customWord, customCategory, gameLanguage)
      if (pack) {
        startRound(pack, "manual", gameLanguage)
      }
      return
    }

    if (activeTab === "random") {
      if (!selectedPack) {
        toast.error(t("hostNoWordWarning"))
        return
      }
      startRound(selectedPack, "random", gameLanguage)
    }
  }

  const canStartRound = activeTab === "custom" ? customWord.trim().length >= 2 : selectedPack !== null

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
          <GameStatusBanner
            viewAs="host"
            title={t("hostConfigureRound")}
            subtitle={t("hostStartRoundNote")}
          />

          {/* Language selection */}
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

          <AdBanner />

          {/* Word selection panel */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-base">{t("hostChooseWord")}</h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="custom">Custom</TabsTrigger>
                <TabsTrigger value="random">Random</TabsTrigger>
              </TabsList>
              
              <TabsContent value="custom" className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="custom-word">{t("hostWordOrGenerate")}</FieldLabel>
                    <Input
                      id="custom-word"
                      placeholder={t("hostVerbPlaceholderOptional")}
                      value={customWord}
                      onChange={(e) => {
                        setCustomWord(e.target.value)
                        if (selectedPack) setSelectedPack(null)
                      }}
                      maxLength={48}
                    />
                    <FieldDescription>{t("hostVerbOrGenerateHint")}</FieldDescription>
                  </Field>
                  
                  {customWord.trim().length >= 2 && (
                    <Field>
                      <FieldLabel htmlFor="custom-category">{t("hostCategoryLabel")}</FieldLabel>
                      <Input
                        id="custom-category"
                        placeholder="e.g. Location, Object, Person..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        maxLength={24}
                      />
                      <FieldDescription>This is the only clue the Impostor will get.</FieldDescription>
                    </Field>
                  )}
                </FieldGroup>
              </TabsContent>

              <TabsContent value="random" className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onGeneratePreview}
                  disabled={isGeneratingWord}
                  className="w-full sm:w-fit"
                >
                  {isGeneratingWord ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : (
                    <Shuffle className="mr-2 h-4 w-4" />
                  )}
                  {t("hostGenerateWord")}
                </Button>

                {selectedPack && (
                  <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {selectedPack.category} {selectedPack.emoji}
                      </div>
                      <div className="text-xl font-bold">{selectedPack.word}</div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={onStartRound}
                  disabled={!canStartRound || room.players.length < 3}
                  size="lg"
                  className="w-full sm:w-fit bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t("hostGenAndStart")}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("hostGenAndStartDesc")}
                </p>
              </div>
            </div>

            {genError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {t("hostGenFailed1")} {genError}. {t("hostGenFailed2")}
                </span>
              </div>
            )}
        </section>

        <aside className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("playersCount")} ({room.players.length})
              </h2>
            </div>
            
            {room.players.length < 3 && (
              <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Need at least 3 players to play.
              </div>
            )}
            
            <PlayerList
              players={room.players}
              viewerId={viewerId}
              hideGuesserBadge={true} // Nobody knows who it is yet!
            />
          </div>

          <DelegateHostCard />
        </aside>
      </main>
    </div>
  )
}
