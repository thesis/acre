import { useContext } from "react"
import { SidebarContext } from "#/contexts"

export function useSidebar() {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error("SidebarContext used outside of SidebarContext component")
  }

  return context
}
