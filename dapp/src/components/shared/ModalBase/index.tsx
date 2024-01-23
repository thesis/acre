import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react"
import { useSidebar } from "#/hooks"
import {
  ModalFlowContext,
  ModalFlowContextValue,
  TransactionContextProvider,
} from "#/contexts"
import SupportWrapper from "#/components/Modals/Support"

export default function ModalBase({
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
  const [isPaused, setIsPaused] = useState(false)
  const [isPendingTransaction, setIsPendingTransaction] = useState(false)

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
      onClose()
    }
  }, [isPaused, isPendingTransaction, onClose])

  const handleStartTransactionProcess = useCallback(() => {
    setIsPendingTransaction(true)
  }, [setIsPendingTransaction])

  const handleStopTransactionProcess = useCallback(() => {
    setIsPendingTransaction(false)
  }, [setIsPendingTransaction])

  const resetState = useCallback(() => {
    setActiveStep(defaultStep)
    setIsPaused(false)
    setIsPendingTransaction(false)
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
      isPaused,
      onClose: handleClose,
      onResume: handleResume,
      goNext: handleGoNext,
      startTransactionProcess: handleStartTransactionProcess,
      endTransactionProcess: handleStopTransactionProcess,
    }),
    [
      activeStep,
      isPaused,
      handleGoNext,
      handleClose,
      handleResume,
      handleStartTransactionProcess,
      handleStopTransactionProcess,
    ],
  )

  return (
    <TransactionContextProvider>
      <ModalFlowContext.Provider value={contextValue}>
        <Modal size="lg" isOpen={isOpen} onClose={handleClose}>
          <ModalOverlay mt="header_height" />
          <ModalContent mt="modal_shift">
            <ModalCloseButton />
            <SupportWrapper>{children}</SupportWrapper>
          </ModalContent>
        </Modal>
      </ModalFlowContext.Provider>
    </TransactionContextProvider>
  )
}
