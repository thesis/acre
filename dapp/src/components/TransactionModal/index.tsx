import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  ModalFlowContext,
  ModalFlowContextValue,
  TransactionContextProvider,
} from "#/contexts"
import { useSidebar } from "#/hooks"
import {
  ACTION_FLOW_TYPES,
  ActionFlowType,
  PROCESS_STATUSES,
  ProcessStatus,
} from "#/types"
import { StakeFlowProvider } from "#/acre-react/contexts"
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
  const [status, setStatus] = useState<ProcessStatus>(PROCESS_STATUSES.IDLE)

  const handleResume = useCallback(() => {
    setStatus(PROCESS_STATUSES.PENDING)
  }, [])

  const handleGoNext = useCallback(() => {
    setActiveStep((prevStep) => prevStep + 1)
  }, [])

  const handleClose = useCallback(() => {
    if (status === PROCESS_STATUSES.PENDING) {
      setStatus(PROCESS_STATUSES.PAUSED)
    } else {
      onClose()
    }
  }, [onClose, status])

  const resetState = useCallback(() => {
    setType(defaultType)
    setActiveStep(DEFAULT_ACTIVE_STEP)
    setStatus(PROCESS_STATUSES.IDLE)
  }, [defaultType, setStatus])

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
      status,
      setType,
      setStatus,
      onClose: handleClose,
      onResume: handleResume,
      goNext: handleGoNext,
    }),
    [type, activeStep, status, handleClose, handleResume, handleGoNext],
  )

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={false}
    >
      <TransactionContextProvider>
        <ModalFlowContext.Provider value={contextValue}>
          <StakeFlowProvider>
            <ModalContentWrapper defaultType={defaultType}>
              <ActiveFlowStep />
            </ModalContentWrapper>
          </StakeFlowProvider>
        </ModalFlowContext.Provider>
      </TransactionContextProvider>
    </ModalBase>
  )
}
