import React from "react"
import { useAppNavigate } from "#/hooks"
import GateModal from "#/components/GateModal"
import { featureFlags } from "#/constants"
import { Navigate } from "react-router-dom"

export default function AccessPage() {
  const navigate = useAppNavigate()

  return featureFlags.GATING_DAPP_ENABLED ? (
    <GateModal
      closeModal={() => {
        navigate("/dashboard")
      }}
    />
  ) : (
    <Navigate to="/welcome" />
  )
}
