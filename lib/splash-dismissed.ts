const EVENT = "sv-splash-dismissed"

let dismissed = false

/** Called when the intro splash overlay is removed (after fade). Idempotent. */
export function markSplashDismissed() {
  if (dismissed) return
  dismissed = true
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT))
  }
}

/** True after the splash has been dismissed at least once this session. */
export function isSplashDismissed() {
  return dismissed
}

/** Runs `cb` after splash dismiss, or immediately if splash already ended. Returns unsubscribe. */
export function subscribeSplashDismissed(cb: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }
  if (dismissed) {
    queueMicrotask(cb)
    return () => {}
  }
  const handler = () => cb()
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
