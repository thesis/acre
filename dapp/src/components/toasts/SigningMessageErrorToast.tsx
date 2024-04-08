import React from "react"
import Toast from "../shared/Toast"

export function SigningMessageErrorToast({ onClose }: { onClose: () => void }) {
  return (
    <Toast
      status="error"
      title="Message signing interrupted."
      subtitle="Please try again"
      onClose={onClose}
    />
  )
}
