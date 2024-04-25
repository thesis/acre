import React from "react"
import {
  Alert as ChakraAlert,
  AlertProps as ChakraAlertProps,
  Icon,
  CloseButton,
  HStack,
} from "@chakra-ui/react"
import { IconInfoCircle, IconExclamationCircle } from "@tabler/icons-react"

const ICONS = {
  info: IconInfoCircle,
  error: IconExclamationCircle,
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
        <Icon mr={2} boxSize={6} as={ICONS[status]} color={colorIcon} />
      )}
      <HStack w="100%" justifyContent="space-between">
        {children}
        {withCloseButton && <CloseButton onClick={onClose} />}
      </HStack>
    </ChakraAlert>
  )
}
