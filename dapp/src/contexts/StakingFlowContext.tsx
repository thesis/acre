import React, { createContext, useCallback, useMemo, useState } from "react"
import { ModalType } from "../types"

type StakingFlowContextValue = {
  modalType: ModalType | undefined
  closeModal: () => void
  setModalType: React.Dispatch<React.SetStateAction<ModalType | undefined>>
}

export const StakingFlowContext = createContext<StakingFlowContextValue>({
  modalType: undefined,
  setModalType: () => {},
  closeModal: () => {},
})

export function StakingFlowProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [modalType, setModalType] = useState<ModalType | undefined>(undefined)

  const closeModal = useCallback(() => {
    setModalType(undefined)
  }, [])

  const contextValue: StakingFlowContextValue =
    useMemo<StakingFlowContextValue>(
      () => ({
        modalType,
        closeModal,
        setModalType,
      }),
      [modalType, closeModal],
    )

  return (
    <StakingFlowContext.Provider value={contextValue}>
      {children}
    </StakingFlowContext.Provider>
  )
}
