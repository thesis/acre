import React, { createContext, useCallback, useMemo, useState } from "react"
import { ModalType } from "../types"

type StakingFlowContextValue = {
  modalType?: ModalType
  amount?: string
  closeModal: () => void
  setModalType: React.Dispatch<React.SetStateAction<ModalType | undefined>>
  setAmount: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const StakingFlowContext = createContext<StakingFlowContextValue>({
  setModalType: () => {},
  closeModal: () => {},
  setAmount: () => {},
})

export function StakingFlowProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [modalType, setModalType] = useState<ModalType | undefined>(undefined)
  const [amount, setAmount] = useState<string | undefined>(undefined)

  const closeModal = useCallback(() => {
    setModalType(undefined)
    setAmount(undefined)
  }, [])

  const contextValue: StakingFlowContextValue =
    useMemo<StakingFlowContextValue>(
      () => ({
        modalType,
        amount,
        closeModal,
        setModalType,
        setAmount,
      }),
      [modalType, amount, closeModal],
    )

  return (
    <StakingFlowContext.Provider value={contextValue}>
      {children}
    </StakingFlowContext.Provider>
  )
}
