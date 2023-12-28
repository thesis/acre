import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react"
import {
  ModalFlowContext,
  ModalFlowContextValue,
  TransactionContextProvider,
} from "../../../contexts"
import { useSidebar } from "../../../hooks"
import SupportWrapper from "../../Modals/Support"

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
