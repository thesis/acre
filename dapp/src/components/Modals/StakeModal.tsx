import React from "react"
import { Button, ModalBody, ModalCloseButton } from "@chakra-ui/react"
import { TextMd } from "../Typography"
import { ModalStep } from "../../contexts"

export default function StakeModal({ goNext }: ModalStep) {
  return (
    <>
      <ModalCloseButton />
      <ModalBody>
        <TextMd>Stake modal</TextMd>
        <Button width="100%" onClick={goNext}>
          Stake
        </Button>
      </ModalBody>
    </>
  )
}
