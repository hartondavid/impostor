import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { PwaRegister } from "@/components/pwa-register"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  applicationName: "The Impostor",
  title: "The Impostor — Social Deduction Party Game",
  description:
    "A real-time social deduction party game. One player is the Impostor — they don't know the secret word. Ask clever questions, vote out the Impostor, and don't get fooled.",
  generator: "v0.app",
  appleWebApp: {
    capable: true,
    title: "The Impostor",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "The Impostor — Social Deduction Party Game",
    description: "One player is the Impostor — they don't know the secret word. Find them before they blend in!",
    type: "website",
    images: [
      {
        url: "/social.png",
        width: 1200,
        height: 630,
        alt: "The Impostor Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Impostor — Social Deduction Party Game",
    description: "One player is the Impostor — they don't know the secret word. Find them before they blend in!",
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
        <PwaRegister />
        {children}
      </body>
    </html>
  )
}
