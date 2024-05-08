import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  ModalFlowContext,
  ModalFlowContextValue,
  StakeFlowProvider,
  TransactionContextProvider,
} from "#/contexts"
import { useSidebar } from "#/hooks"
import { ActionFlowType, PROCESS_STATUSES, ProcessStatus } from "#/types"
import { ModalCloseButton } from "@chakra-ui/react"
import ModalBase from "../shared/ModalBase"
import ModalContentWrapper from "./ModalContentWrapper"
import { ActiveFlowStep } from "./ActiveFlowStep"

const DEFAULT_ACTIVE_STEP = 1

type TransactionModalProps = {
  type: ActionFlowType
  isOpen: boolean
  onClose: () => void
}

export default function TransactionModal({
  type,
  isOpen,
  onClose,
}: TransactionModalProps) {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()

  const [activeStep, setActiveStep] = useState(DEFAULT_ACTIVE_STEP)
  const [status, setStatus] = useState<ProcessStatus>(PROCESS_STATUSES.IDLE)

  const handleGoNext = useCallback(() => {
    setActiveStep((prevStep) => prevStep + 1)
  }, [])

  const resetState = useCallback(() => {
    setActiveStep(DEFAULT_ACTIVE_STEP)
    setStatus(PROCESS_STATUSES.IDLE)
  }, [setStatus])

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
      status,
      setStatus,
      onClose,
      goNext: handleGoNext,
    }),
    [type, activeStep, status, onClose, handleGoNext],
  )

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <TransactionContextProvider>
        <ModalFlowContext.Provider value={contextValue}>
          <StakeFlowProvider>
            <ModalContentWrapper>
              <ModalCloseButton />
              <ActiveFlowStep />
            </ModalContentWrapper>
          </StakeFlowProvider>
        </ModalFlowContext.Provider>
      </TransactionContextProvider>
    </ModalBase>
  )
}
