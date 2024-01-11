import React from "react"
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StepNumber,
} from "@chakra-ui/react"
import StepperBase from "~/components/shared/StepperBase"
import { useModalFlowContext } from "~/hooks"
import { STEPS } from "./steps"

export default function Overview() {
  const { goNext } = useModalFlowContext()

  return (
    <>
      <ModalHeader>Staking steps overview</ModalHeader>
      <ModalBody textAlign="start" py={6} mx={3}>
        <StepperBase
          index={-1}
          height={64}
          size="sm"
          orientation="vertical"
          complete={<StepNumber />}
          steps={STEPS}
        />
      </ModalBody>
      <ModalFooter>
        <Button size="lg" width="100%" onClick={goNext}>
          Continue
        </Button>
      </ModalFooter>
    </>
  )
}
