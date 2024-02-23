import React from "react"
import { TransactionInfoStatus } from "#/types"
import { Box, Icon, TextProps, useMultiStyleConfig } from "@chakra-ui/react"
import { STATUS_DATA } from "./data"

type StatusInfoProps = {
  status: TransactionInfoStatus
  withDefaultColor?: boolean
  withIcon?: boolean
} & TextProps

// TODO: Update component for syncing status.
// Add a timer when the logic is ready.
export default function StatusInfo({
  status,
  withDefaultColor,
  withIcon,
  ...textProps
}: StatusInfoProps) {
  const data = STATUS_DATA[status]
  const styles = useMultiStyleConfig("StatusInfo", {
    ...(withDefaultColor && { colorScheme: data.colorScheme }),
  })

  return (
    <Box __css={styles.container}>
      {withIcon && <Icon as={data.icon} boxSize={5} />}
      <Box as="span" __css={styles.label} {...textProps}>
        {data.label}
      </Box>
    </Box>
  )
}
