"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type {
  Player,
  Room,
  Round,
  Screen,
  ViewAs,
  WordSource,
  WordPack,
} from "./types"
import {
  generateRoomCode,
  getRandomWordPack,
  pickNextImpostor,
} from "./mock-data"
import { supabase } from "./supabase"
import { useSession } from "@/hooks/use-session"
import { useLanguage } from "@/lib/language-context"
import { toast } from "sonner"

// ---------- State shape ----------

interface GameState {
  screen: Screen
  room: Room | null
  viewerId: string | null
  viewAs: ViewAs
  isGeneratingWord: boolean
  genError: string | null
}

const initialState: GameState = {
  screen: "landing",
  room: null,
  viewerId: null,
  viewAs: "host",
  isGeneratingWord: false,
  genError: null,
}

// ---------- Context ----------

interface GameContextValue extends GameState {
  impostor: Player | null
  viewer: Player | null
  createRoom: (hostName: string) => Promise<void>
  joinRoom: (code: string, name: string) => Promise<void>
  setScreen: (s: Screen) => void
  setViewAs: (v: ViewAs) => void
  // Start a round with a given word pack — assigns Impostor secretly
  startRound: (pack: WordPack, source: WordSource, gameLanguage: "en" | "ro") => Promise<void>
  // Transition to voting phase
  openVoting: () => Promise<void>
  // Cast a vote: current viewer votes for targetId
  castVote: (targetId: string) => Promise<void>
  // Add a spoken word/clue to the round log
  addSpokenWord: (text: string) => Promise<void>
  // Host reveals the result, tallies votes
  revealResult: () => Promise<void>
  // Impostor's last-chance guess after being caught
  submitImpostorGuess: (guess: string) => Promise<void>
  // Skip round without result
  skipRound: () => Promise<void>
  // Start the next round
  newRound: () => Promise<void>
  // Generate / pick a random word pack
  generateWord: (customWord?: string, customCategory?: string, langOverride?: "en" | "ro") => Promise<WordPack | null>
  // Transfer host crown
  delegateHost: (playerId: string) => Promise<void>
  leaveRoom: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const { playerId, isLoaded } = useSession()
  const { language } = useLanguage()
  const [state, setState] = useState<GameState>(initialState)

  const stateRef = useRef(state)
  stateRef.current = state

  // Auto-rejoin on mount if session exists in localStorage
  useEffect(() => {
    if (!supabase || state.room) return

    const storedCode = localStorage.getItem("wg_room_code")
    const storedName = localStorage.getItem("wg_user_name")

    if (storedCode && storedName) {
      setTimeout(() => {
        joinRoom(storedCode, storedName)
      }, 500)
    }
  }, [supabase, state.room])

  // Internal helper to update both local state (optimistic) and Supabase
  const syncRoom = async (newRoom: Room, nextScreen?: Screen, nextViewAs?: ViewAs) => {
    setState((prev) => ({
      ...prev,
      room: newRoom,
      ...(nextScreen ? { screen: nextScreen } : {}),
      ...(nextViewAs ? { viewAs: nextViewAs } : {}),
    }))

    if (!supabase) {
      console.warn("Supabase client not initialized, local-only mode.")
      return
    }

    try {
      const { error } = await supabase.from("game_rooms").upsert({
        room_code: newRoom.code,
        status: newRoom.status,
        host_id: newRoom.hostId,
        first_host_id: newRoom.firstHostId,
        round_skipped: newRoom.roundSkipped ?? false,
        players: newRoom.players,
        current_round: newRoom.currentRound || null,
        past_rounds: newRoom.pastRounds,
      })
      if (error) {
        console.error(`Failed to sync room to Supabase: [${error.code}] ${error.message}`)
      }
    } catch (err) {
      console.error("Failed to sync room to Supabase", err)
    }
  }

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!supabase || !state.room?.code) return

    const roomCode = state.room.code
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_rooms", filter: `room_code=eq.${roomCode}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setState((prev) => ({ ...prev, room: null, screen: "landing" }))
            localStorage.removeItem("wg_room_code")
            localStorage.removeItem("wg_user_name")
            toast.error("The room was closed.")
            return
          }

          const newDbRoom = payload.new as any
          if (!newDbRoom || !newDbRoom.room_code) return

          setState((prev) => {
            if (prev.room?.code !== roomCode) return prev
            const updatedRoom: Room = {
              code: newDbRoom.room_code,
              status: newDbRoom.status as any,
              hostId: newDbRoom.host_id,
              firstHostId: newDbRoom.first_host_id ?? newDbRoom.host_id,
              players: newDbRoom.players || [],
              currentRound: newDbRoom.current_round || undefined,
              pastRounds: newDbRoom.past_rounds || [],
              createdAt: new Date(newDbRoom.created_at).getTime(),
              roundSkipped: newDbRoom.round_skipped ?? false,
            }
            return { ...prev, room: updatedRoom }
          })
        }
      )
      .subscribe()

    return () => {
      supabase?.removeChannel(channel)
    }
  }, [state.room?.code])

  // Connection Resilience: Remove player from DB on tab close/refresh.
  useEffect(() => {
    const handleBeforeUnload = () => {
      const room = stateRef.current.room
      const meId = stateRef.current.viewerId
      if (!room || !meId || !supabase) return
      const remainingPlayers = room.players.filter((p) => p.id !== meId)

      if (remainingPlayers.length === 0) {
        supabase.from("game_rooms").delete().eq("room_code", room.code).then()
      } else {
        let nextHostId = room.hostId
        let updatedPlayers = remainingPlayers

        if (meId === room.hostId) {
          const nextHost = remainingPlayers[remainingPlayers.length - 1] || remainingPlayers[0]
          nextHostId = nextHost.id
          updatedPlayers = remainingPlayers.map((p) =>
            p.id === nextHostId ? { ...p, isHost: true } : p
          )
        }

        supabase.from("game_rooms").update({
          players: updatedPlayers,
          host_id: nextHostId,
        }).eq("room_code", room.code).then()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  // Auto-sync screen and viewAs based on room status
  useEffect(() => {
    if (!state.room || !state.viewerId) return

    const room = state.room
    const me = room.players.find((p) => p.id === state.viewerId)
    if (!me) return

    let nextScreen = state.screen
    let nextViewAs = state.viewAs

    if (room.status === "waiting") {
      nextScreen = "lobby"
    } else if (room.status === "ready") {
      nextScreen = me.isHost ? "host_setup" : "lobby"
    } else if (room.status === "in_progress") {
      nextScreen = "in_game"
    } else if (room.status === "voting") {
      nextScreen = "voting"
    } else if (room.status === "round_finished") {
      nextScreen = "round_result"
    }

    if (me.isHost) {
      nextViewAs = "host"
    } else if (me.isImpostor) {
      nextViewAs = "impostor"
    } else {
      nextViewAs = "player"
    }

    if (nextScreen !== state.screen || nextViewAs !== state.viewAs) {
      setState((prev) => ({ ...prev, screen: nextScreen, viewAs: nextViewAs }))
    }
  }, [state.room?.status, state.room?.currentRound?.id, state.viewerId])

  // --- Actions ---

  const createRoom = useCallback(
    async (hostName: string) => {
      const normalizedName = hostName.trim()
      if (!normalizedName) return

      const newPlayerId = `p_${normalizedName.toLowerCase().replace(/\s+/g, "_")}`

      const host: Player = {
        id: newPlayerId,
        name: normalizedName,
        isHost: true,
        score: 0,
        isImpostor: false,
        hasBeenImpostor: false,
        avatarColor: "var(--primary)",
        connected: true,
      }
      const room: Room = {
        code: generateRoomCode(),
        hostId: host.id,
        firstHostId: host.id,
        status: "waiting",
        players: [host],
        pastRounds: [],
        createdAt: Date.now(),
        roundSkipped: false,
      }

      setState((prev) => ({ ...prev, viewerId: host.id }))

      localStorage.setItem("wg_room_code", room.code)
      localStorage.setItem("wg_user_name", normalizedName)

      await syncRoom(room, "lobby", "host")
    },
    []
  )

  const joinRoom = useCallback(
    async (code: string, name: string) => {
      if (!supabase) return
      const upperCode = code.toUpperCase()
      const normalizedName = name.trim()
      if (!normalizedName) return

      const newPlayerId = `p_${normalizedName.toLowerCase().replace(/\s+/g, "_")}`

      const { data: rows, error } = await supabase.from("game_rooms").select("*").eq("room_code", upperCode)

      if (error || !rows || rows.length === 0) {
        console.error("Room not found:", error)
        toast.error("Room not found. Check the code or create a new room.")
        localStorage.removeItem("wg_room_code")
        localStorage.removeItem("wg_user_name")
        return
      }

      const data = rows[0]
      const currentPlayers: Player[] = data.players || []
      const existingPlayer = currentPlayers.find((p) => p.id === newPlayerId)

      let players: Player[]
      if (existingPlayer) {
        players = currentPlayers.map((p) =>
          p.id === newPlayerId ? { ...p, connected: true, name: normalizedName } : p
        )
      } else {
        const avatarColors = ["var(--accent)", "var(--destructive)", "var(--muted-foreground)", "var(--primary)"]
        const me: Player = {
          id: newPlayerId,
          name: normalizedName,
          isHost: false,
          score: 0,
          isImpostor: false,
          hasBeenImpostor: false,
          avatarColor: avatarColors[currentPlayers.length % avatarColors.length],
          connected: true,
        }
        players = [...currentPlayers, me]
      }

      setState((prev) => ({ ...prev, viewerId: newPlayerId }))

      localStorage.setItem("wg_room_code", upperCode)
      localStorage.setItem("wg_user_name", normalizedName)

      const updatedRoom: Room = {
        code: data.room_code,
        status: data.status,
        hostId: data.host_id,
        firstHostId: data.first_host_id ?? data.host_id,
        players,
        currentRound: data.current_round,
        pastRounds: data.past_rounds || [],
        createdAt: new Date(data.created_at).getTime(),
        roundSkipped: data.round_skipped ?? false,
      }

      await syncRoom(updatedRoom)
    },
    []
  )

  const setScreen = useCallback((s: Screen) => setState((prev) => ({ ...prev, screen: s })), [])
  const setViewAs = useCallback((v: ViewAs) => setState((prev) => ({ ...prev, viewAs: v })), [])

  const generateWord = useCallback(async (
    customWord?: string,
    customCategory?: string,
    langOverride?: "en" | "ro"
  ) => {
    setState((prev) => ({ ...prev, isGeneratingWord: true, genError: null }))
    try {
      await new Promise((r) => setTimeout(r, 600))

      if (customWord && customWord.trim().length >= 2) {
        const pack: WordPack = {
          id: "custom",
          emoji: "🎯",
          category: customCategory?.trim() || "Custom",
          word: customWord.trim(),
        }
        return pack
      }

      return getRandomWordPack(langOverride || language as "en" | "ro")
    } catch (e) {
      console.error("Word generation failed", e)
      return null
    } finally {
      setState((prev) => ({ ...prev, isGeneratingWord: false }))
    }
  }, [language])

  const startRound = useCallback(
    async (pack: WordPack, source: WordSource, gameLanguage: "en" | "ro") => {
      const room = stateRef.current.room
      if (!room) return

      // Pick impostor randomly from non-host players
      const { player: impostor, cycleReset } = pickNextImpostor(room)

      const updatedPlayers = room.players.map((p) => ({
        ...p,
        isImpostor: p.id === impostor.id,
        hasBeenImpostor: cycleReset
          ? p.id === impostor.id
          : p.hasBeenImpostor || p.id === impostor.id,
      }))

      const round: Round = {
        id: `r_${Math.random().toString(36).slice(2, 9)}`,
        word: pack.word,
        category: pack.category,
        categoryEmoji: pack.emoji,
        source,
        language: gameLanguage,
        impostorId: impostor.id,
        spokenWords: [],
        votes: {},
        votingOpen: false,
        startedAt: Date.now(),
      }

      const me = stateRef.current.viewerId
      const newRoom = { ...room, players: updatedPlayers, currentRound: round, status: "in_progress" as const }
      const myPlayer = updatedPlayers.find((p) => p.id === me)
      const nextViewAs: ViewAs = myPlayer?.isHost ? "host" : myPlayer?.isImpostor ? "impostor" : "player"

      await syncRoom(newRoom, "in_game", nextViewAs)
    },
    []
  )

  const openVoting = useCallback(async () => {
    const room = stateRef.current.room
    if (!room?.currentRound) return

    const newRoom = {
      ...room,
      status: "voting" as const,
      currentRound: { ...room.currentRound, votingOpen: true },
    }
    await syncRoom(newRoom, "voting")
  }, [])

  const castVote = useCallback(async (targetId: string) => {
    const room = stateRef.current.room
    const me = stateRef.current.viewerId
    if (!room?.currentRound || !me) return

    const updatedVotes = { ...room.currentRound.votes, [me]: targetId }
    const newRoom = {
      ...room,
      currentRound: { ...room.currentRound, votes: updatedVotes },
    }
    await syncRoom(newRoom)
  }, [])

  const addSpokenWord = useCallback(async (text: string) => {
    const room = stateRef.current.room
    const me = stateRef.current.viewerId
    if (!room?.currentRound || !me) return

    const newWord = {
      id: `w_${Math.random().toString(36).slice(2, 9)}`,
      playerId: me,
      text: text.trim(),
      timestamp: Date.now(),
    }

    const updatedWords = [...room.currentRound.spokenWords, newWord]
    const newRoom = {
      ...room,
      currentRound: { ...room.currentRound, spokenWords: updatedWords },
    }
    await syncRoom(newRoom)
  }, [])

  const revealResult = useCallback(async () => {
    const room = stateRef.current.room
    if (!room?.currentRound) return

    const round = room.currentRound
    const votes = round.votes
    const impostorId = round.impostorId

    // Tally votes
    const tally: Record<string, number> = {}
    for (const targetId of Object.values(votes)) {
      tally[targetId] = (tally[targetId] || 0) + 1
    }

    // Find who got the most votes
    let topVotedId: string | null = null
    let topVoteCount = 0
    for (const [pid, count] of Object.entries(tally)) {
      if (count > topVoteCount) {
        topVoteCount = count
        topVotedId = pid
      }
    }

    const impostorCaught = topVotedId === impostorId

    // Update scores: each player who voted correctly gets +1
    const updatedPlayers = room.players.map((p) => {
      const votedFor = votes[p.id]
      const votedCorrectly = votedFor === impostorId
      return {
        ...p,
        score: p.score + (votedCorrectly && !p.isImpostor ? 1 : 0),
      }
    })

    const updatedRound: Round = {
      ...round,
      impostorCaught,
      endedAt: Date.now(),
    }

    const newRoom = {
      ...room,
      players: updatedPlayers,
      currentRound: updatedRound,
      status: "round_finished" as const,
    }

    const me = stateRef.current.viewerId
    const myPlayer = updatedPlayers.find((p) => p.id === me)
    const nextViewAs: ViewAs = myPlayer?.isHost ? "host" : myPlayer?.isImpostor ? "impostor" : "player"
    await syncRoom(newRoom, "round_result", nextViewAs)
  }, [])

  const submitImpostorGuess = useCallback(async (guess: string) => {
    const room = stateRef.current.room
    if (!room?.currentRound) return

    const round = room.currentRound
    const normalize = (s: string) => s.trim().toLowerCase().replace(/[.,!?]+$/, "")
    const correct = normalize(guess) === normalize(round.word)

    // If correct, Impostor wins: +2 score bonus
    const updatedPlayers = room.players.map((p) => ({
      ...p,
      score: p.score + (p.isImpostor && correct ? 2 : 0),
    }))

    const updatedRound: Round = {
      ...round,
      impostorGuess: guess.trim(),
      impostorGuessedWord: correct,
      // If guessed correctly, treat as Impostor escaped (they win)
      impostorCaught: correct ? false : round.impostorCaught,
    }

    const newRoom = {
      ...room,
      players: updatedPlayers,
      currentRound: updatedRound,
    }
    await syncRoom(newRoom)
  }, [])

  const skipRound = useCallback(async () => {
    const room = stateRef.current.room
    if (!room?.currentRound) return

    const updatedRound: Round = { ...room.currentRound, endedAt: Date.now() }
    const newRoom = {
      ...room,
      currentRound: updatedRound,
      status: "round_finished" as const,
      roundSkipped: true,
    }
    await syncRoom(newRoom, "round_result")
  }, [])

  const newRound = useCallback(async () => {
    const room = stateRef.current.room
    if (!room) return

    const past = room.currentRound
      ? [...room.pastRounds, room.currentRound]
      : room.pastRounds

    // Reset impostor flags
    const updatedPlayers = room.players.map((p) => ({
      ...p,
      isImpostor: false,
    }))

    const newRoom = {
      ...room,
      players: updatedPlayers,
      currentRound: undefined,
      pastRounds: past,
      status: "ready" as const,
      roundSkipped: false,
    }

    const me = stateRef.current.viewerId
    const myPlayer = updatedPlayers.find((p) => p.id === me)
    await syncRoom(newRoom, myPlayer?.isHost ? "host_setup" : "lobby", myPlayer?.isHost ? "host" : "player")
  }, [])

  const delegateHost = useCallback(async (playerId: string) => {
    const room = stateRef.current.room
    if (!room || !supabase) return

    const updatedPlayers = room.players.map((p) => ({
      ...p,
      isHost: p.id === playerId,
    }))

    const newRoom: Room = {
      ...room,
      hostId: playerId,
      players: updatedPlayers,
      status: "ready" as const,
      currentRound: undefined,
    }

    const me = stateRef.current.viewerId
    const nextViewAs: ViewAs = me === playerId ? "host" : "player"
    const nextScreen: Screen = me === playerId ? "host_setup" : "lobby"

    setState((prev) => ({
      ...prev,
      room: newRoom,
      screen: nextScreen,
      viewAs: nextViewAs,
    }))

    try {
      const { error } = await supabase.from("game_rooms").upsert({
        room_code: newRoom.code,
        status: newRoom.status,
        host_id: newRoom.hostId,
        first_host_id: newRoom.firstHostId,
        round_skipped: false,
        players: newRoom.players,
        current_round: null,
        past_rounds: newRoom.pastRounds,
      })
      if (error) {
        console.error("Failed to delegate host:", error)
        toast.error("Sync error. Please try again.")
      }
    } catch (err) {
      console.error("Delegation error:", err)
    }
  }, [])

  const leaveRoom = useCallback(async () => {
    const room = stateRef.current.room
    const meId = stateRef.current.viewerId

    if (room && meId && supabase) {
      try {
        const remainingPlayers = room.players.filter((p) => p.id !== meId)
        if (remainingPlayers.length === 0) {
          await supabase.from("game_rooms").delete().eq("room_code", room.code)
        } else {
          let nextHostId = room.hostId
          let updatedPlayers = remainingPlayers

          if (meId === room.hostId) {
            const nextHost = remainingPlayers[remainingPlayers.length - 1] || remainingPlayers[0]
            nextHostId = nextHost.id
            updatedPlayers = remainingPlayers.map((p) =>
              p.id === nextHostId ? { ...p, isHost: true } : p
            )
          }

          await supabase.from("game_rooms").update({
            players: updatedPlayers,
            host_id: nextHostId,
            status: "waiting",
            current_round: null,
          }).eq("room_code", room.code)
        }
      } catch (err) {
        console.error("Failed to cleanup on leave:", err)
      }
    }

    localStorage.removeItem("wg_room_code")
    localStorage.removeItem("wg_user_name")
    setState(initialState)
  }, [])

  const value = useMemo<GameContextValue>(() => {
    const impostor = state.room?.players.find((p) => p.isImpostor) ?? null
    const viewer = state.room?.players.find((p) => p.id === state.viewerId) ?? null

    return {
      ...state,
      impostor,
      viewer,
      createRoom,
      joinRoom,
      setScreen,
      setViewAs,
      startRound,
      openVoting,
      castVote,
      addSpokenWord,
      revealResult,
      submitImpostorGuess,
      skipRound,
      newRound,
      generateWord,
      delegateHost,
      leaveRoom,
    }
  }, [
    state,
    createRoom,
    joinRoom,
    setScreen,
    setViewAs,
    startRound,
    openVoting,
    castVote,
    addSpokenWord,
    revealResult,
    submitImpostorGuess,
    skipRound,
    newRound,
    generateWord,
    delegateHost,
    leaveRoom,
  ])

  if (!isLoaded) return null

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}
