import React from "react"
import { useAppNavigate } from "#/hooks"
import GateModal from "#/components/GateModal"

export default function AccessPage() {
  const navigate = useAppNavigate()

  return (
    <GateModal
      closeModal={() => {
        navigate("/dashboard")
      }}
    />
  )
}
