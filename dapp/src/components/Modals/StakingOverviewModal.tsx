import React from "react"
import {
  Button,
  Flex,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Step,
  StepDescription,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepTitle,
  Stepper,
} from "@chakra-ui/react"
import { useStakingFlowContext } from "../../hooks"
import BaseModal from "./BaseModal"

const STEPS = [
  {
    title: "Sign message",
    description:
      "You will sign a gas-free Ethereum message to indicate the address where you'd like to get your stBTC liquid staking token.",
  },
  {
    title: "Deposit BTC",
    description:
      "You will make a Bitcoin transaction to deposit and stake your BTC.",
  },
]

export default function StakingOverviewModal() {
  const { closeModal } = useStakingFlowContext()

  return (
    <BaseModal>
      <ModalHeader textAlign="center">Staking overview</ModalHeader>
      <ModalBody>
        <Stepper
          index={2}
          gap="0"
          height="200px"
          orientation="vertical"
          variant="basic"
        >
          {STEPS.map((step) => (
            <Step key={step.title}>
              <StepIndicator>
                <StepNumber />
              </StepIndicator>
              <Flex direction="column" gap={2}>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Flex>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>
      </ModalBody>
      <ModalFooter>
        <Button width="100%" onClick={closeModal}>
          Get started
        </Button>
      </ModalFooter>
    </BaseModal>
  )
}
