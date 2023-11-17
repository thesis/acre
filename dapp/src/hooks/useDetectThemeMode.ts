import { useEffect } from "react"
import { useColorMode } from "@chakra-ui/react"

export function useDetectThemeMode(): string | null {
  const { colorMode, toggleColorMode } = useColorMode()
  // The ledger live passes the theme mode via url.
  // Let's detect the theme set by the user and toggle the color mode
  const params = new URLSearchParams(window.location.search)
  const themeMode = params.get("theme")

  useEffect(() => {
    if (
      (themeMode === "dark" || themeMode === "light") &&
      colorMode !== themeMode
    ) {
      toggleColorMode()
    }
  }, [colorMode, themeMode, toggleColorMode])

  return themeMode
}
