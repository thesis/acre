import { useContext } from "react"
import { DocsDrawerContext } from "~/contexts"

export function useDocsDrawer() {
  const context = useContext(DocsDrawerContext)

  if (!context) {
    throw new Error(
      "DocsDrawerContext used outside of DocsDrawerContext component",
    )
  }

  return context
}
