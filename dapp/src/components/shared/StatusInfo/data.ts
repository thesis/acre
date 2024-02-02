import { CompleteIcon, SyncingIcon, PendingIcon } from "#/assets/icons"
import { TransactionInfoStatus } from "#/types"
import { Icon } from "@chakra-ui/react"

export const STATUS_DATA: Record<
  TransactionInfoStatus,
  { icon: typeof Icon; label: string; colorScheme: string }
> = {
  completed: { label: "Completed", icon: CompleteIcon, colorScheme: "green" },
  syncing: { label: "Syncing", icon: SyncingIcon, colorScheme: "blue" },
  pending: { label: "Pending", icon: PendingIcon, colorScheme: "brand" },
}
