import React from "react"
import { HStack, ListItem, ListItemProps, Text } from "@chakra-ui/react"

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
        <Text
          size="md"
          display="flex"
          alignItems="center"
          fontWeight="semibold"
          color="grey.700"
        >
          {label}
        </Text>
        {tooltip}
      </HStack>
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

export default FeesDetailsItem
