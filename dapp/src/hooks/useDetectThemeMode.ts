import { useEffect } from "react"
import { LOCAL_STORAGE_CHAKRA_COLOR_MODE } from "../constants/local-storage"

export function useDetectThemeMode(): string | null {
  const params = new URLSearchParams(window.location.search)
  const themeMode = params.get("theme")

  useEffect(() => {
    // For the ledger live app, we should clear the localStorage and set the theme mode again.
    // As a result, we will detect an update when a user's settings change in the live ledger.
    if (themeMode) localStorage.removeItem(LOCAL_STORAGE_CHAKRA_COLOR_MODE)
  }, [themeMode])

  return themeMode
}
