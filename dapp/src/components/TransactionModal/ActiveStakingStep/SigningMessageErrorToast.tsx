import React from "react"
import Toast from "#/components/shared/Toast"

export const TOAST_ID = "signing-error"

export default function SigningMessageErrorToast({
  onClose,
}: {
  onClose: () => void
}) {
  return (
    <Toast
      status="error"
      title="Message signing interrupted."
      subtitle="Please try again"
      onClose={onClose}
    />
  )
}
