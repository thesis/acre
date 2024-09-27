import { useCallback } from "react"
import { router } from "#/utils"
import { SEARCH_PARAMS_NAMES } from "#/router/path"
import useLocalStorage from "./useLocalStorage"

export default function useIsEmbed() {
  const [isEmbed, setIsEmbed] = useLocalStorage<boolean | undefined>(
    "isEmbed",
    undefined,
  )

  const enableIsEmbed = useCallback(() => {
    if (router.getURLParam(SEARCH_PARAMS_NAMES.embed)) {
      setIsEmbed(true)
    }
  }, [setIsEmbed])

  const disableIsEmbed = useCallback(() => {
    setIsEmbed(false)
  }, [setIsEmbed])

  return {
    enableIsEmbed,
    disableIsEmbed,
    isEmbed,
  }
}
