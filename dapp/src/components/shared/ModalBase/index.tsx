import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react"
import { HEADER_HEIGHT } from "../../Header"
import { ModalFlowContext, ModalFlowContextValue } from "../../../contexts"
import { useSidebar } from "../../../hooks"

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
  // eslint-disable-next-line react/require-default-props
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
    <ModalFlowContext.Provider value={contextValue}>
      <Modal size="md" isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay mt={HEADER_HEIGHT} />
        <ModalContent mt={2 * HEADER_HEIGHT}>{children}</ModalContent>
      </Modal>
    </ModalFlowContext.Provider>
  )
}
