import React from "react"
import { HStack } from "@chakra-ui/react"
import { Alert, AlertProps } from "./Alert"
import { TextSm } from "../Typography"

type ToastProps = {
  title: string
} & Omit<AlertProps, "withIcon" | "withCloseButton" | "onClose"> & {
    onClose: () => void
  }

export function Toast({ title, children, onClose, ...props }: ToastProps) {
  return (
    <Alert status="error" onClose={onClose} withIcon withCloseButton {...props}>
      <HStack w="100%">
        <TextSm fontWeight="bold">{title}</TextSm>
        {children}
      </HStack>
    </Alert>
  )
}
