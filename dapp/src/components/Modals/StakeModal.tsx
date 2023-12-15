import React from "react"
import { Button, ModalBody } from "@chakra-ui/react"
import { ModalStep } from "../../contexts"
import { TextMd } from "../shared/Typography"

export default function StakeModal({ goNext }: ModalStep) {
  return (
    <ModalBody>
      <TextMd>Stake modal</TextMd>
      <Button width="100%" onClick={goNext}>
        Stake
      </Button>
    </ModalBody>
  )
}
