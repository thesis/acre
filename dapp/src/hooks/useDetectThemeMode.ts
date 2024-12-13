import { useEffect } from "react"
import { useColorMode } from "@chakra-ui/react"
import { router } from "#/utils"
import { SEARCH_PARAMS_NAMES } from "#/router/path"

export default function useDetectThemeMode(): string | null {
  const { colorMode, toggleColorMode } = useColorMode()
  // The ledger live passes the theme mode via url.
  // Let's detect the theme set by the user and toggle the color mode
  const themeMode = router.getURLParam(SEARCH_PARAMS_NAMES.themeMode)

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
