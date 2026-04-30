"use client"

import { useGame } from "@/lib/game-context"
import { GuesserView } from "@/components/guesser-view"
import { PlayerView } from "@/components/player-view"
import { RoomHeader } from "@/components/room-header"
import { RoleSwitcher } from "@/components/role-switcher"

// Wrapper for the in-game screen. Routes to the guesser or player view
// based on the current "viewAs" perspective, with a floating switcher so
// the demo user can experience both.
export function InGame() {
  const { viewAs } = useGame()
  return (
    <div className="min-h-screen pb-24">
      <RoomHeader />
      {viewAs === "guesser" ? <GuesserView /> : <PlayerView />}
      <RoleSwitcher />
    </div>
  )
}
