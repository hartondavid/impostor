"use client"

import { useState, useEffect, useRef } from "react"
import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { useTheme } from "next-themes"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field"
import {
  ArrowRight,
  Download,
  Eye,
  Menu,
  Search,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInstallAppPrompt } from "@/hooks/use-install-app-prompt"
import { GreenParticlesBackground } from "@/components/green-particles"
import { AdBanner } from "@/components/ad-banner"

const REVOLUT_SUPPORT_URL =
  process.env.NEXT_PUBLIC_REVOLUT_SUPPORT_URL ?? "https://revolut.me/david1498"

export function Landing() {
  const { createRoom, joinRoom } = useGame()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const install = useInstallAppPrompt()
  const [hostName, setHostName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [joinName, setJoinName] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  const heroTitleText = t("heroTitle")
  const [displayedTitle, setDisplayedTitle] = useState("")

  useEffect(() => {
    let i = 0
    setDisplayedTitle("")
    const id = setInterval(() => {
      i++
      setDisplayedTitle(heroTitleText.slice(0, i))
      if (i >= heroTitleText.length) clearInterval(id)
    }, 50)
    return () => clearInterval(id)
  }, [heroTitleText])

  return (
    <div className="bg-grid relative isolate min-h-screen overflow-hidden">
      <GreenParticlesBackground density="landing" className="z-0" />

      {/* Glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 z-[1] h-[500px] w-[70%] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 z-[1] h-80 w-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-0 z-[1] h-64 w-64 rounded-full bg-accent/8 blur-3xl"
      />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/90 text-white shadow-lg shadow-destructive/30">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-tight">{t("appName")}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden text-xs text-muted-foreground sm:block">
            {t("subtitle")}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 border-border bg-card/60"
                aria-label={t("landingMenu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[12rem]">
              <DropdownMenuItem
                onSelect={(ev) => {
                  ev.preventDefault()
                  void install.triggerInstall().then((ok) => {
                    if (!ok) toast.message(t("installAppHint"))
                  })
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("downloadApp")}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={REVOLUT_SUPPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex cursor-pointer items-center"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {t("supportRevolut")}
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 py-12 sm:px-6 sm:py-20">

        {/* Badge */}
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Social Deduction · Party Game
        </span>

        <h1 className="text-balance text-center text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          {displayedTitle}
          <span className="animate-pulse border-r-2 border-primary ml-1 inline-block h-[1em] align-middle"></span>
        </h1>
        <p className="mt-4 text-center text-xl font-medium text-primary sm:text-2xl">
          {t("heroTagline")}
        </p>

        <p className="mt-6 max-w-xl text-pretty text-center text-base text-muted-foreground sm:text-lg">
          {t("landingDesc")}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">

          {/* Create room */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                id="create-room-btn"
                className="flex-1 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 active:scale-[0.98] border-none font-bold text-base transition-all shadow-xl shadow-primary/25 group"
              >
                {t("createRoom")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("createNewRoom")}</DialogTitle>
                <DialogDescription>{t("createRoomDesc")}</DialogDescription>
              </DialogHeader>
              <FieldGroup className="py-2">
                <Field>
                  <FieldLabel htmlFor="host-name">{t("yourDisplayName")}</FieldLabel>
                  <Input
                    id="host-name"
                    placeholder={t("hostNamePlaceholder")}
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && hostName.trim()) {
                        createRoom(hostName.trim() || "Host")
                        setCreateOpen(false)
                      }
                    }}
                    autoFocus
                  />
                  <FieldDescription>{t("hostNameDesc")}</FieldDescription>
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setCreateOpen(false)} className="text-muted-foreground">
                  {t("cancel")}
                </Button>
                <Button
                  className="rounded-full h-11 px-8 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    createRoom(hostName.trim() || "Host")
                    setCreateOpen(false)
                  }}
                >
                  {t("createRoom")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Join room */}
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button
                id="join-room-btn"
                variant="outline"
                className="flex-1 h-14 rounded-full bg-card/60 border-border text-foreground hover:bg-card hover:-translate-y-0.5 active:scale-[0.98] font-bold text-base transition-all backdrop-blur-md"
              >
                {t("joinRoom")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("joinExistingRoom")}</DialogTitle>
                <DialogDescription>{t("joinRoomDesc")}</DialogDescription>
              </DialogHeader>
              <FieldGroup className="py-2">
                <Field>
                  <FieldLabel htmlFor="join-name">{t("yourDisplayName")}</FieldLabel>
                  <Input
                    id="join-name"
                    placeholder={t("joinNamePlaceholder")}
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="room-code">{t("roomCode")}</FieldLabel>
                  <Input
                    id="room-code"
                    placeholder={t("roomCodePlaceholder")}
                    value={joinCode}
                    onChange={(e) =>
                      setJoinCode(e.target.value.toUpperCase().slice(0, 4))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && joinCode.length === 4) {
                        joinRoom(joinCode, joinName.trim() || "Player")
                        setJoinOpen(false)
                      }
                    }}
                    className="font-mono uppercase tracking-widest text-center text-lg"
                    maxLength={4}
                  />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setJoinOpen(false)} className="text-muted-foreground">
                  {t("cancel")}
                </Button>
                <Button
                  disabled={joinCode.length < 4}
                  className="rounded-full h-11 px-8 font-semibold"
                  onClick={() => {
                    joinRoom(joinCode, joinName.trim() || "Player")
                    setJoinOpen(false)
                  }}
                >
                  {t("joinRoom")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <AdBanner className="mt-12 w-full" />

        {/* How it works */}
        <div className="mt-24 w-full max-w-4xl">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={<Eye className="h-5 w-5 text-feature-yellow" />}
              iconBg="bg-feature-yellow/10 border-feature-yellow/20"
              step="01"
              title={t("featureSocialTitle")}
              description={t("featureSocialDesc")}
            />
            <FeatureCard
              icon={<ShieldAlert className="h-5 w-5 text-feature-red" />}
              iconBg="bg-feature-red/10 border-feature-red/20"
              step="02"
              title={t("featureDeceptionTitle")}
              description={t("featureDeceptionDesc")}
            />
            <FeatureCard
              icon={<Users className="h-5 w-5 text-feature-green" />}
              iconBg="bg-feature-green/10 border-feature-green/20"
              step="03"
              title={t("featurePartyTitle")}
              description={t("featurePartyDesc")}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function FeatureCard({
  icon,
  iconBg,
  step,
  title,
  description,
}: {
  icon: React.ReactNode
  iconBg: string
  step: string
  title: string
  description: string
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:border-border/80 hover:bg-card/80 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${iconBg}`}>
          {icon}
        </div>
        <span className="font-mono text-xs font-bold text-muted-foreground/40">{step}</span>
      </div>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
