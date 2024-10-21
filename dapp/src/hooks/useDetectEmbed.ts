import { useEffect } from "react"
import useIsEmbed from "./useIsEmbed"

export default function useDetectEmbed() {
  const { enableIsEmbed } = useIsEmbed()

  useEffect(() => {
    enableIsEmbed()
  }, [enableIsEmbed])
}
