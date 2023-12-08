import React, { createContext, useCallback, useMemo, useState } from "react"

type ModalType = "overview"

type ModalContextValue = {
  modalType?: ModalType
  openModal: (modalType: ModalType) => void
  closeModal: () => void
}

export const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
})

export function ModalContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [modalType, setModalType] = useState<ModalType | undefined>(undefined)

  const openModal = useCallback((type: ModalType) => {
    setModalType(type)
  }, [])

  const closeModal = useCallback(() => {
    setModalType(undefined)
  }, [])

  const contextValue: ModalContextValue = useMemo<ModalContextValue>(
    () => ({
      modalType,
      openModal,
      closeModal,
    }),
    [modalType, closeModal, openModal],
  )

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  )
}
