import React from "react"
import { HStack, ListItem, ListItemProps } from "@chakra-ui/react"
import { TextMd } from "../Typography"

export type FeesDetailsItemProps = {
  label: string
  sublabel?: string
  value?: string
  tooltip: React.ReactElement
  children?: React.ReactNode
} & ListItemProps

function FeesDetailsItem({
  label,
  tooltip,
  value,
  children,
  ...listItemProps
}: FeesDetailsItemProps) {
  return (
    <ListItem
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      {...listItemProps}
    >
      <HStack alignItems="center" gap={2}>
        <TextMd
          display="flex"
          alignItems="center"
          fontWeight="semibold"
          color="text.primary"
        >
          {label}
        </TextMd>
        {tooltip}
      </HStack>
      {value ? <TextMd color="text.primary">{value}</TextMd> : children}
    </ListItem>
  )
}

export default FeesDetailsItem
