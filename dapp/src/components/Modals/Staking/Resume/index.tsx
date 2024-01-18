import React from "react"
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Stack,
} from "@chakra-ui/react"

import Spinner from "#/components/shared/Spinner"
import { PauseIcon } from "#/utils/customIcons"
import { TextMd } from "#/components/shared/Typography"

export default function PausingModal({
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
        <Stack
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner size="xl" />
          <PauseIcon position="absolute" />
        </Stack>

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
