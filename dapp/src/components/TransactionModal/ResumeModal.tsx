import React from "react"
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  HStack,
} from "@chakra-ui/react"

import Spinner from "#/components/shared/Spinner"
import { PauseIcon } from "#/assets/icons"
import { TextMd } from "#/components/shared/Typography"
import { useActionFlowPause, useModal } from "#/hooks"

export default function ResumeModal() {
  const { handleResume } = useActionFlowPause()
  const { closeModal } = useModal()

  return (
    <>
      <ModalHeader pb={6} textAlign="center">
        Paused
      </ModalHeader>
      <ModalBody textAlign="start" py={6} mx={3} gap={4}>
        <HStack position="relative" justifyContent="center">
          <Spinner size="2xl" variant="filled" />
          <PauseIcon position="absolute" boxSize={6} color="brand.400" />
        </HStack>

        <TextMd>Are your sure you want to cancel?</TextMd>
      </ModalBody>
      <ModalFooter flexDirection="column" gap={2}>
        <Button size="lg" width="100%" onClick={handleResume}>
          Resume deposit
        </Button>
        <Button size="lg" width="100%" variant="outline" onClick={closeModal}>
          Yes, cancel
        </Button>
      </ModalFooter>
    </>
  )
}
