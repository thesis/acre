import React from "react"
import Toast from "../shared/Toast"

export function DepositTransactionErrorToast({
  onClose,
}: {
  onClose: () => void
}) {
  return (
    <Toast
      status="error"
      title="Deposit transaction execution interrupted."
      subtitle="Please try again."
      onClose={onClose}
    />
  )
}
