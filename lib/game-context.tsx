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
  QuestionItem,
  Room,
  Round,
  Screen,
  ViewAs,
  WordSource,
} from "./types"
import {
  generateRoomCode,
  makeQuestionItems,
  generateLocalRound,
  QUESTION_POOL,
} from "./mock-data"
import { supabase } from "./supabase"
import { useSession } from "@/hooks/use-session"

// ---------- State shape ----------

interface GameState {
  screen: Screen
  room: Room | null
  viewerId: string | null
  viewAs: ViewAs
  isGeneratingWord: boolean
  isGeneratingQuestions: boolean
  genError: string | null
}

const initialState: GameState = {
  screen: "landing",
  room: null,
  viewerId: null,
  viewAs: "host",
  isGeneratingWord: false,
  isGeneratingQuestions: false,
  genError: null,
}

// ---------- Context ----------

interface GameContextValue extends GameState {
  guesser: Player | null
  viewer: Player | null
  createRoom: (hostName: string) => Promise<void>
  joinRoom: (code: string, name: string) => Promise<void>
  setScreen: (s: Screen) => void
  setViewAs: (v: ViewAs) => void
  assignGuesser: () => Promise<void>
  // Manually designate a specific player as guesser (host's pick)
  setGuesser: (playerId: string) => Promise<void>
  // Transfer host privileges to another player
  delegateHost: (playerId: string) => Promise<void>
  startRound: (
    word: string,
    definition: string,
    questions: string[],
    source: WordSource,
  ) => Promise<void>
  skipQuestion: () => Promise<void>
  guessedCorrectly: () => Promise<void>
  forceEndRound: () => Promise<void>
  newRound: () => Promise<void>
  generateWord: (word?: string) => Promise<{
    word: string
    definition: string
    questions: string[]
    fallback?: boolean
  } | null>
  leaveRoom: () => void
  getMoreQuestions: () => Promise<void>
  markQuestionUsed: (questionId: string) => void
  currentQuestion: QuestionItem | null
  remainingQuestions: number
}

const GameContext = createContext<GameContextValue | null>(null)

// ---------- Guesser rotation helper ----------
// Rules:
//  1. The CURRENT host (hostId) cannot be a guesser (they know the word).
//  2. The original host (firstHostId) CAN be a guesser if they are not the current host.
//  3. Pick randomly from players who haven't been guesser yet (current cycle).
//  4. When everyone eligible has been a guesser, reset the cycle and pick randomly again.
function pickNextGuesser(room: Room): { player: Player; cycleReset: boolean } {
  const eligible = room.players.filter((p) => p.id !== room.hostId)

  if (eligible.length === 0) {
    // Fallback: if only 1 player, they must be the host, so pick them anyway
    const fallback = room.players[0]
    return { player: fallback, cycleReset: false }
  }

  // Try players who haven't been guesser yet in this cycle
  const notYetGuessed = eligible.filter((p) => !p.hasBeenGuesser)

  if (notYetGuessed.length > 0) {
    return {
      player: notYetGuessed[Math.floor(Math.random() * notYetGuessed.length)],
      cycleReset: false,
    }
  }

  // Everyone eligible has been a guesser → start a new cycle
  return {
    player: eligible[Math.floor(Math.random() * eligible.length)],
    cycleReset: true,
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const { playerId, isLoaded } = useSession()
  const [state, setState] = useState<GameState>(initialState)

  // Use a ref to access the latest state inside callbacks without triggering re-renders or stale closures
  const stateRef = useRef(state)
  stateRef.current = state

  // Auto-rejoin on mount if session exists in localStorage
  useEffect(() => {
    if (!supabase || state.room) return

    const storedCode = localStorage.getItem("wg_room_code")
    const storedName = localStorage.getItem("wg_user_name")

    if (storedCode && storedName) {
      // Small delay to ensure everything is ready
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
      // In a real app, you might only send changed fields. For this demo, replacing the row is fine.
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
        console.error(`Failed to sync room to Supabase: [${error.code}] ${error.message} - ${error.details}`)
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
          const newDbRoom = payload.new as any
          if (!newDbRoom || !newDbRoom.room_code) return

          setState((prev) => {
            if (prev.room?.code !== roomCode) return prev
            // Merge DB state into local state
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

  // Connection Resilience: Mark player as disconnected on tab close (instead of removing them)
  // This allows them to rejoin later using the same name.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const room = stateRef.current.room
      const me = room?.players.find(p => p.id === stateRef.current.viewerId)
      if (!room || !me || !supabase) return

      const updatedPlayers = room.players.map((p) =>
        p.id === me.id ? { ...p, connected: false } : p
      )

      // Use sendBeacon or a synchronous fetch if possible
      supabase.from("game_rooms").update({ players: updatedPlayers }).eq("room_code", room.code).then()
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

    // 1. Determine correct screen
    if (room.status === "waiting") {
      nextScreen = "lobby"
    } else if (room.status === "ready") {
      // If I am the host and we just finished a round or assigned a guesser, 
      // stay in host_setup so I can pick a new word.
      nextScreen = me.isHost && !room.currentRound ? "host_setup" : "lobby"
    } else if (room.status === "in_progress") {
      nextScreen = "in_game"
    } else if (room.status === "round_finished") {
      nextScreen = "round_result"
    }

    // 2. Determine correct perspective
    if (me.isHost) {
      nextViewAs = "host"
    } else if (me.isGuesser) {
      nextViewAs = "guesser"
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

      const newPlayerId = `p_${normalizedName.toLowerCase()}`

      const host: Player = {
        id: newPlayerId,
        name: normalizedName,
        isHost: true,
        score: 0,
        isGuesser: false,
        hasBeenGuesser: false,
        avatarColor: "bg-blue-500",
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
      
      // Persist for refresh
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

      const newPlayerId = `p_${normalizedName.toLowerCase()}`

      // Fetch current room state first to append
      const { data, error } = await supabase.from("game_rooms").select("*").eq("room_code", upperCode).single()
      if (error || !data) {
        console.error(`Room not found or error fetching room: [${error?.code}] ${error?.message} - ${error?.details}`)
        return
      }

      const currentPlayers: Player[] = data.players || []
      const existingPlayer = currentPlayers.find(p => p.id === newPlayerId)

      let players: Player[]
      if (existingPlayer) {
        // Reconnect existing player
        players = currentPlayers.map(p =>
          p.id === newPlayerId ? { ...p, connected: true, name: normalizedName } : p
        )
      } else {
        // Add new player
        const me: Player = {
          id: newPlayerId,
          name: normalizedName,
          isHost: false,
          score: 0,
          isGuesser: false,
          hasBeenGuesser: false,
          avatarColor: "bg-green-500",
          connected: true,
        }
        players = [...currentPlayers, me]
      }

      setState((prev) => ({ ...prev, viewerId: newPlayerId }))

      // Persist for refresh
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

  const assignGuesser = useCallback(async () => {
    const room = stateRef.current.room
    if (!room) return

    const { player: guesser, cycleReset } = pickNextGuesser(room)

    const updatedPlayers = room.players.map((p) => ({
      ...p,
      isGuesser: p.id === guesser.id,
      // On cycle reset clear everyone's flag; otherwise mark the chosen player
      hasBeenGuesser: cycleReset ? p.id === guesser.id : p.hasBeenGuesser || p.id === guesser.id,
    }))

    const newRoom = { ...room, players: updatedPlayers, status: "ready" as const, roundSkipped: false }
    await syncRoom(newRoom)
  }, [])

  // Manually pick a specific player as guesser (host's explicit choice).
  // Still updates the rotation bookkeeping so the cycle stays consistent.
  const setGuesser = useCallback(async (playerId: string) => {
    const room = stateRef.current.room
    if (!room) return

    const updatedPlayers = room.players.map((p) => ({
      ...p,
      isGuesser: p.id === playerId,
      hasBeenGuesser: p.hasBeenGuesser || p.id === playerId,
    }))

    const newRoom = { ...room, players: updatedPlayers, status: "ready" as const, roundSkipped: false }
    await syncRoom(newRoom)
  }, [])

  // Transfer the host crown to another player.
  const delegateHost = useCallback(async (playerId: string) => {
    const room = stateRef.current.room
    if (!room) return

    const updatedPlayers = room.players.map((p) => ({
      ...p,
      isHost: p.id === playerId,
      // The delegated player is no longer a guesser while they're host
      isGuesser: p.isGuesser && p.id !== playerId,
    }))

    // If the game was in progress or round finished, reset to setup phase (ready)
    // so the new host can choose a word and potentially a new guesser.
    const shouldReset = room.status === "in_progress" || room.status === "round_finished"
    const nextStatus = shouldReset ? "ready" as const : room.status

    const newRoom: Room = {
      ...room,
      hostId: playerId,
      players: updatedPlayers,
      status: nextStatus,
      currentRound: shouldReset ? undefined : room.currentRound
    }

    const nextViewAs = stateRef.current.viewerId === playerId ? "host" : "player"
    // If we reset, the host should see the setup screen.
    // If we are delegating to someone else, the current user should see the lobby/waiting screen.
    const nextScreen = shouldReset 
      ? ("host_setup" as Screen) 
      : (nextViewAs === "player" ? "lobby" as Screen : undefined)

    await syncRoom(newRoom, nextScreen, nextViewAs)
  }, [])

  const startRound = useCallback(
    async (word: string, definition: string, questions: string[], source: WordSource) => {
      const room = stateRef.current.room
      if (!room) return

      const guesser = room.players.find((p) => p.isGuesser)
      if (!guesser) return

      const round: Round = {
        id: `r_${Math.random().toString(36).slice(2, 9)}`,
        word: word.toLowerCase(),
        definition,
        source,
        guesserId: guesser.id,
        questions: makeQuestionItems(questions),
        currentQuestionIndex: 0,
        startedAt: Date.now(),
      }

      const newRoom = { ...room, currentRound: round, status: "in_progress" as const }
      const nextViewAs = stateRef.current.viewerId === guesser.id ? "guesser" : "player"
      await syncRoom(newRoom, "in_game", nextViewAs)
    },
    []
  )

  const skipQuestion = useCallback(async () => {
    const room = stateRef.current.room
    if (!room?.currentRound) return

    const round = room.currentRound
    const idx = round.currentQuestionIndex
    const updatedQuestions = round.questions.map((q, i) =>
      i === idx ? { ...q, skipped: true } : q,
    )
    const next = (idx + 1) % updatedQuestions.length

    const newRoom = {
      ...room,
      currentRound: {
        ...round,
        questions: updatedQuestions,
        currentQuestionIndex: next,
      },
    }
    await syncRoom(newRoom)
  }, [])

  const markQuestionUsed = useCallback(async (questionId: string) => {
    const room = stateRef.current.room
    if (!room?.currentRound) return

    const round = room.currentRound
    const updatedQuestions = round.questions.map((q) =>
      q.id === questionId ? { ...q, used: true } : q,
    )

    const newRoom = {
      ...room,
      currentRound: { ...round, questions: updatedQuestions },
    }
    await syncRoom(newRoom)
  }, [])

  const guessedCorrectly = useCallback(async () => {
    const room = stateRef.current.room
    if (!room?.currentRound) return

    const round = room.currentRound
    const updatedRound: Round = { ...round, won: true, endedAt: Date.now() }

    const updatedPlayers = room.players.map((p) => {
      let isHost = p.isHost
      let score = p.score
      // Mark the guesser's hasBeenGuesser when they complete the round
      const hasBeenGuesser = p.hasBeenGuesser || p.id === round.guesserId
      if (p.id === round.guesserId) {
        isHost = true
        score += 1
      } else if (p.isHost) {
        isHost = false
      }
      return { ...p, isHost, score, hasBeenGuesser }
    })

    const newHostId = round.guesserId
    const newRoom = {
      ...room,
      hostId: newHostId,
      players: updatedPlayers,
      currentRound: updatedRound,
      status: "round_finished" as const,
      roundSkipped: false,
    }

    const nextViewAs = stateRef.current.viewerId === newHostId ? "host" : "player"
    await syncRoom(newRoom, "round_result", nextViewAs)
  }, [])

  const forceEndRound = useCallback(async () => {
    const room = stateRef.current.room
    if (!room?.currentRound) return

    const updatedRound: Round = { ...room.currentRound, won: false, endedAt: Date.now() }
    // Mark roundSkipped so that newRound() will keep the same guesser
    const newRoom = { ...room, currentRound: updatedRound, status: "round_finished" as const, roundSkipped: true }
    await syncRoom(newRoom, "round_result")
  }, [])

  const newRound = useCallback(async () => {
    const room = stateRef.current.room
    if (!room) return

    const past = room.currentRound ? [...room.pastRounds, room.currentRound] : room.pastRounds

    let updatedPlayers: Player[]

    if (room.roundSkipped) {
      // Host skipped the round → keep the exact same guesser, no rotation bookkeeping
      const currentGuesserId = room.players.find((p) => p.isGuesser)?.id
      updatedPlayers = room.players.map((p) => ({
        ...p,
        isGuesser: currentGuesserId ? p.id === currentGuesserId : p.isGuesser,
      }))
    } else {
      // Normal flow → advance the rotation, respecting cycle boundaries
      const { player: nextGuesser, cycleReset } = pickNextGuesser(room)
      updatedPlayers = room.players.map((p) => ({
        ...p,
        isGuesser: p.id === nextGuesser.id,
        // On cycle reset: clear all flags and mark only the new guesser
        // Otherwise: accumulate — keep existing flags and mark the new guesser
        hasBeenGuesser: cycleReset
          ? p.id === nextGuesser.id
          : p.hasBeenGuesser || p.id === nextGuesser.id,
      }))
    }

    const newRoom = {
      ...room,
      players: updatedPlayers,
      currentRound: undefined,
      pastRounds: past,
      status: "ready" as const,
      roundSkipped: false,
    }
    await syncRoom(newRoom, "host_setup")
  }, [])

  const leaveRoom = useCallback(() => {
    localStorage.removeItem("wg_room_code")
    localStorage.removeItem("wg_user_name")
    setState(initialState)
  }, [])

  const getMoreQuestions = useCallback(async () => {
    const room = stateRef.current.room
    if (!room?.currentRound) return

    setState((prev) => ({ ...prev, isGeneratingQuestions: true }))
    try {
      // Small delay for realism
      await new Promise(r => setTimeout(r, 600))

      const usedTexts = new Set(room.currentRound.questions.map(q => q.text))
      const available = QUESTION_POOL.filter(text => !usedTexts.has(text))

      if (available.length === 0) return

      // Pick 5 random ones
      const nextBatch = available.sort(() => Math.random() - 0.5).slice(0, 5)

      const newQuestionItems = nextBatch.map((text: string) => ({
        id: Math.random().toString(36).substring(2, 9),
        text,
        used: false,
        skipped: false,
      }))

      const updatedRound = {
        ...room.currentRound,
        questions: [...room.currentRound.questions, ...newQuestionItems],
      }
      const newRoom = { ...room, currentRound: updatedRound }
      await syncRoom(newRoom)
    } catch (err) {
      console.error(err)
    } finally {
      setState((prev) => ({ ...prev, isGeneratingQuestions: false }))
    }
  }, [])

  const generateWord = useCallback(async (word?: string) => {
    setState((prev) => ({ ...prev, isGeneratingWord: true, genError: null }))
    try {
      // Small delay for realism
      await new Promise(r => setTimeout(r, 800))

      const local = generateLocalRound(word)
      return {
        word: local.word,
        definition: local.definition,
        questions: local.questions,
        fallback: false,
      }
    } catch (e) {
      console.error("Local generation failed", e)
      return null
    } finally {
      setState((prev) => ({ ...prev, isGeneratingWord: false }))
    }
  }, [])

  const value = useMemo<GameContextValue>(() => {
    const guesser = state.room?.players.find((p) => p.isGuesser) ?? null
    const viewer = state.room?.players.find((p) => p.id === state.viewerId) ?? null
    const round = state.room?.currentRound
    const currentQuestion = round && round.questions[round.currentQuestionIndex]
      ? round.questions[round.currentQuestionIndex]
      : null
    const remainingQuestions = round ? round.questions.filter((q) => !q.used && !q.skipped).length : 0

    return {
      ...state,
      guesser,
      viewer,
      currentQuestion,
      remainingQuestions,
      createRoom,
      joinRoom,
      setScreen,
      setViewAs,
      assignGuesser,
      setGuesser,
      delegateHost,
      startRound,
      skipQuestion,
      guessedCorrectly,
      forceEndRound,
      newRound,
      generateWord,
      leaveRoom,
      getMoreQuestions,
      markQuestionUsed,
    }
  }, [
    state,
    createRoom,
    joinRoom,
    setScreen,
    setViewAs,
    assignGuesser,
    setGuesser,
    delegateHost,
    startRound,
    skipQuestion,
    guessedCorrectly,
    forceEndRound,
    newRound,
    generateWord,
    leaveRoom,
    getMoreQuestions,
    markQuestionUsed,
  ])

  if (!isLoaded) return null // Wait for session to init

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}
