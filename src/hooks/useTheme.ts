import { useState, useEffect } from "react"
import { ThemePref } from "../types"

const THEME_KEY = "openshelf-theme"

function readThemePref(): ThemePref {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === "light" || stored === "dark" || stored === "system")
      return stored
  } catch {
    /* storage unavailable */
  }
  return "system"
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(readThemePref)
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  )

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  const resolved: "light" | "dark" =
    pref === "system" ? (systemDark ? "dark" : "light") : pref

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
    try {
      localStorage.setItem(THEME_KEY, pref)
    } catch {
      /* storage unavailable */
    }
  }, [pref, resolved])

  return {
    pref,
    resolved,
    setPref,
    toggle: () => setPref(resolved === "dark" ? "light" : "dark"),
  }
}
