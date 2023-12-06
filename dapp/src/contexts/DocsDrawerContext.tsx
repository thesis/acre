import React, { createContext, useCallback, useMemo, useState } from "react"

type DocsDrawerContextValue = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const DocsDrawerContext = createContext<DocsDrawerContextValue>({
  isOpen: false,
  onOpen: () => {},
  onClose: () => {},
})

export function DocsDrawerContextProvider({
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

  const contextValue: DocsDrawerContextValue = useMemo<DocsDrawerContextValue>(
    () => ({
      isOpen,
      onOpen,
      onClose,
    }),
    [isOpen, onClose, onOpen],
  )

  return (
    <DocsDrawerContext.Provider value={contextValue}>
      {children}
    </DocsDrawerContext.Provider>
  )
}
