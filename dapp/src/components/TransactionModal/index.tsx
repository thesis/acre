import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useSidebar } from "#/hooks"
import {
  ModalFlowContext,
  ModalFlowContextValue,
  TransactionContextProvider,
} from "#/contexts"
import ModalBase from "../shared/ModalBase"

export default function TransactionModal({
  isOpen,
  onClose,
  numberOfSteps,
  defaultStep = 1,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  numberOfSteps: number
  defaultStep?: number
  children: React.ReactNode
}) {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()

  const [activeStep, setActiveStep] = useState(defaultStep)

  const handleGoNext = useCallback(() => {
    setActiveStep((prevStep) => prevStep + 1)
  }, [])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const resetState = useCallback(() => {
    setActiveStep(defaultStep)
  }, [defaultStep])

  useEffect(() => {
    if (activeStep > numberOfSteps) {
      handleClose()
    }
  }, [activeStep, numberOfSteps, handleClose])

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isOpen) {
      openSideBar()
    } else {
      closeSidebar()
      timeout = setTimeout(resetState, 100)
    }
    return () => clearTimeout(timeout)
  }, [isOpen, resetState, openSideBar, closeSidebar])

  const contextValue: ModalFlowContextValue = useMemo<ModalFlowContextValue>(
    () => ({
      activeStep,
      onClose: handleClose,
      goNext: handleGoNext,
    }),
    [activeStep, handleGoNext, handleClose],
  )

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <TransactionContextProvider>
        <ModalFlowContext.Provider value={contextValue}>
          {children}
        </ModalFlowContext.Provider>
      </TransactionContextProvider>
    </ModalBase>
  )
}
