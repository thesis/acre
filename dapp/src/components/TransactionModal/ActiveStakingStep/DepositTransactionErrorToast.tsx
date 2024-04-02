import React from "react"
import Toast from "#/components/shared/Toast"

export const TOAST_ID = "deposit-transaction-error"

export default function DepositTransactionErrorToast({
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
