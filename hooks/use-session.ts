"use client"

import { useEffect, useState } from "react"
import { Player } from "@/lib/types"

// Generate a random UUID-like string for player ID
function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

export function useSession() {
  const [playerId, setPlayerId] = useState<string>("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    let storedId = localStorage.getItem("wg_player_id")
    if (!storedId) {
      storedId = `p_${generateId()}`
      localStorage.setItem("wg_player_id", storedId)
    }
    
    setPlayerId(storedId)
    setIsLoaded(true)
  }, [])

  return {
    playerId,
    isLoaded
  }
}
