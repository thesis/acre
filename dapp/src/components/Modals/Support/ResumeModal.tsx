import React from "react"
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  HStack,
} from "@chakra-ui/react"

import Spinner from "#/components/shared/Spinner"
import { Pause } from "#/static/icons"
import { TextMd } from "#/components/shared/Typography"

export default function ResumeModal({
  onResume,
  onClose,
}: {
  onResume: () => void
  onClose: () => void
}) {
  return (
    <>
      <ModalHeader>Paused</ModalHeader>
      <ModalBody textAlign="start" py={6} mx={3}>
        <HStack position="relative" justifyContent="center">
          <Spinner size="xl" />
          <Pause position="absolute" boxSize={6} />
        </HStack>

        <TextMd>Are your sure you want to cancel?</TextMd>
      </ModalBody>
      <ModalFooter flexDirection="column" gap={2}>
        <Button size="lg" width="100%" onClick={onResume}>
          Resume deposit
        </Button>
        <Button size="lg" width="100%" variant="outline" onClick={onClose}>
          Yes, cancel
        </Button>
      </ModalFooter>
    </>
  )
}
