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
import { EXTERNAL_HREF } from "#/constants"
import { IconBrandDiscordFilled } from "@tabler/icons-react"

export default function UnstakeErrorModal() {
  return (
    <>
      <ModalCloseButton />
      <ModalHeader color="red.400" textAlign="center">
        Unexpected error...
      </ModalHeader>
      <ModalBody gap={10} pb={6}>
        <TextMd>Please try agin.</TextMd>
      </ModalBody>
      <ModalFooter py={6} px={8} flexDirection="row">
        <Button
          as={Link}
          size="lg"
          width="100%"
          variant="outline"
          rightIcon={<Icon as={IconBrandDiscordFilled} boxSize={5} />}
          href={EXTERNAL_HREF.DISCORD}
          isExternal
        >
          Get help on Discord
        </Button>
      </ModalFooter>
    </>
  )
}
