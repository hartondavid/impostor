"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"
import type {
  AnswerEntry,
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
  isCorrectVerbGuess,
  makeMockPlayer,
  makeQuestionItems,
} from "./mock-data"

// ---------- State shape ----------

interface GameState {
  screen: Screen
  room: Room | null
  // Local viewer's player id (who "I" am at the device)
  viewerId: string | null
  // What perspective the local viewer is currently rendering.
  // In a real multiplayer build this would be inferred from the role.
  viewAs: ViewAs
  // Loading flags for AI calls
  isGeneratingWord: boolean
  aiError: string | null
}

const initialState: GameState = {
  screen: "landing",
  room: null,
  viewerId: null,
  viewAs: "host",
  isGeneratingWord: false,
  aiError: null,
}

// ---------- Actions ----------

type Action =
  | {
      type: "CREATE_ROOM"
      payload: { hostName: string; mockPlayerCount: number }
    }
  | { type: "JOIN_ROOM"; payload: { code: string; name: string } }
  | { type: "SET_SCREEN"; payload: Screen }
  | { type: "SET_VIEW_AS"; payload: ViewAs }
  | { type: "ASSIGN_GUESSER" }
  | {
      type: "START_ROUND"
      payload: {
        word: string
        definition: string
        questions: string[]
        source: WordSource
      }
    }
  | { type: "SKIP_QUESTION" }
  | { type: "MARK_QUESTION_USED"; payload: { questionId: string } }
  | {
      type: "ASK_PLAYER"
      payload: { question: string; toPlayerId: string }
    }
  | { type: "SUBMIT_GUESS"; payload: { guess: string } }
  | { type: "NEW_ROUND" }
  | { type: "AI_LOADING"; payload: boolean }
  | { type: "AI_ERROR"; payload: string | null }
  | { type: "SIMULATE_JOIN" }
  | { type: "LEAVE_ROOM" }

// ---------- Reducer ----------

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "CREATE_ROOM": {
      const { hostName, mockPlayerCount } = action.payload
      const host: Player = {
        ...makeMockPlayer(0, { isHost: true, name: hostName || "Host" }),
      }
      // Spin up a few mock players so the lobby feels alive.
      const others = Array.from({ length: mockPlayerCount }, (_, i) =>
        makeMockPlayer(i + 1),
      )
      const room: Room = {
        code: generateRoomCode(),
        hostId: host.id,
        status: "waiting",
        players: [host, ...others],
        pastRounds: [],
        createdAt: Date.now(),
      }
      return {
        ...state,
        room,
        viewerId: host.id,
        viewAs: "host",
        screen: "lobby",
      }
    }

    case "JOIN_ROOM": {
      // Demo-only: we synthesize a room with the joiner as a regular player.
      const me: Player = makeMockPlayer(1, {
        name: action.payload.name || "You",
      })
      const host = makeMockPlayer(0, { isHost: true, name: "Maya" })
      const others = Array.from({ length: 3 }, (_, i) =>
        makeMockPlayer(i + 2),
      )
      const room: Room = {
        code: action.payload.code.toUpperCase(),
        hostId: host.id,
        status: "waiting",
        players: [host, me, ...others],
        pastRounds: [],
        createdAt: Date.now(),
      }
      return {
        ...state,
        room,
        viewerId: me.id,
        viewAs: "player",
        screen: "lobby",
      }
    }

    case "SET_SCREEN":
      return { ...state, screen: action.payload }

    case "SET_VIEW_AS": {
      if (!state.room) return state
      // When switching to "guesser" perspective, also move the viewer's
      // player record to be the guesser if there is one.
      return { ...state, viewAs: action.payload }
    }

    case "ASSIGN_GUESSER": {
      if (!state.room) return state
      const players = state.room.players
      // Pick a random player (could be host or other) as the guesser.
      const guesser = players[Math.floor(Math.random() * players.length)]
      const updated = players.map((p) => ({
        ...p,
        isGuesser: p.id === guesser.id,
      }))
      return {
        ...state,
        room: { ...state.room, players: updated, status: "ready" },
      }
    }

    case "START_ROUND": {
      if (!state.room) return state
      const guesser = state.room.players.find((p) => p.isGuesser)
      if (!guesser) return state
      const round: Round = {
        id: `r_${Math.random().toString(36).slice(2, 9)}`,
        word: action.payload.word.toLowerCase(),
        definition: action.payload.definition,
        source: action.payload.source,
        guesserId: guesser.id,
        questions: makeQuestionItems(action.payload.questions),
        currentQuestionIndex: 0,
        history: [],
        startedAt: Date.now(),
      }
      // Default the viewer's perspective to match their actual role.
      const nextViewAs: ViewAs =
        state.viewerId === guesser.id ? "guesser" : "player"
      return {
        ...state,
        room: { ...state.room, currentRound: round, status: "in_progress" },
        screen: "in_game",
        viewAs: nextViewAs,
      }
    }

    case "SKIP_QUESTION": {
      if (!state.room?.currentRound) return state
      const round = state.room.currentRound
      const idx = round.currentQuestionIndex
      const updatedQuestions = round.questions.map((q, i) =>
        i === idx ? { ...q, skipped: true } : q,
      )
      const next = Math.min(idx + 1, updatedQuestions.length - 1)
      return {
        ...state,
        room: {
          ...state.room,
          currentRound: {
            ...round,
            questions: updatedQuestions,
            currentQuestionIndex: next,
          },
        },
      }
    }

    case "MARK_QUESTION_USED": {
      if (!state.room?.currentRound) return state
      const round = state.room.currentRound
      const updatedQuestions = round.questions.map((q) =>
        q.id === action.payload.questionId ? { ...q, used: true } : q,
      )
      return {
        ...state,
        room: {
          ...state.room,
          currentRound: { ...round, questions: updatedQuestions },
        },
      }
    }

    case "ASK_PLAYER": {
      if (!state.room?.currentRound) return state
      const round = state.room.currentRound
      // Players answer out loud in real life — we just log the question
      // and which player it was addressed to.
      const entry: AnswerEntry = {
        id: `a_${Math.random().toString(36).slice(2, 9)}`,
        question: action.payload.question,
        toPlayerId: action.payload.toPlayerId,
        createdAt: Date.now(),
      }
      return {
        ...state,
        room: {
          ...state.room,
          currentRound: { ...round, history: [...round.history, entry] },
        },
      }
    }

    case "SUBMIT_GUESS": {
      if (!state.room?.currentRound) return state
      const round = state.room.currentRound
      // Lenient match: accept the verb with or without the "a " particle.
      const won = isCorrectVerbGuess(action.payload.guess, round.word)
      const updatedRound: Round = {
        ...round,
        finalGuess: action.payload.guess,
        won,
        endedAt: Date.now(),
      }
      // Award a point to the guesser if they won.
      const updatedPlayers = state.room.players.map((p) =>
        p.id === round.guesserId && won ? { ...p, score: p.score + 1 } : p,
      )
      return {
        ...state,
        room: {
          ...state.room,
          players: updatedPlayers,
          currentRound: updatedRound,
          status: "round_finished",
        },
        screen: "round_result",
      }
    }

    case "NEW_ROUND": {
      if (!state.room) return state
      const past = state.room.currentRound
        ? [...state.room.pastRounds, state.room.currentRound]
        : state.room.pastRounds
      // Rotate guesser: pick a random player who wasn't the previous guesser if possible.
      const previous = state.room.currentRound?.guesserId
      const candidates = state.room.players.filter((p) => p.id !== previous)
      const next =
        candidates[Math.floor(Math.random() * candidates.length)] ??
        state.room.players[0]
      const players = state.room.players.map((p) => ({
        ...p,
        isGuesser: p.id === next.id,
      }))
      return {
        ...state,
        room: {
          ...state.room,
          players,
          currentRound: undefined,
          pastRounds: past,
          status: "ready",
        },
        screen: "host_setup",
      }
    }

    case "SIMULATE_JOIN": {
      if (!state.room) return state
      const next = makeMockPlayer(state.room.players.length)
      return {
        ...state,
        room: { ...state.room, players: [...state.room.players, next] },
      }
    }

    case "AI_LOADING":
      return { ...state, isGeneratingWord: action.payload }

    case "AI_ERROR":
      return { ...state, aiError: action.payload }

    case "LEAVE_ROOM":
      return initialState

    default:
      return state
  }
}

// ---------- Context ----------

interface GameContextValue extends GameState {
  // Convenience selectors
  guesser: Player | null
  viewer: Player | null
  // Actions
  createRoom: (hostName: string, mockPlayerCount?: number) => void
  joinRoom: (code: string, name: string) => void
  setScreen: (s: Screen) => void
  setViewAs: (v: ViewAs) => void
  assignGuesser: () => void
  startRound: (
    word: string,
    definition: string,
    questions: string[],
    source: WordSource,
  ) => void
  skipQuestion: () => void
  markQuestionUsed: (questionId: string) => void
  askPlayer: (question: string, toPlayerId: string) => void
  submitGuess: (guess: string) => void
  newRound: () => void
  generateAIRound: (word?: string) => Promise<{
    word: string
    definition: string
    questions: string[]
    fallback?: boolean
  } | null>
  simulateJoin: () => void
  leaveRoom: () => void
  // Helpers
  currentQuestion: QuestionItem | null
  remainingQuestions: number
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const createRoom = useCallback(
    (hostName: string, mockPlayerCount = 4) =>
      dispatch({ type: "CREATE_ROOM", payload: { hostName, mockPlayerCount } }),
    [],
  )
  const joinRoom = useCallback(
    (code: string, name: string) =>
      dispatch({ type: "JOIN_ROOM", payload: { code, name } }),
    [],
  )
  const setScreen = useCallback(
    (s: Screen) => dispatch({ type: "SET_SCREEN", payload: s }),
    [],
  )
  const setViewAs = useCallback(
    (v: ViewAs) => dispatch({ type: "SET_VIEW_AS", payload: v }),
    [],
  )
  const assignGuesser = useCallback(() => dispatch({ type: "ASSIGN_GUESSER" }), [])
  const startRound = useCallback(
    (word: string, definition: string, questions: string[], source: WordSource) =>
      dispatch({
        type: "START_ROUND",
        payload: { word, definition, questions, source },
      }),
    [],
  )
  const skipQuestion = useCallback(() => dispatch({ type: "SKIP_QUESTION" }), [])
  const markQuestionUsed = useCallback(
    (questionId: string) =>
      dispatch({ type: "MARK_QUESTION_USED", payload: { questionId } }),
    [],
  )
  const askPlayer = useCallback(
    (question: string, toPlayerId: string) =>
      dispatch({ type: "ASK_PLAYER", payload: { question, toPlayerId } }),
    [],
  )
  const submitGuess = useCallback(
    (guess: string) => dispatch({ type: "SUBMIT_GUESS", payload: { guess } }),
    [],
  )
  const newRound = useCallback(() => dispatch({ type: "NEW_ROUND" }), [])
  const simulateJoin = useCallback(
    () => dispatch({ type: "SIMULATE_JOIN" }),
    [],
  )
  const leaveRoom = useCallback(() => dispatch({ type: "LEAVE_ROOM" }), [])

  // Wraps the AI route. Loading + error state are tracked centrally
  // so any UI surface can react consistently.
  const generateAIRound = useCallback(async (word?: string) => {
    dispatch({ type: "AI_LOADING", payload: true })
    dispatch({ type: "AI_ERROR", payload: null })
    try {
      const res = await fetch("/api/generate-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(word ? { word } : {}),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      return {
        word: data.word as string,
        definition: data.definition as string,
        questions: data.questions as string[],
        fallback: Boolean(data.fallback),
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown AI error"
      console.log("[v0] generateAIRound error:", msg)
      dispatch({ type: "AI_ERROR", payload: msg })
      return null
    } finally {
      dispatch({ type: "AI_LOADING", payload: false })
    }
  }, [])

  const value = useMemo<GameContextValue>(() => {
    const guesser =
      state.room?.players.find((p) => p.isGuesser) ?? null
    const viewer =
      state.room?.players.find((p) => p.id === state.viewerId) ?? null
    const round = state.room?.currentRound
    const currentQuestion =
      round && round.questions[round.currentQuestionIndex]
        ? round.questions[round.currentQuestionIndex]
        : null
    const remainingQuestions = round
      ? round.questions.filter((q) => !q.used && !q.skipped).length
      : 0
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
      startRound,
      skipQuestion,
      markQuestionUsed,
      askPlayer,
      submitGuess,
      newRound,
      generateAIRound,
      simulateJoin,
      leaveRoom,
    }
  }, [
    state,
    createRoom,
    joinRoom,
    setScreen,
    setViewAs,
    assignGuesser,
    startRound,
    skipQuestion,
    markQuestionUsed,
    askPlayer,
    submitGuess,
    newRound,
    generateAIRound,
    simulateJoin,
    leaveRoom,
  ])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}
