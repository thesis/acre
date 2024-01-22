import React from "react"
import { useModalFlowContext } from "#/hooks"
import ModalBase from "#/components/shared/ModalBase"
import Overview from "./Overview"
import ActionForm from "../ActionForm"
import SignMessage from "./SignMessage"
import DepositBTC from "./DepositBTC"
import { STAKING_STEPS } from "./utils/stakingSteps"

function ActiveStakingStep() {
  const { activeStep, startTransactionProcess, endTransactionProcess } =
    useModalFlowContext()
  const { ACTION_FORM, OVERVIEW, SIGN_MESSAGE, DEPOSIT_BTC } = STAKING_STEPS

  switch (activeStep) {
    case ACTION_FORM:
      return <ActionForm action="stake" />
    case OVERVIEW:
      return <Overview />
    case SIGN_MESSAGE:
      startTransactionProcess()
      return <SignMessage />
    case DEPOSIT_BTC:
      return <DepositBTC />
    default:
      endTransactionProcess()
      return null
  }
}

export default function StakingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} numberOfSteps={4}>
      <ActiveStakingStep />
    </ModalBase>
  )
}
