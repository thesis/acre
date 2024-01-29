import { ActionFlowType } from "#/types"
import React, { createContext, useCallback, useMemo, useState } from "react"

export type ModalFlowContextValue = {
  type: ActionFlowType
  activeStep: number
  setType: React.Dispatch<React.SetStateAction<ActionFlowType>>
  onClose: () => void
  goNext: () => void
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

  const resetState = useCallback(() => {
    setType(defaultType)
    setActiveStep(0)
  }, [defaultType])

  const handleGoNext = useCallback(() => {
    setActiveStep((prevStep) => prevStep + 1)
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [onClose, resetState])

  const contextValue: ModalFlowContextValue = useMemo<ModalFlowContextValue>(
    () => ({
      type,
      activeStep,
      setType,
      onClose: handleClose,
      goNext: handleGoNext,
    }),
    [type, activeStep, handleClose, handleGoNext],
  )

  return (
    <ModalFlowContext.Provider value={contextValue}>
      {children}
    </ModalFlowContext.Provider>
  )
}
