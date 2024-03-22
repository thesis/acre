import React from "react"
import { HStack } from "@chakra-ui/react"
import { Alert, AlertProps } from "./Alert"
import { TextSm } from "../Typography"

type ToastBaseProps = {
  title: string
} & Omit<AlertProps, "withIcon" | "withCloseButton" | "onClose"> & {
    onClose: () => void
  }

export function ToastBase({
  title,
  children,
  onClose,
  ...props
}: ToastBaseProps) {
  return (
    <Alert onClose={onClose} withIcon withCloseButton {...props}>
      <HStack w="100%">
        <TextSm fontWeight="bold">{title}</TextSm>
        {children}
      </HStack>
    </Alert>
  )
}
