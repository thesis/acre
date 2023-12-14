import React from "react"
import { useModalFlowContext } from "../../hooks"
import StakeModal from "../Modals/StakeModal"
import StakingOverviewModal from "../Modals/StakingOverviewModal"
import ModalBase from "../shared/ModalBase"

function StakingModalSteps() {
  const { activeStep, goNext } = useModalFlowContext()

  switch (activeStep) {
    case 1:
      return <StakingOverviewModal goNext={goNext} />
    case 2:
      return <StakeModal goNext={goNext} />
    default:
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
    <ModalBase isOpen={isOpen} onClose={onClose} numberOfSteps={2}>
      <StakingModalSteps />
    </ModalBase>
  )
}
