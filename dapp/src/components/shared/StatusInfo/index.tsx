import React from "react"
import { TransactionInfoStatus } from "#/types"
import { Box, Icon, TextProps, useMultiStyleConfig } from "@chakra-ui/react"
import { CompleteIcon, PendingIcon, SyncingIcon } from "#/assets/icons"

const DATA: Record<
  TransactionInfoStatus,
  { icon: typeof Icon; label: string; colorScheme: string }
> = {
  completed: { label: "Completed", icon: CompleteIcon, colorScheme: "green" },
  syncing: { label: "Syncing", icon: SyncingIcon, colorScheme: "blue" },
  pending: { label: "Pending", icon: PendingIcon, colorScheme: "brand" },
}

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
