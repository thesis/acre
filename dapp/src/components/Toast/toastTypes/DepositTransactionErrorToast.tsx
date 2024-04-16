import Toast from "#/components/shared/Toast"
import React from "react"

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
