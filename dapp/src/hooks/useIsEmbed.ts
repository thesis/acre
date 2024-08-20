import { useCallback } from "react"
import useLocalStorage from "./useLocalStorage"

export default function useIsEmbed() {
  const [isEmbed, setIsEmbed] = useLocalStorage<boolean | undefined>(
    "isEmbed",
    undefined,
  )

  const enableIsEmbed = useCallback(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get("embed")) {
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
