import React from "react"
import { Button, ModalBody, ModalFooter, ModalHeader } from "@chakra-ui/react"
import StakingSteps from "./StakingSteps"
import { useModalFlowContext } from "../../../../hooks"

export default function Overview() {
  const { goNext } = useModalFlowContext()

  return (
    <>
      <ModalHeader>Staking steps overview</ModalHeader>
      <ModalBody textAlign="start" py={6} mx={3}>
        <StakingSteps />
      </ModalBody>
      <ModalFooter>
        <Button size="lg" width="100%" onClick={goNext}>
          Continue
        </Button>
      </ModalFooter>
    </>
  )
}
