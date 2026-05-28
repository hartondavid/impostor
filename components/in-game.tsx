"use client"

import { useGame } from "@/lib/game-context"
import { RoomHeader } from "@/components/room-header"
import { PlayerView } from "@/components/player-view"
import { ImpostorView } from "@/components/impostor-view"

export function InGame() {
  const { viewAs } = useGame()

  return (
    <div className="min-h-screen">
      <RoomHeader />
      {viewAs === "impostor" ? <ImpostorView /> : <PlayerView />}
    </div>
  )
}
