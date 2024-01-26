import React from "react"
import {
  Alert as ChakraAlert,
  AlertIcon,
  AlertProps as ChakraAlertProps,
  Box,
  Icon,
  useMultiStyleConfig,
} from "@chakra-ui/react"
import { AlertInfo, ArrowUpRight } from "#/assets/icons"

const ICONS = {
  info: AlertInfo,
}

export type AlertStatus = keyof typeof ICONS

export type AlertProps = ChakraAlertProps & {
  status?: AlertStatus
  withAlertIcon?: boolean
  withActionIcon?: boolean
  icon?: typeof Icon
  onclick?: () => void
}

export default function Alert({
  status = "info",
  withAlertIcon = true,
  children,
  withActionIcon,
  icon = ArrowUpRight,
  onclick,
  ...alertProps
}: AlertProps) {
  const styles = useMultiStyleConfig("Alert")
  const paddingRight = withActionIcon ? { pr: 20 } : {}

  return (
    <ChakraAlert status={status} {...paddingRight} {...alertProps}>
      {withAlertIcon && status && <AlertIcon as={ICONS[status]} />}
      {children}
      {withActionIcon && (
        <Box __css={styles.rightIconContainer}>
          <Icon cursor="pointer" onClick={onclick} as={icon} />
        </Box>
      )}
    </ChakraAlert>
  )
}
