"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type ParticleSpec = {
  id: number
  leftPct: number
  topPct: number
  sizePx: number
  dx: number
  dy: number
  durationSec: number
  delaySec: number
  opacity: number
  blur: boolean
}

function buildParticles(count: number): ParticleSpec[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    leftPct: Math.random() * 100,
    topPct: Math.random() * 100,
    sizePx: 1.5 + Math.random() * 4.5,
    dx: (Math.random() - 0.5) * 120,
    dy: -40 - Math.random() * 100,
    durationSec: 10 + Math.random() * 18,
    delaySec: -Math.random() * 22,
    opacity: 0.12 + Math.random() * 0.42,
    blur: Math.random() < 0.22,
  }))
}

type GreenParticlesBackgroundProps = {
  className?: string
  /** More dots on landing vs splash */
  density?: "splash" | "landing"
}

/**
 * Soft lime particles behind UI copy. Random layout is generated after mount
 * to avoid SSR/client hydration mismatches.
 */
export function GreenParticlesBackground({
  className,
  density = "landing",
}: GreenParticlesBackgroundProps) {
  const [particles, setParticles] = useState<ParticleSpec[] | null>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const rm =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setReduced(rm)
    const count =
      density === "landing"
        ? rm
          ? 32
          : 220
        : rm
          ? 26
          : 170
    setParticles(buildParticles(count))
  }, [density])

  if (!particles?.length) return null

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        reduced ? "opacity-70" : null,
        className,
      )}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn(
            "absolute rounded-full bg-primary",
            p.blur ? "blur-[1.5px]" : null,
          )}
          style={{
            left: `${p.leftPct}%`,
            top: `${p.topPct}%`,
            width: p.sizePx,
            height: p.sizePx,
            opacity: reduced ? Math.min(p.opacity + 0.08, 0.45) : p.opacity,
            boxShadow: p.blur
              ? "0 0 10px color-mix(in oklab, var(--primary) 55%, transparent)"
              : undefined,
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            ...(reduced
              ? {}
              : {
                  animationName: "green-particle-drift",
                  animationDuration: `${p.durationSec}s`,
                  animationDelay: `${p.delaySec}s`,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                }),
          }}
        />
      ))}
    </div>
  )
}
