import React from "react"
import { Button, ModalBody, ModalFooter } from "@chakra-ui/react"
import { TextMd } from "../../shared/Typography"
import { useModalFlowContext } from "../../../hooks"

export default function Overview() {
  const { goNext } = useModalFlowContext()

  return (
    <>
      <ModalBody>
        <TextMd>Staking overview</TextMd>
      </ModalBody>
      <ModalFooter>
        <Button width="100%" onClick={goNext}>
          Get started
        </Button>
      </ModalFooter>
    </>
  )
}
