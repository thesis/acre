import React from "react"
import {
  Alert as ChakraAlert,
  AlertIcon,
  AlertProps as ChakraAlertProps,
} from "@chakra-ui/react"
import { AlertInfo } from "../../../static/icons"

const ICONS = {
  info: AlertInfo,
}

export type AlertStatus = keyof typeof ICONS

export type AlertProps = ChakraAlertProps & {
  status?: AlertStatus
  withIcon?: boolean
}

export default function Alert({
  status,
  withIcon = true,
  children,
  ...alertProps
}: AlertProps) {
  return (
    <ChakraAlert status={status} {...alertProps}>
      {withIcon && <AlertIcon as={status ? ICONS[status] : undefined} />}
      {children}
    </ChakraAlert>
  )
}
