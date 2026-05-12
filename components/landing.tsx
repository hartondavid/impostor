"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { useLanguage } from "@/lib/language-context"
import { LanguageSelector } from "@/components/language-selector"
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
  Brain,
  Download,
  Lock,
  Menu,
  Users,
  Wallet,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInstallAppPrompt } from "@/hooks/use-install-app-prompt"
import { LandingHeroTagline } from "@/components/landing-hero-tagline"
import { GreenParticlesBackground } from "@/components/green-particles"

const REVOLUT_SUPPORT_URL =
  process.env.NEXT_PUBLIC_REVOLUT_SUPPORT_URL ?? "https://revolut.me/david1498"
// Designed to feel like a modern multiplayer party game.
export function Landing() {
  const { createRoom, joinRoom } = useGame()
  const { t } = useLanguage()
  const install = useInstallAppPrompt()
  const [hostName, setHostName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [joinName, setJoinName] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  return (
    <div className="bg-grid relative isolate min-h-screen overflow-hidden">
      <GreenParticlesBackground density="landing" className="z-0" />
      {/* Soft glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 z-[1] h-96 w-[80%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 z-[1] h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">{t("secretVerb")}</span>
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
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 py-12 sm:px-6 sm:py-20">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {t("poweredByAI")}
        </span>

        <h1 className="text-balance text-center text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
          {t("guessTheWord")}
          <br />
          <LandingHeroTagline className="mt-1 block sm:mt-2" />
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-center text-base text-muted-foreground sm:text-lg">
          {t("landingDesc")}
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          {/* Create room dialog */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex-1 h-16 rounded-full bg-[#a3e635] text-black hover:bg-[#bef264] hover:-translate-y-0.5 active:scale-[0.98] border-none font-bold text-lg transition-all shadow-xl shadow-[#a3e635]/20 group"
              >
                {t("createRoom")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("createNewRoom")}</DialogTitle>
                <DialogDescription>
                  {t("createRoomDesc")}
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="py-2">
                <Field>
                  <FieldLabel htmlFor="host-name">{t("yourDisplayName")}</FieldLabel>
                  <Input
                    id="host-name"
                    placeholder={t("hostNamePlaceholder")}
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    autoFocus
                  />
                  <FieldDescription>
                    {t("hostNameDesc")}
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setCreateOpen(false)}
                  className="text-muted-foreground"
                >
                  {t("cancel")}
                </Button>
                <Button
                  className="rounded-full h-11 px-8 font-semibold"
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

          {/* Join room dialog */}
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 h-16 rounded-full bg-slate-900/60 border-slate-800 text-white hover:bg-slate-800 hover:text-white hover:-translate-y-0.5 active:scale-[0.98] font-bold text-lg transition-all backdrop-blur-md"
              >
                {t("joinRoom")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("joinExistingRoom")}</DialogTitle>
                <DialogDescription>
                  {t("joinRoomDesc")}
                </DialogDescription>
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
                    className="font-mono uppercase tracking-widest"
                    maxLength={4}
                  />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setJoinOpen(false)}
                  className="text-muted-foreground"
                >
                  {t("cancel")}
                </Button>
                <Button
                  disabled={joinCode.length < 4}
                  className="rounded-full h-11 px-8 font-semibold"
                  onClick={() => {
                    joinRoom(joinCode, joinName.trim() || "You")
                    setJoinOpen(false)
                  }}
                >
                  {t("joinRoom")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Feature trio */}
        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<Users className="h-5 w-5 text-primary" />}
            title={t("unlimitedPlayers")}
            description={t("unlimitedPlayersDesc")}
          />
          <FeatureCard
            icon={<Brain className="h-5 w-5 text-accent" />}
            title={t("aiCraftedHints")}
            description={t("aiCraftedHintsDesc")}
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5 text-destructive" />}
            title={t("builtForParties")}
            description={t("builtForPartiesDesc")}
          />
        </div>
      </main>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
        {icon}
      </div>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
