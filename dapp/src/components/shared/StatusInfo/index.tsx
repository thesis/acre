import React from "react"
import { TransactionInfoStatus } from "#/types"
import { Box, Icon, TextProps, useMultiStyleConfig } from "@chakra-ui/react"
import { Complete, Pending, Syncing } from "#/static/icons"

const DATA: Record<
  TransactionInfoStatus,
  { icon: typeof Icon; label: string; colorScheme: string }
> = {
  completed: { label: "Completed", icon: Complete, colorScheme: "green" },
  syncing: { label: "Syncing", icon: Syncing, colorScheme: "blue" },
  pending: { label: "Pending", icon: Pending, colorScheme: "brand" },
}

type StatusInfoProps = {
  status: TransactionInfoStatus
  withDefaultColor?: boolean
  withIcon?: boolean
} & TextProps

export default function StatusInfo({
  status,
  withDefaultColor,
  withIcon,
  ...textProps
}: StatusInfoProps) {
  const data = DATA[status]
  const styles = useMultiStyleConfig("StatusInfo", {
    ...(withDefaultColor && { colorScheme: data.colorScheme }),
  })

  return (
    <Box __css={styles.container} {...textProps}>
      {withIcon && <Icon as={data.icon} boxSize={5} />}
      <Box as="span" __css={styles.label}>
        {data.label}
      </Box>
    </Box>
  )
}
