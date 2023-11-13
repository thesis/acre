import { useCallback } from "react"
import { LOCAL_STORAGE_EMBED } from "../constants/local-storage"
import { useLocalStorage } from "./dom-hooks"

// eslint-disable-next-line import/prefer-default-export
export const useEmbedFeatureFlag = () => {
  const [isEmbed, setIsEmbed] = useLocalStorage(LOCAL_STORAGE_EMBED, "false")

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
