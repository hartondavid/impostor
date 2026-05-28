"use client"

import { GameProvider, useGame } from "@/lib/game-context"
import { Landing } from "@/components/landing"
import { Lobby } from "@/components/lobby"
import { HostSetup } from "@/components/host-setup"
import { InGame } from "@/components/in-game"
import { VotingScreen } from "@/components/voting-screen"
import { ResultsScreen } from "@/components/results-modal"
import { Toaster } from "@/components/ui/sonner"
import { LanguageProvider } from "@/lib/language-context"
import { SplashGate } from "@/components/splash-screen"

// Top-level shell that switches screens based on the game state machine.
function GameShell() {
  const { screen } = useGame()
  switch (screen) {
    case "landing":
      return <Landing />
    case "lobby":
      return <Lobby />
    case "host_setup":
      return <HostSetup />
    case "in_game":
      return <InGame />
    case "voting":
      return <VotingScreen />
    case "round_result":
      return <ResultsScreen />
    default:
      return <Landing />
  }
}

export default function Page() {
  return (
    <LanguageProvider>
      <GameProvider>
        <SplashGate>
          <GameShell />
        </SplashGate>
        <Toaster richColors theme="dark" position="top-center" />
      </GameProvider>
    </LanguageProvider>
  )
}
