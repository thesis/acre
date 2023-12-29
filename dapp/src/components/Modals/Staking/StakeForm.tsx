import React from "react"
import { Button, ModalBody } from "@chakra-ui/react"
import { TextMd } from "../../shared/Typography"
import { useModalFlowContext } from "../../../hooks"

export default function StakeModal() {
  const { goNext } = useModalFlowContext()

  return (
    <ModalBody>
      <TextMd>Stake modal</TextMd>
      <Button width="100%" onClick={goNext}>
        Stake
      </Button>
    </ModalBody>
  )
}
