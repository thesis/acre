import React from "react"
import {
  Button,
  Icon,
  Link,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import { externalHref } from "#/constants"
import { IconBrandDiscordFilled } from "@tabler/icons-react"
import { BaseModalProps } from "#/types"
import withBaseModal from "./ModalRoot/withBaseModal"

export function UnexpectedErrorModalBase({ withCloseButton }: BaseModalProps) {
  return (
    <>
      {withCloseButton && <ModalCloseButton />}
      <ModalHeader color="red.50" textAlign="center">
        Unexpected error...
      </ModalHeader>
      <ModalBody gap={10} pb={6}>
        <TextMd>Please try again.</TextMd>
      </ModalBody>
      <ModalFooter py={6} px={8} flexDirection="row">
        <Button
          as={Link}
          size="lg"
          width="100%"
          variant="outline"
          rightIcon={<Icon as={IconBrandDiscordFilled} boxSize={5} />}
          href={externalHref.DISCORD}
          isExternal
        >
          Get help on Discord
        </Button>
      </ModalFooter>
    </>
  )
}

const UnexpectedErrorModal = withBaseModal(UnexpectedErrorModalBase)
export default UnexpectedErrorModal
