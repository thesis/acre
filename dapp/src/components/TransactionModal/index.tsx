import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  ModalFlowContext,
  ModalFlowContextValue,
  TransactionContextProvider,
} from "#/contexts"
import { useSidebar } from "#/hooks"
import { ACTION_FLOW_TYPES, ActionFlowType } from "#/types"
import ModalBase from "../shared/ModalBase"
import ModalContentWrapper from "./ModalContentWrapper"
import { ActiveFlowStep } from "./ActiveFlowStep"

const DEFAULT_ACTIVE_STEP = 1

type TransactionModalProps = {
  isOpen: boolean
  defaultType?: ActionFlowType
  onClose: () => void
}

export default function TransactionModal({
  isOpen,
  defaultType = ACTION_FLOW_TYPES.STAKE,
  onClose,
}: TransactionModalProps) {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()

  const [type, setType] = useState(defaultType)
  const [activeStep, setActiveStep] = useState(DEFAULT_ACTIVE_STEP)
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
    setType(defaultType)
    setActiveStep(DEFAULT_ACTIVE_STEP)
    setIsPaused(false)
    setIsPendingTransaction(false)
  }, [defaultType])

  useEffect(() => {
    setType(defaultType)
  }, [defaultType])

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
      handleClose,
      handleResume,
      handleGoNext,
      handleStartTransactionProcess,
      handleStopTransactionProcess,
    ],
  )

  return (
    <ModalBase isOpen={isOpen} onClose={handleClose}>
      <TransactionContextProvider>
        <ModalFlowContext.Provider value={contextValue}>
          <ModalContentWrapper defaultType={defaultType}>
            <ActiveFlowStep />
          </ModalContentWrapper>
        </ModalFlowContext.Provider>
      </TransactionContextProvider>
    </ModalBase>
  )
}
