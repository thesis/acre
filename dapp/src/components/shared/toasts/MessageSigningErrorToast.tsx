import React from "react"
import { TextSm } from "../Typography"
import { ToastBase } from "../alerts"

export function MessageSigningErrorToast({ onClose }: { onClose: () => void }) {
  return (
    <ToastBase
      status="error"
      title="Message signing interrupted."
      onClose={onClose}
    >
      <TextSm>Please try again.</TextSm>
    </ToastBase>
  )
}
