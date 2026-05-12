import type { MetadataRoute } from "next"

/** Web app manifest for installable PWA (Chrome, Edge, Android). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Secret Verb — Multiplayer party game",
    short_name: "Secret Verb",
    description:
      "Real-time multiplayer word guessing with AI hints. Create a room, invite friends, take turns as the Guesser.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "any",
    background_color: "#16181f",
    theme_color: "#16181f",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
