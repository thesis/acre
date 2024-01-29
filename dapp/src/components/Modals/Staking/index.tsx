import React from "react"
import Overview from "./Overview"
import SignMessage from "./SignMessage"
import DepositBTC from "./DepositBTC"

export function ActiveStakingStep({ activeStep }: { activeStep: number }) {
  switch (activeStep) {
    case 1:
      return <Overview />
    case 2:
      return <SignMessage />
    case 3:
      return <DepositBTC />
    default:
      return null
  }
}
