"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { VERB_POOL } from "@/lib/mock-data"
import { subscribeSplashDismissed } from "@/lib/splash-dismissed"
import { cn } from "@/lib/utils"

const TYPE_TAGLINE_MS = 72
const TYPE_PREFIX_MS = 80
const DEL_TAGLINE_MS = 52
const PAUSE_AFTER_TAGLINE_MS = 650
const TYPE_VERB_MS = 92

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function pickVerb(pool: string[]): string {
  if (pool.length === 0) return "to run"
  return pool[Math.floor(Math.random() * pool.length)]!
}

function isActive(myGen: number, genRef: { current: number }) {
  return myGen === genRef.current
}

/**
 * Animates the second hero line: type tagline → delete → type the “verb was” prefix
 * letter-by-letter, then one random verb inside « ». Stops after that verb (no loop).
 * Typing starts only after the splash overlay is dismissed and the next frames have
 * painted, so the hero is visible while the line animates.
 */
export function LandingHeroTagline({ className }: { className?: string }) {
  const { t, language } = useLanguage()
  const tagline = t("outsmartFriends")
  const prefix = t("landingVerbWasPrefix")
  const suffix = t("landingVerbWasSuffix")

  const [line2, setLine2] = useState("")
  const [showCaret, setShowCaret] = useState(false)
  const aliveRef = useRef(true)
  const genRef = useRef(0)

  useEffect(() => {
    aliveRef.current = true
    const myGen = ++genRef.current

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduce) {
      const unsub = subscribeSplashDismissed(() => {
        if (!isActive(myGen, genRef) || !aliveRef.current) return
        setLine2(tagline)
        setShowCaret(false)
      })
      return () => {
        unsub()
        aliveRef.current = false
        genRef.current++
      }
    }

    const pool = VERB_POOL[language as "en" | "ro"] ?? VERB_POOL.en

    const run = async () => {
      if (!isActive(myGen, genRef) || !aliveRef.current) return

      const v = pickVerb(pool)

      for (let i = 0; i <= tagline.length && isActive(myGen, genRef) && aliveRef.current; i++) {
        setLine2(tagline.slice(0, i))
        setShowCaret(i < tagline.length)
        await delay(TYPE_TAGLINE_MS)
      }
      if (!isActive(myGen, genRef) || !aliveRef.current) return
      setShowCaret(false)
      await delay(PAUSE_AFTER_TAGLINE_MS)
      if (!isActive(myGen, genRef) || !aliveRef.current) return

      for (let i = tagline.length; i >= 0 && isActive(myGen, genRef) && aliveRef.current; i--) {
        setLine2(tagline.slice(0, i))
        setShowCaret(i > 0)
        await delay(DEL_TAGLINE_MS)
      }
      if (!isActive(myGen, genRef) || !aliveRef.current) return
      setShowCaret(false)

      for (let k = 0; k <= prefix.length && isActive(myGen, genRef) && aliveRef.current; k++) {
        setLine2(prefix.slice(0, k))
        setShowCaret(k < prefix.length)
        await delay(TYPE_PREFIX_MS)
      }
      if (!isActive(myGen, genRef) || !aliveRef.current) return
      setShowCaret(false)

      for (let j = 0; j <= v.length && isActive(myGen, genRef) && aliveRef.current; j++) {
        setLine2(`${prefix}${v.slice(0, j)}${j === v.length ? suffix : ""}`)
        setShowCaret(j < v.length)
        await delay(TYPE_VERB_MS)
      }
      if (!isActive(myGen, genRef) || !aliveRef.current) return
      setShowCaret(false)
    }

    let cancelled = false

    const start = () => {
      if (cancelled || !isActive(myGen, genRef) || !aliveRef.current) return
      void run()
    }

    /** Two animation frames after splash so the landing paints before typing. */
    const afterSplashPaint = () => {
      if (cancelled) return
      requestAnimationFrame(() => {
        if (cancelled) return
        requestAnimationFrame(start)
      })
    }

    const unsubscribe = subscribeSplashDismissed(afterSplashPaint)

    return () => {
      cancelled = true
      unsubscribe()
      aliveRef.current = false
      genRef.current++
    }
  }, [language, tagline, prefix, suffix])

  return (
    <span
      className={cn(
        "relative inline-block min-h-[1.35em] text-primary transition-colors duration-300",
        className,
      )}
    >
      <span className="inline-flex max-w-full flex-wrap items-baseline gap-0">
        <span className="text-primary">{line2}</span>
        {showCaret ? (
          <span
            className="ml-0.5 inline-block h-[1em] w-0.5 shrink-0 animate-pulse bg-primary align-[-0.15em]"
            aria-hidden
          />
        ) : null}
      </span>
    </span>
  )
}
