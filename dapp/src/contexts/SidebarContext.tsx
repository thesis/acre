import useIsEmbed from "#/hooks/useIsEmbed"
import React, { createContext, useCallback, useMemo, useState } from "react"

type SidebarContextValue = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  onOpen: () => {},
  onClose: () => {},
})

export function SidebarContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const { isEmbed } = useIsEmbed()

  const [isOpen, setIsOpen] = useState(false)

  const onOpen = useCallback(() => {
    if (isEmbed) return

    setIsOpen(true)
  }, [isEmbed])

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const contextValue: SidebarContextValue = useMemo<SidebarContextValue>(
    () => ({
      isOpen,
      onOpen,
      onClose,
    }),
    [isOpen, onClose, onOpen],
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  )
}
