"use client"

import { useCallback, useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}

/** Captures `beforeinstallprompt` for PWA install (Chrome/Edge/Android). */
export function useInstallAppPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault()
      setEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onBip)
    return () => window.removeEventListener("beforeinstallprompt", onBip)
  }, [])

  const triggerInstall = useCallback(async () => {
    if (!event) return false
    try {
      await event.prompt()
      await event.userChoice
      setEvent(null)
      return true
    } catch {
      return false
    }
  }, [event])

  return { canInstall: !!event, triggerInstall }
}
