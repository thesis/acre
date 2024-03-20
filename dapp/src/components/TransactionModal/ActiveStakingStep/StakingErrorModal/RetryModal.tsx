import React from "react"
import {
  Button,
  CloseButton,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
} from "@chakra-ui/react"
import { SecurityCheckIcon } from "#/assets/icons"
import { TextMd, TextSm } from "#/components/shared/Typography"
import IconWrapper from "#/components/shared/IconWrapper"

export default function RetryModal({ retry }: { retry: () => void }) {
  return (
    <>
      <ModalHeader color="red.400">Oops! There was an error.</ModalHeader>
      <ModalBody gap={10} pt={4}>
        <IconWrapper boxSize={32} color="red.400">
          <CloseButton color="red.400" fontSize="2xl" />
        </IconWrapper>
        <TextMd>
          Your deposit didn&apos;t go through but no worries, your funds are
          safe.
        </TextMd>
        <TextMd>
          Auto-retry in <Text as="b">0:59</Text>
        </TextMd>
      </ModalBody>
      <ModalFooter mt={4}>
        <Button size="lg" width="100%" onClick={retry}>
          Retry
        </Button>
        <TextSm color="grey.700">
          <SecurityCheckIcon boxSize={5} color="gold.700" mr={2} />
          Your funds are secure.
        </TextSm>
      </ModalFooter>
    </>
  )
}
