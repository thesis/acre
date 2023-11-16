import { useCallback } from "react"
import { LOCAL_STORAGE_EMBED } from "../constants/local-storage"
import { useLocalStorage } from "./dom-hooks"

const getEmbedParam = (): string => {
  const params = new URLSearchParams(window.location.search)
  const isEmbed = params.get(LOCAL_STORAGE_EMBED)
  return isEmbed ?? "false"
}

export function useEmbedFeatureFlag() {
  const [isEmbed, setIsEmbed] = useLocalStorage(
    LOCAL_STORAGE_EMBED,
    getEmbedParam(),
  )

  const enableIsEmbedFeatureFlag = useCallback(() => {
    setIsEmbed("true")
  }, [setIsEmbed])

  const disableIsEmbedFeatureFlag = useCallback(() => {
    setIsEmbed("false")
  }, [setIsEmbed])

  return {
    enableIsEmbedFeatureFlag,
    disableIsEmbedFeatureFlag,
    isEmbed,
  }
}
