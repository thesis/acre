import React from "react"
import {
  Alert as ChakraAlert,
  AlertIcon,
  AlertProps as ChakraAlertProps,
  Icon,
  CloseButton,
  HStack,
} from "@chakra-ui/react"
import { AlertError, AlertInfo } from "#/assets/icons"

const ICONS = {
  info: AlertInfo,
  error: AlertError,
}

type AlertStatus = keyof typeof ICONS

export type AlertProps = ChakraAlertProps & {
  status?: AlertStatus
  colorIcon?: string
  withIcon?: boolean
  withCloseButton?: boolean
  icon?: typeof Icon
  onClose?: () => void
}

export function Alert({
  status = "info",
  colorIcon,
  withIcon,
  children,
  withCloseButton,
  onClose,
  ...props
}: AlertProps) {
  return (
    <ChakraAlert status={status} {...props}>
      {withIcon && status && (
        <AlertIcon boxSize={6} as={ICONS[status]} color={colorIcon} />
      )}
      <HStack w="100%" justifyContent="space-between">
        {children}
        {withCloseButton && <CloseButton onClick={onClose} />}
      </HStack>
    </ChakraAlert>
  )
}
