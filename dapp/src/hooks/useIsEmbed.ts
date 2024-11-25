import { useCallback } from "react"
import referralProgram, { EmbedApp } from "#/utils/referralProgram"
import useLocalStorage, { parseLocalStorageValue } from "./useLocalStorage"

export default function useIsEmbed() {
  const [embeddedApp, setEmbeddedApp] = useLocalStorage<EmbedApp | undefined>(
    "acre.embeddedApp",
    undefined,
  )

  const enableIsEmbed = useCallback(() => {
    const embeddedAppParam = referralProgram.getEmbeddedApp()
    if (!referralProgram.isEmbedApp(embeddedAppParam)) {
      setEmbeddedApp(undefined)
      return
    }

    if (embeddedAppParam && referralProgram.isEmbedApp(embeddedAppParam)) {
      setEmbeddedApp(embeddedAppParam)
    }
  }, [setEmbeddedApp])

  const disableIsEmbed = useCallback(() => {
    setEmbeddedApp(undefined)
  }, [setEmbeddedApp])

  return {
    enableIsEmbed,
    disableIsEmbed,
    isEmbed: referralProgram.isEmbedApp(embeddedApp),
    embeddedApp: parseLocalStorageValue(embeddedApp) as EmbedApp | undefined,
  }
}
