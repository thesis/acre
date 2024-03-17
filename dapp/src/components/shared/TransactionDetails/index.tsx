import React from "react"
import { ListItem, ListItemProps, VStack } from "@chakra-ui/react"
import { TextMd, TextSm } from "../Typography"

export type TransactionDetailsItemProps = {
  label: string
  sublabel?: string
  value?: string
  popover?: React.ReactElement
  children?: React.ReactNode
} & ListItemProps

function TransactionDetailsItem({
  label,
  sublabel,
  popover,
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
      <VStack alignItems="start" gap={0}>
        <TextMd fontWeight="semibold" color="grey.700">
          {label}
          {popover}
        </TextMd>
        {sublabel && <TextSm color="grey.400">{sublabel}</TextSm>}
      </VStack>
      {value ? <TextMd color="grey.700">{value}</TextMd> : children}
    </ListItem>
  )
}

export default TransactionDetailsItem
