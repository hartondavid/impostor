import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Secret Verb — Multiplayer party game",
  description:
    "A real-time multiplayer word-guessing game with AI-crafted hints. Create a room, invite friends, take turns being the Guesser.",
  generator: "v0.app",
  openGraph: {
    title: "Secret Verb — Multiplayer party game",
    description: "A real-time multiplayer word-guessing game with AI-crafted hints. Create a room, invite friends, take turns being the Guesser.",
    type: "website",
    images: [
      {
        url: "/social.png",
        width: 1200,
        height: 630,
        alt: "Secret Verb Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Secret Verb — Multiplayer party game",
    description: "A real-time multiplayer word-guessing game with AI-crafted hints. Create a room, invite friends, take turns being the Guesser.",
    images: ["/social.png"],
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.png", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#16181f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background dark`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
