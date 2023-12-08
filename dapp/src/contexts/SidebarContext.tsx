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
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

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
