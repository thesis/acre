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
import { STAKING_STEPS } from "#/components/Modals/Staking/utils/stakingSteps"

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
  const [isResumeStep, setResumeStep] = useState(false)

  const handleResume = useCallback(() => {
    setResumeStep(false)
  }, [])

  const handleGoNext = useCallback(() => {
    setActiveStep((prevStep) => prevStep + 1)
  }, [])

  const isStakingPending = useCallback(() => {
    const { SIGN_MESSAGE, DEPOSIT_BTC } = STAKING_STEPS
    return activeStep === SIGN_MESSAGE || activeStep === DEPOSIT_BTC
  }, [activeStep])

  const handleClose = useCallback(() => {
    if (!isResumeStep && isStakingPending()) {
      setResumeStep(true)
    } else {
      onClose()
    }
  }, [isResumeStep, isStakingPending, onClose])

  const resetState = useCallback(() => {
    setActiveStep(defaultStep)
    setResumeStep(false)
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
      isResumeStep,
      onClose: handleClose,
      onResume: handleResume,
      goNext: handleGoNext,
    }),
    [activeStep, isResumeStep, handleGoNext, handleClose, handleResume],
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
