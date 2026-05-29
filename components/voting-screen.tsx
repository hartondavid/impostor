"use client"

import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { RoomHeader } from "@/components/room-header"
import { GameStatusBanner } from "@/components/game-status-banner"
import { Button } from "@/components/ui/button"
import { ShieldAlert, CheckCircle2, User } from "lucide-react"
import { AdBanner } from "@/components/ad-banner"

export function VotingScreen() {
  const { room, viewerId, castVote, revealResult, viewAs } = useGame()
  const { t } = useLanguage()

  const round = room?.currentRound
  if (!room || !round) return null

  const votes = round.votes
  const myVote = viewerId ? votes[viewerId] : undefined
  const totalVotes = Object.keys(votes).length
  const totalPlayers = room.players.length
  
  const viewer = room.players.find(p => p.id === viewerId)
  const isViewerSpectator = viewer?.isSpectator
  
  // Everyone but you, and not spectators
  const eligibleTargets = room.players.filter(p => p.id !== viewerId && !p.isSpectator)

  return (
    <div className="min-h-screen">
      <RoomHeader />
      <main className="mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:px-6">
        <section className="space-y-6">
          <GameStatusBanner
            viewAs={viewAs}
            title={t("votingTitle")}
            subtitle={t("votingSubtitle")}
          />

          <AdBanner />

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{t("playersCount")}</h2>
              <span className="text-sm font-medium text-muted-foreground">
                {totalVotes} / {totalPlayers} {t("votesLabel")}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {eligibleTargets.map((player) => {
                const isSelected = myVote === player.id

                return (
                  <button
                    key={player.id}
                    onClick={() => !isViewerSpectator && castVote(player.id)}
                    disabled={isViewerSpectator}
                    className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : isViewerSpectator 
                          ? "border-border bg-background opacity-50 cursor-not-allowed"
                          : "border-border bg-background hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 font-semibold text-base">{player.name}</div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                {myVote ? (
                  <span>
                    {t("youVotedFor")} <span className="font-bold text-foreground">{room.players.find(p => p.id === myVote)?.name}</span>. {t("waitingForOthers")}
                  </span>
                ) : (
                  <span>{t("votingWaiting")}</span>
                )}
              </div>

              {viewerId === room.hostId && (
                <Button 
                  size="lg" 
                  onClick={revealResult}
                  className="w-full sm:w-auto font-bold bg-destructive text-white hover:bg-destructive/90"
                >
                  <ShieldAlert className="mr-2 h-5 w-5" />
                  {t("revealResult")}
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
