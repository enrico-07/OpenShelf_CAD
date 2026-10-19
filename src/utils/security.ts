import DOMPurify from "dompurify"

/**
 * Sanitizes user-provided text or HTML to prevent Cross-Site Scripting (XSS).
 */
export function sanitizeString(value: string | undefined | null): string {
  if (!value || typeof value !== "string") return ""
  // Run DOMPurify with strict configuration
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [], // Disallow all raw HTML tags in plain text contexts
    ALLOWED_ATTR: [],
  }).trim()
}

/**
 * Validates and normalizes external URLs.
 * Strictly permits only http and https protocols to prevent javascript: or data: XSS payloads.
 */
export function sanitizeUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString()
    }
    return null
  } catch {
    return null
  }
}

/**
 * Deeply strips prototype pollution keys (__proto__, constructor, prototype)
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T
  }

  const clean: Record<string, any> = {}
  for (const [key, val] of Object.entries(obj)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue
    }
    clean[key] = sanitizeObject(val)
  }
  return clean as T
}

export const STORAGE_VERSION = "openshelf_v3_"

/**
 * Automatically purges legacy cached demo data from earlier versions
 */
export function purgeLegacyStorage(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return
    const legacyPrefixes = ["openshelf_v1_", "openshelf_v2_"]
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && legacyPrefixes.some((p) => key.startsWith(p))) {
        toRemove.push(key)
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore browser storage access restrictions */
  }
}

// Run purge on evaluation
purgeLegacyStorage()

/**
 * Safe LocalStorage reader with prototype pollution defense
 */
export function getSafeStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_VERSION}${key}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      return sanitizeObject(parsed) as T
    }
  } catch {
    /* fallback to safe default */
  }
  return fallback
}

/**
 * Safe LocalStorage writer with key filtering and error suppression
 */
export function setSafeStored<T>(key: string, val: T): void {
  try {
    const clean = sanitizeObject(val)
    localStorage.setItem(`${STORAGE_VERSION}${key}`, JSON.stringify(clean))
  } catch {
    /* ignore storage quota exhaustion */
  }
}

/**
 * Client-side rate limiter / cooldown tracker to prevent submission spam
 */
const actionTimestamps: Record<string, number> = {}

export function checkClientRateLimit(
  actionKey: string,
  cooldownMs: number = 2000,
): { allowed: boolean; remainingSeconds: number } {
  const now = Date.now()
  const lastTime = actionTimestamps[actionKey] || 0
  const elapsed = now - lastTime

  if (elapsed < cooldownMs) {
    const remainingSeconds = Math.ceil((cooldownMs - elapsed) / 1000)
    return { allowed: false, remainingSeconds }
  }

  actionTimestamps[actionKey] = now
  return { allowed: true, remainingSeconds: 0 }
}
