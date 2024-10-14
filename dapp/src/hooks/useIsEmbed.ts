import { useCallback } from "react"
import referralProgram, { EmbedApp } from "#/utils/referralProgram"
import useLocalStorage from "./useLocalStorage"

export default function useIsEmbed() {
  const [embeddedApp, setEmbeddedApp] = useLocalStorage<EmbedApp | undefined>(
    "acre.embeddedApp",
    undefined,
  )

  const enableIsEmbed = useCallback(() => {
    const app = referralProgram.getEmbeddedApp()

    if (app) {
      setEmbeddedApp(app)
    }
  }, [setEmbeddedApp])

  const disableIsEmbed = useCallback(() => {
    setEmbeddedApp(undefined)
  }, [setEmbeddedApp])

  return {
    enableIsEmbed,
    disableIsEmbed,
    isEmbed: !!embeddedApp,
    embeddedApp,
  }
}
