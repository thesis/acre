import React from "react"
import { HStack } from "@chakra-ui/react"
import { Alert, AlertProps } from "./Alert"
import { TextSm } from "../Typography"

type ToastProps = {
  title: string
} & Omit<AlertProps, "withAlertIcon" | "withCloseButton" | "onClose"> & {
    onClose: () => void
  }

export function Toast({ title, children, onClose, ...props }: ToastProps) {
  return (
    <Alert withAlertIcon withCloseButton onClose={onClose} {...props}>
      <HStack w="100%">
        <TextSm fontWeight="bold">{title}</TextSm>
        {children}
      </HStack>
    </Alert>
  )
}
