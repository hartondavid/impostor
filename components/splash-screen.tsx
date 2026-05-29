"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"
import { GreenParticlesBackground } from "@/components/green-particles"
import { markSplashDismissed } from "@/lib/splash-dismissed"

const SPLASH_MS = 1800
const FADE_MS = 380

/** Full-screen intro with logo + title; does not affect game logic. */
export function SplashGate({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const showMs = reduced ? 350 : SPLASH_MS
    const fadeMs = reduced ? 120 : FADE_MS

    const t1 = window.setTimeout(() => setFadeOut(true), showMs)
    const t2 = window.setTimeout(() => {
      markSplashDismissed()
      setMounted(false)
    }, showMs + fadeMs)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  return (
    <>
      {children}
      {mounted && (
        <div
          role="dialog"
          aria-label={t("appName")}
          aria-modal="true"
          className={cn(
            "fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-background px-6 transition-opacity duration-300 ease-out motion-reduce:transition-none",
            fadeOut ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <GreenParticlesBackground density="splash" className="z-0" />
          <div
            className={cn(
              "relative z-10 flex flex-col items-center gap-5 text-center",
              "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500",
            )}
          >
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-orange-light/15 shadow-lg shadow-orange-light/15 ring-1 ring-orange-light/25">
              <Image
                src="/icon.png"
                alt=""
                width={112}
                height={112}
                priority
                className="h-[5.5rem] w-[5.5rem]"
              />
            </div>
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t("appName")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
