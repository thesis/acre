import React from "react"
import {
  Flex,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  StepperProps,
} from "@chakra-ui/react"

export type StepBase = {
  id: string
  title: string | JSX.Element
  description?: string | JSX.Element
}

type StepperBaseProps = {
  steps: StepBase[]
  complete?: JSX.Element
  incomplete?: JSX.Element
  active?: JSX.Element
} & Omit<StepperProps, "children">

export default function StepperBase({
  steps,
  complete,
  incomplete,
  active,
  ...stepperProps
}: StepperBaseProps) {
  return (
    <Stepper {...stepperProps}>
      {steps.map((step) => (
        <Step key={step.id}>
          <StepIndicator>
            <StepStatus
              complete={complete ?? <StepIcon />}
              incomplete={incomplete ?? <StepNumber />}
              active={active ?? <StepNumber />}
            />
          </StepIndicator>
          <Flex direction="column" gap={2}>
            <StepTitle as="div">{step.title}</StepTitle>
            <StepDescription as="div">{step.description}</StepDescription>
          </Flex>
          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  )
}
