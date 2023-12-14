import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react"
import { HEADER_HEIGHT } from "../../Header"
import { ModalFlowContext, ModalFlowContextValue } from "../../../contexts"
import { useSidebar } from "../../../hooks"

export default function ModalBase({
  isOpen,
  onClose,
  steps,
  defaultIndex = 0,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  steps: string[]
  // eslint-disable-next-line react/require-default-props
  defaultIndex?: number
  children: React.ReactNode
}) {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()

  const [activeStep, setActiveStep] = useState(steps[defaultIndex])
  const [index, setIndex] = useState(defaultIndex)

  const handleGoNext = useCallback(() => {
    setIndex((prevIndex) => prevIndex + 1)
  }, [])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const resetState = useCallback(() => {
    setActiveStep(steps[defaultIndex])
    setIndex(defaultIndex)
  }, [defaultIndex, steps])

  useEffect(() => {
    if (index >= steps.length) {
      handleClose()
    } else {
      setActiveStep(steps[index])
    }
  }, [steps, index, handleClose])

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
      steps,
      activeStep,
      onClose: handleClose,
      goNext: handleGoNext,
    }),
    [activeStep, steps, handleGoNext, handleClose],
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
