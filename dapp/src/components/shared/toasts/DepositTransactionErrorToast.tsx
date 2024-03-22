import React from "react"
import { TextSm } from "../Typography"
import { ToastBase } from "../alerts"

export function DepositTransactionErrorToast({
  onClose,
}: {
  onClose: () => void
}) {
  return (
    <ToastBase
      status="error"
      title="Deposit transaction execution interrupted."
      onClose={onClose}
    >
      <TextSm>Please try again.</TextSm>
    </ToastBase>
  )
}
