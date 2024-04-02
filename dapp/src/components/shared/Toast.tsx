import React from "react"
import { HStack } from "@chakra-ui/react"
import { Alert, AlertProps } from "./alerts"
import { TextSm } from "./Typography"

type ToastProps = {
  title: string
  subtitle?: string
} & Omit<AlertProps, "withIcon" | "withCloseButton" | "onClose"> & {
    onClose: () => void
  }

export default function Toast({
  title,
  subtitle,
  children,
  onClose,
  ...props
}: ToastProps) {
  return (
    <Alert onClose={onClose} withIcon withCloseButton {...props}>
      <HStack w="100%">
        <TextSm fontWeight="bold">{title}</TextSm>
        {subtitle && <TextSm>{subtitle}</TextSm>}
        {children}
      </HStack>
    </Alert>
  )
}
