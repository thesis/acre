import React from "react"
import { HStack } from "@chakra-ui/react"
import { TextSm } from "./Typography"
import Alert, { AlertProps } from "./Alert"

type ToastProps = {
  title: string
} & Omit<AlertProps, "withAlertIcon" | "withCloseButton" | "onClose"> & {
    onClose: () => void
  }

export default function Toast({
  title,
  children,
  onClose,
  ...props
}: ToastProps) {
  return (
    <Alert mt={16} withAlertIcon withCloseButton onClose={onClose} {...props}>
      <HStack>
        <TextSm fontWeight="bold">{title}</TextSm>
        {children}
      </HStack>
    </Alert>
  )
}
