import React from "react"
import { Button, ModalBody, ModalFooter } from "@chakra-ui/react"
import { ModalStep } from "../../contexts"
import { TextMd } from "../shared/Typography"

export default function StakingOverviewModal({ goNext }: ModalStep) {
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
