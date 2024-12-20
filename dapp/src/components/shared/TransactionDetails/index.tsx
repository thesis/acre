import React from "react"
import { ListItem, ListItemProps, Text } from "@chakra-ui/react"

export type TransactionDetailsItemProps = {
  label: string
  value?: string
  children?: React.ReactNode
} & ListItemProps

function TransactionDetailsItem({
  label,
  value,
  children,
  ...listItemProps
}: TransactionDetailsItemProps) {
  return (
    <ListItem
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      {...listItemProps}
    >
      <Text size="md" fontWeight="semibold" color="grey.700">
        {label}
      </Text>
      {value ? (
        <Text size="md" color="grey.700">
          {value}
        </Text>
      ) : (
        children
      )}
    </ListItem>
  )
}

export default TransactionDetailsItem
