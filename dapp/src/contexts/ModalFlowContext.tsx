import React, { createContext, useCallback, useMemo, useState } from "react"
import { ActionFlowType } from "#/types"

export type ModalFlowContextValue = {
  type: ActionFlowType
  activeStep: number
  isPaused?: boolean
  setType: React.Dispatch<React.SetStateAction<ActionFlowType>>
  onClose: () => void
  onResume: () => void
  goNext: () => void
  startTransactionProcess: () => void
  endTransactionProcess: () => void
}

export const ModalFlowContext = createContext<
  ModalFlowContextValue | undefined
>(undefined)

export function ModalFlowContextProvider({
  defaultType,
  onClose,
  children,
}: {
  defaultType: ActionFlowType
  onClose: () => void
  children: React.ReactNode
}): React.ReactElement {
  const [type, setType] = useState(defaultType)
  const [activeStep, setActiveStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isPendingTransaction, setIsPendingTransaction] = useState(false)

  const resetState = useCallback(() => {
    setType(defaultType)
    setActiveStep(0)
    setIsPaused(false)
    setIsPendingTransaction(false)
  }, [defaultType])

  const handleResume = useCallback(() => {
    setIsPaused(false)
  }, [])

  const handleGoNext = useCallback(() => {
    setActiveStep((prevStep) => prevStep + 1)
  }, [])

  const handleClose = useCallback(() => {
    if (!isPaused && isPendingTransaction) {
      setIsPaused(true)
    } else {
      resetState()
      onClose()
    }
  }, [isPaused, isPendingTransaction, onClose, resetState])

  const handleStartTransactionProcess = useCallback(() => {
    setIsPendingTransaction(true)
  }, [setIsPendingTransaction])

  const handleStopTransactionProcess = useCallback(() => {
    setIsPendingTransaction(false)
  }, [setIsPendingTransaction])

  const contextValue: ModalFlowContextValue = useMemo<ModalFlowContextValue>(
    () => ({
      type,
      activeStep,
      isPaused,
      setType,
      onClose: handleClose,
      onResume: handleResume,
      goNext: handleGoNext,
      startTransactionProcess: handleStartTransactionProcess,
      endTransactionProcess: handleStopTransactionProcess,
    }),
    [
      type,
      activeStep,
      isPaused,
      setType,
      handleGoNext,
      handleClose,
      handleResume,
      handleStartTransactionProcess,
      handleStopTransactionProcess,
    ],
  )

  return (
    <ModalFlowContext.Provider value={contextValue}>
      {children}
    </ModalFlowContext.Provider>
  )
}
