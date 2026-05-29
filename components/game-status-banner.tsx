"use client"

import type { ViewAs } from "@/lib/types"
import { useLanguage } from "@/lib/language-context"
import { Crown, Eye, Users, Ghost } from "lucide-react"
import { cn } from "@/lib/utils"

interface GameStatusBannerProps {
  viewAs: ViewAs
  title: string
  subtitle: string
}

// Big role-aware banner shown above each per-role dashboard.
// Visually differentiates host (amber), guesser (coral) and player (lime).
export function GameStatusBanner({
  viewAs,
  title,
  subtitle,
}: GameStatusBannerProps) {
  const { t } = useLanguage()
  const config = {
    host: {
      icon: Crown,
      ring: "ring-accent/30",
      glow: "from-accent/20",
      pill: "bg-accent/15 text-accent border-accent/30",
      iconColor: "text-accent",
      label: t("host"),
    },
    impostor: {
      icon: Eye,
      ring: "ring-primary/30",
      glow: "from-primary/20",
      pill: "bg-primary/15 text-primary border-primary/30",
      iconColor: "text-primary",
      label: t("impostor"),
    },
    player: {
      icon: Users,
      ring: "ring-primary/30",
      glow: "from-primary/20",
      pill: "bg-primary/15 text-primary border-primary/30",
      iconColor: "text-primary",
      label: t("player"),
    },
    spectator: {
      icon: Ghost,
      ring: "ring-blue-500/30",
      glow: "from-blue-500/20",
      pill: "bg-blue-500/15 text-blue-500 border-blue-500/30",
      iconColor: "text-blue-500",
      label: t("spectator"),
    },
  }[viewAs]

  const Icon = config.icon

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-5 ring-1",
        config.ring,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent",
          config.glow,
        )}
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background",
            config.iconColor,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              config.pill,
            )}
          >
            {t("youAreThe")} {config.label}
          </span>
          <h2 className="mt-2 text-pretty text-xl font-semibold leading-snug sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}
