import React from "react"
import { useModal } from "../../hooks"
import StakingOverviewModal from "../Modals/StakingOverviewModal"

export default function Staking() {
  const { modalType } = useModal()

  if (!modalType) return null

  if (modalType === "overview") return <StakingOverviewModal />
}
