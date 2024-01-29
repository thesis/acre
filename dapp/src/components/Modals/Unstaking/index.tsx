import React from "react"
import { TextLg } from "#/components/shared/Typography"

export function ActiveUnstakingStep({ activeStep }: { activeStep: number }) {
  switch (activeStep) {
    case 1:
      return <TextLg>Unstaking Flow</TextLg>
    default:
      return null
  }
}
