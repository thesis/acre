import { useContext } from "react"
import { DocsDrawerContext } from "../contexts"

export function useDocsDrawerContext() {
  const context = useContext(DocsDrawerContext)

  if (!context) {
    throw new Error(
      "DocsDrawerContext used outside of DocsDrawerContext component",
    )
  }

  return context
}
