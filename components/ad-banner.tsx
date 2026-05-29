"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const AD_SCRIPT_SRC =
  "https://pl29582050.effectivecpmnetwork.com/fc4478780bef5f476016036c4fdefada/invoke.js"
export const AD_CONTAINER_ID = "container-fc4478780bef5f476016036c4fdefada"

type AdBannerProps = {
  className?: string
  /** Narrower slot for room sidebar */
  variant?: "default" | "compact"
}

/**
 * Unobtrusive in-content ad — loads only when scrolled near, minimal chrome.
 */
export function AdBanner({ className, variant = "default" }: AdBannerProps) {
  const compact = variant === "compact"
  const slotRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = slotRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "120px", threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    if (document.querySelector(`script[src="${AD_SCRIPT_SRC}"]`)) return

    const script = document.createElement("script")
    script.src = AD_SCRIPT_SRC
    script.async = true
    script.setAttribute("data-cfasync", "false")
    document.body.appendChild(script)
  }, [visible])

  return (
    <aside
      ref={slotRef}
      className={cn("flex w-full justify-center py-1", className)}
      aria-label="Advertisement"
    >
      <div
        id={AD_CONTAINER_ID}
        className={cn(
          "flex w-full items-center justify-center overflow-hidden rounded-lg bg-transparent",
          compact ? "min-h-[48px] max-h-[80px]" : "min-h-[56px] max-h-[100px] max-w-3xl",
        )}
      />
    </aside>
  )
}
